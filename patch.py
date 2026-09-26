import re
with open("hunter/scraper_playwright.py", "r") as f:
    code = f.read()

# Add stealth import
if "from playwright_stealth import stealth_async" not in code:
    code = code.replace("from playwright.async_api import async_playwright", "from playwright.async_api import async_playwright\nfrom playwright_stealth import stealth_async")

# Add stealth to context page
if "await stealth_async(page)" not in code:
    code = code.replace("page = await context.new_page()", "page = await context.new_page()\n        await stealth_async(page)")

with open("hunter/scraper_playwright.py", "w") as f:
    f.write(code)
