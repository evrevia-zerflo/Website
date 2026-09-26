import asyncio
from playwright.async_api import async_playwright
import re

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={'width': 1920, 'height': 1080}
        )
        page = await context.new_page()
        
        # Apply basic stealth script
        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
            window.chrome = { runtime: {} };
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        """)

        await page.goto("https://www.meesho.com/s/p/f7xki6?utm_source=s_cc", timeout=30000)
        await page.wait_for_timeout(3000)
        
        og_image = None
        try:
            og_image = await page.locator('meta[property="og:image"]').get_attribute('content')
            print("FOUND OG IMAGE:", og_image)
        except Exception as e:
            print("OG Image failed:", e)
            
        print("H1 TEXT:", await page.locator('h1').inner_text())
        await browser.close()
asyncio.run(main())
