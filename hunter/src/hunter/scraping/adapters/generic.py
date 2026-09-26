import json
import httpx
from typing import List, Dict, Any
from urllib.parse import urljoin
from bs4 import BeautifulSoup
from hunter.scraping.adapters.base import BaseSupplierAdapter
from hunter.utils.logger import logger

class GenericAdapter(BaseSupplierAdapter):
    def __init__(self, supplier):
        super().__init__(supplier)
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
        }

    async def discover(self, category: str, limit: int = 150) -> List[Dict[str, Any]]:
        if category not in self.supplier.category_map:
            logger.info(f"Supplier {self.supplier.name} doesn't carry {category}. Skipping.")
            return []

        urls_to_crawl = self.supplier.category_map[category]
        candidates = []
        
        async with httpx.AsyncClient(headers=self.headers, timeout=15.0, follow_redirects=True) as client:
            for list_url in urls_to_crawl:
                if len(candidates) >= limit:
                    break
                    
                logger.info(f"Crawling {list_url} for {self.supplier.name}")
                try:
                    resp = await client.get(list_url)
                    resp.raise_for_status()
                    
                    soup = BeautifulSoup(resp.text, 'html.parser')
                    links = soup.find_all('a', href=True)
                    
                    for link in links:
                        if len(candidates) >= limit:
                            break
                        
                        href = link.get('href')
                        if not href or href.startswith('#') or href.startswith('javascript'):
                            continue
                            
                        full_url = urljoin(self.supplier.base_url, href)
                        title = link.get_text(strip=True)
                        
                        # Generic heuristic: look for product paths or long slugs
                        is_product = False
                        if '/product/' in href or '/p/' in href or '?product' in href or '/shop/' in href or '/item/' in href:
                            is_product = True
                        elif len(href.split('/')) > 2 and '-' in href: # likely a product slug
                            is_product = True
                        elif href.endswith('.html') or href.endswith('.php'):
                            is_product = True
                            
                        if is_product and title:
                            # Avoid duplicates
                            if not any(c["url"] == full_url for c in candidates):
                                candidates.append({
                                    "url": full_url,
                                    "title": title,
                                    "rank_position": len(candidates) + 1
                                })
                except Exception as e:
                    logger.error(f"Error during discovery for {self.supplier.name}: {e}")
                    
        return candidates

    async def extract_product(self, url: str) -> Dict[str, Any]:
        data = {"url": url, "supplier": self.supplier.id, "extracted_by_ai": False}
        
        try:
            logger.debug(f"Extracting product details from {url}")
            async with httpx.AsyncClient(headers=self.headers, timeout=15.0, follow_redirects=True) as client:
                resp = await client.get(url)
                resp.raise_for_status()
                
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            # 1. JSON-LD Extraction
            json_ld_tags = soup.find_all('script', type='application/ld+json')
            for tag in json_ld_tags:
                try:
                    schema = json.loads(tag.string, strict=False)
                    schemas = schema if isinstance(schema, list) else [schema]
                    for s in schemas:
                        if s.get('@type') == 'Product' or s.get('@type') == 'ItemPage':
                            data['title'] = s.get('name', '')
                            data['description'] = s.get('description', '')
                            
                            offers = s.get('offers', {})
                            if isinstance(offers, dict):
                                data['price'] = offers.get('price')
                                data['availability'] = offers.get('availability', '')
                            elif isinstance(offers, list) and offers:
                                data['price'] = offers[0].get('price')
                                data['availability'] = offers[0].get('availability', '')
                                
                            images = s.get('image', [])
                            if isinstance(images, str):
                                data['images'] = [images]
                            else:
                                data['images'] = images
                except Exception:
                    pass

            # 2. OG/Meta extraction
            if not data.get('title'):
                og_title = soup.find('meta', property='og:title')
                if og_title:
                    data['title'] = og_title.get('content')
            
            if not data.get('price'):
                og_price = soup.find('meta', property='product:price:amount')
                if og_price:
                    data['price'] = float(og_price.get('content', 0))
                    
            if not data.get('description'):
                desc_meta = soup.find('meta', attrs={'name': 'description'}) or soup.find('meta', property='og:description')
                if desc_meta:
                    data['description'] = desc_meta.get('content')
                else:
                    # Generic fallback: Look for elements with 'description' in class or id
                    import re
                    desc_elem = soup.find(class_=re.compile("desc|details", re.I))
                    if desc_elem:
                        data['description'] = desc_elem.get_text(separator=" | ", strip=True)[:1000] # Cap length to 1000 chars

            # Review detection defaults
            data['has_reviews'] = False
            data['no_reviews_confirmed'] = False
            data['reviews_not_extractable'] = True
            
        except Exception as e:
            logger.error(f"Error extracting {url}: {e}")
            
        return data

    async def health_check(self) -> bool:
        return True
