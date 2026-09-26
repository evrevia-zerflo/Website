import asyncio
import json
import os
import re
import urllib.request
import uuid
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async
from input_urls import URLS

# Paths
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
IMAGES_DIR = os.path.join(FRONTEND_DIR, 'public', 'images', 'products')
MOCK_FILE = os.path.join(FRONTEND_DIR, 'src', 'data', 'mockProducts.js')

os.makedirs(IMAGES_DIR, exist_ok=True)

import sys

async def scrape_meesho():
    is_linux = sys.platform.startswith('linux')
    has_display = os.environ.get('DISPLAY') is not None
    is_headless = True if (is_linux and not has_display) else False
    
    if is_headless:
        print("Starting Playwright scraper in HEADLESS mode (No GUI detected).")
    else:
        print("Starting Playwright scraper. This will open a browser window on your laptop.")
        print("If you see a Captcha, please solve it manually in the browser window!")
    
    products = []
    
    async with async_playwright() as p:
        # Launch browser. Uses headless=True automatically on terminal-only Linux
        browser = await p.chromium.launch(headless=is_headless)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        await stealth_async(page)

        for subcategory, url_list in URLS.items():
            category = "Clothing"
            for url in url_list:
                    print(f"Scraping {url}...")
                    try:
                        await page.goto(url, timeout=30000)
                        await page.wait_for_selector('h1', timeout=15000)
                        
                        # Extract data
                        name = await page.locator('h1').inner_text()
                        
                        # Price extraction
                        try:
                            price_text = await page.locator('h4').nth(0).inner_text()
                            price = int(re.sub(r'[^0-9]', '', price_text))
                        except:
                            price = 999
                            
                        # Image extraction
                        image_urls = []
                        
                        try:
                            og_image = await page.locator('meta[property="og:image"]').get_attribute('content')
                            if og_image:
                                image_urls.append(og_image)
                        except:
                            pass
                        
                        if not image_urls:
                            images = await page.locator('img').all()
                            for img in images:
                                src = await img.get_attribute('src')
                                if src and ('meesho' in src or 'image' in src) and not src.endswith('.svg') and 'icon' not in src.lower() and 'logo' not in src.lower():
                                    src = src.replace('150', '512').replace('64', '512')
                                    if src not in image_urls:
                                        image_urls.append(src)
                        
                        # We only need the first 2-3 images
                        image_urls = image_urls[:3]
                        
                        local_image_paths = []
                        product_id = f"prod_{uuid.uuid4().hex[:8]}"
                        
                        for idx, img_url in enumerate(image_urls):
                            filename = f"{product_id}_{idx}.png"
                            filepath = os.path.join(IMAGES_DIR, filename)
                            try:
                                urllib.request.urlretrieve(img_url, filepath)
                                local_image_paths.append(f"/images/products/{filename}")
                                print(f"  Downloaded image: {filename}")
                            except Exception as e:
                                print(f"  Failed to download image {img_url}: {e}")
                        
                        if not local_image_paths:
                            print("  Skipping product, no images found.")
                            continue

                        product = {
                            "id": product_id,
                            "name": name,
                            "price": price,
                            "originalPrice": int(price * 1.5),
                            "category": category,
                            "subCategory": subcategory,
                            "description": f"Beautiful {name} perfect for any occasion.",
                            "features": ["Premium Quality", "Comfortable Fit", "Trendy Design"],
                            "images": local_image_paths,
                            "rating": 4.5,
                            "reviews": 120,
                            "stock": 50,
                            "sizes": ["S", "M", "L", "XL"] if "Clothing" in category else ["Free Size"],
                            "colors": [],
                            "isNew": True,
                            "isBestSeller": False,
                            "discount": 33
                        }
                        
                        products.append(product)
                        print(f"  Successfully extracted: {name}")
                        
                        # Delay to avoid getting blocked
                        await page.wait_for_timeout(3000)
                        
                    except Exception as e:
                        print(f"  Error scraping {url}: {e}")
                        
        await browser.close()
        
    if products:
        print(f"Scraped {len(products)} products. Updating mockProducts.js...")
        
        # We will append to or overwrite the file
        js_content = "export const MOCK_PRODUCTS = " + json.dumps(products, indent=2) + ";\n"
        with open(MOCK_FILE, 'w') as f:
            f.write(js_content)
        
        print("Done! mockProducts.js has been updated.")
    else:
        print("No products were scraped successfully.")

if __name__ == "__main__":
    asyncio.run(scrape_meesho())
