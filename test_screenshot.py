import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        await page.goto("https://www.meesho.com/s/p/f7xki6?utm_source=s_cc")
        await page.wait_for_timeout(5000)
        
        images = await page.locator('img').all()
        for img in images:
            src = await img.get_attribute('src')
            print("FOUND IMG SRC:", src)
            
        await page.screenshot(path="meesho_debug.png")
        await browser.close()

asyncio.run(main())
