import re
import httpx
from typing import Dict, Any, List
from bs4 import BeautifulSoup
from hunter.scraping.adapters.generic import GenericAdapter
from hunter.utils.logger import logger

class OnlineKurtisAdapter(GenericAdapter):
    async def extract_product(self, url: str) -> Dict[str, Any]:
        data = {"url": url, "supplier": self.supplier.id, "extracted_by_ai": False}
        try:
            logger.debug(f"Extracting product details from {url}")
            async with httpx.AsyncClient(headers=self.headers, timeout=15.0, follow_redirects=True) as client:
                resp = await client.get(url)
                resp.raise_for_status()
                html = resp.text
                
            soup = BeautifulSoup(html, "html.parser")
            
            # Title
            title_elem = soup.select_one("h1.ok-h3")
            data["title"] = title_elem.get_text(strip=True) if title_elem else ""
            
            # Price
            price = 0.0
            price_hidden = False
            price_elem = soup.select_one(".ok-pdp__now")
            mrp_elem = soup.select_one(".ok-mrp")
            
            mrp = 0.0
            for elem in [price_elem, mrp_elem]:
                if elem:
                    text = elem.get_text(strip=True)
                    match = re.search(r'[\d,]+', text)
                    if match:
                        mrp = float(match.group(0).replace(',', ''))
                        break
                        
            data["mrp"] = mrp
            data["price"] = mrp # User explicitly requested using MRP as the primary price
            data["price_hidden"] = False # Prevent PRICE_LOCKED
            
            # Images
            images = []
            img_elems = soup.select(".ok-pdp__gimg")
            for img in img_elems:
                src = img.get("src") or img.get("data-src")
                if src:
                    if not src.startswith("http"):
                        src = self.supplier.base_url.rstrip("/") + src
                    images.append(src)
                    
            if not images:
                import json
                for script in soup.find_all("script", type="application/ld+json"):
                    try:
                        ld_data = json.loads(script.string, strict=False)
                        if ld_data.get("@type") == "Product":
                            if "image" in ld_data:
                                if isinstance(ld_data["image"], list):
                                    images.extend(ld_data["image"])
                                elif isinstance(ld_data["image"], str):
                                    images.append(ld_data["image"])
                            if "description" in ld_data and "description" not in data:
                                data["description"] = ld_data["description"]
                    except:
                        pass
            data["images"] = list(set(images))
            
            # Description from HTML if JSON-LD didn't catch it
            if "description" not in data:
                desc_elem = soup.select_one(".ok-pdp__desc, .product-details, #description, .description")
                if desc_elem:
                    data["description"] = desc_elem.get_text(separator=" | ", strip=True)
                    
            if "description" not in data:
                desc_meta = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", property="og:description")
                if desc_meta:
                    data["description"] = desc_meta.get("content")
            
            # Availability
            availability = "InStock"
            status_elem = soup.select_one(".ok-status__ok")
            if status_elem and "out" in status_elem.get_text(strip=True).lower():
                availability = "OutOfStock"
            data["availability"] = availability
            
            # Variants
            variants = []
            size_elems = soup.select(".ok-size__label")
            for s in size_elems:
                variants.append(s.get_text(strip=True))
            data["variants"] = variants
            
        except Exception as e:
            logger.error(f"Error extracting {url}: {e}")
            
        return data
