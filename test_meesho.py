import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        await page.goto("https://www.meesho.com/s/p/f7xki6?utm_source=s_cc", timeout=30000)
        await page.wait_for_selector('h1', timeout=15000)
        print("H1 TEXT:", await page.locator('h1').inner_text())
        await browser.close()
asyncio.run(main())
