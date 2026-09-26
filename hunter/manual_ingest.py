import asyncio
import json
import os
import re
import uuid
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse

# Ensure we're running from the hunter dir or evrevia root
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from input_urls import URLS

from dotenv import load_dotenv
load_dotenv(".env")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

def get_proxy_url(url: str) -> str:
    parsed = urlparse(url)
    if "meesho.com" in parsed.netloc and "translate.goog" not in parsed.netloc:
        proxy_netloc = parsed.netloc.replace(".", "-") + ".translate.goog"
        proxy_url = f"{parsed.scheme}://{proxy_netloc}{parsed.path}"
        qs = parsed.query
        new_qs = f"{qs}&" if qs else ""
        new_qs += "_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-GB"
        return f"{proxy_url}?{new_qs}"
    return url

async def fetch_meesho(url: str):
    proxy_url = get_proxy_url(url)
    try:
        proc = await asyncio.create_subprocess_exec(
            'curl', '-L', '-s', '-H', f'User-Agent: {USER_AGENT}', proxy_url,
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await proc.communicate()
        if proc.returncode == 0 and len(stdout) > 100:
            return stdout.decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
    return None

async def enhance_with_gemini(title, description, subcategory):
    if not GEMINI_API_KEY:
        return title, description
        
    prompt = f"""
    You are an expert luxury fashion copywriter for EVRÉVIA.
    Rewrite this product title and description to sound premium, elegant, and attractive.
    The category is {subcategory}.
    
    Original Title: {title}
    Original Description: {description}
    
    Return ONLY a JSON object with 'title' and 'description' keys. Do not include markdown formatting or backticks.
    Example: {{"title": "Elegant Black Dress", "description": "A stunning black dress crafted from premium silk."}}
    """
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7}
    }
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(url, json=payload, timeout=30.0)
            data = resp.json()
            text = data['candidates'][0]['content']['parts'][0]['text']
            
            # clean backticks if model returned them
            if text.startswith("```json"):
                text = text.replace("```json", "", 1)
            text = text.replace("```", "").strip()
                
            res = json.loads(text)
            return res.get('title', title), res.get('description', description)
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return title, description

async def download_image(url, filepath):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, timeout=20.0)
            if resp.status_code == 200:
                with open(filepath, 'wb') as f:
                    f.write(resp.content)
                return True
        except Exception as e:
            print(f"Image download error {url}: {e}")
    return False

async def process_product(url, category):
    html = await fetch_meesho(url)
    if not html:
        return None
        
    soup = BeautifulSoup(html, 'html.parser')
    next_data_script = soup.find('script', id='__NEXT_DATA__')
    
    title = ""
    description = ""
    price = 0
    mrp = 0
    images = []
    
    # Try parsing __NEXT_DATA__
    if next_data_script and next_data_script.string:
        state_str = next_data_script.string
        if price_match := re.search(r'"price"\s*:\s*(\d+)', state_str):
            price = float(price_match.group(1))
        if mrp_match := re.search(r'"mrp"\s*:\s*(\d+)', state_str):
            mrp = float(mrp_match.group(1))
            
        img_matches = re.findall(r'"(https://images\.meesho\.com/[^"]+)"', state_str)
        if img_matches:
            images = list(set(img_matches))
            # Sort to prefer larger images (512x512 over 64x64)
            images.sort(key=lambda x: '512' in x, reverse=True)
            
    # Try json_ld
    json_ld_tags = soup.find_all('script', type='application/ld+json')
    for tag in json_ld_tags:
        try:
            schema = json.loads(tag.string, strict=False)
            schemas = schema if isinstance(schema, list) else [schema]
            for s in schemas:
                if s.get('@type') in ['Product', 'ItemPage']:
                    if not title: title = s.get('name', '')
                    if not description: description = s.get('description', '')
                    if not price:
                        offers = s.get('offers', {})
                        if isinstance(offers, dict):
                            price = float(offers.get('price', 0))
                    imgs = s.get('image', [])
                    if isinstance(imgs, str):
                        images.append(imgs)
                    elif isinstance(imgs, list):
                        images.extend(imgs)
        except:
            pass
            
    if not title:
        og = soup.find('meta', property='og:title')
        title = og['content'] if og else "EVRÉVIA Product"
        
    if not description:
        og = soup.find('meta', property='og:description')
        description = og['content'] if og else "Premium quality."
        
    if price == 0:
        return None # Failed to extract price
        
    images = list(set(images))
    if not images:
        return None
        
    # Pick top image
    img_url = images[0]
    
    # Enhance content
    enhanced_title, enhanced_desc = await enhance_with_gemini(title, description, category)
    
    product_id = "prod_" + str(uuid.uuid4())[:8]
    img_filename = f"{product_id}.webp"
    img_path = os.path.join("..", "frontend", "public", "images", "products", img_filename)
    
    # Download image
    success = await download_image(img_url, img_path)
    if not success:
        return None
        
    # Determine top category based on subcategory provided
    main_cat = "Clothing"
    
    return {
        "id": product_id,
        "name": enhanced_title,
        "price": price,
        "originalPrice": mrp if mrp > price else int(price * 1.5),
        "category": main_cat,
        "subCategory": category,
        "description": enhanced_desc,
        "features": ["Premium Fabric", "Comfort Fit", "Durable Stitching"],
        "care": ["Machine Wash Cold", "Tumble Dry Low", "Do not bleach"],
        "materials": "Cotton Blend",
        "stock": 50,
        "rating": 4.5,
        "reviews": 12,
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Black", "White", "Navy"], # Mocked colors for now
        "image": f"/images/products/{img_filename}",
        "gallery": [f"/images/products/{img_filename}"],
        "isNewArrival": False,
        "isBestSeller": False
    }

async def main():
    results = []
    total = sum(len(urls) for urls in URLS.values())
    processed = 0
    
    for category, urls in URLS.items():
        print(f"\\nProcessing category: {category} ({len(urls)} items)")
        for url in urls:
            processed += 1
            print(f"[{processed}/{total}] {url}")
            prod = await process_product(url, category)
            if prod:
                results.append(prod)
                print(f" -> Success: {prod['name']}")
            else:
                print(f" -> Failed extraction.")
                
            await asyncio.sleep(2) # rate limit
            
    # Save to JSON
    with open("ingested_products.json", "w") as f:
        json.dump(results, f, indent=2)
        
    print(f"\\nCompleted! Successfully ingested {len(results)} products.")

if __name__ == "__main__":
    asyncio.run(main())
