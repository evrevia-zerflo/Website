import asyncio
from typing import Optional
from hunter.config import config
from hunter.utils.logger import logger
import httpx

try:
    from playwright.async_api import async_playwright, Browser, BrowserContext, Page
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    logger.warning("Playwright not available. Falling back to HTTP requests.")
    Page = Any = object

class BrowserManager:
    def __init__(self):
        self._playwright = None
        self._browser = None
        self._context = None
        
    async def start(self, headed: bool = False):
        if not PLAYWRIGHT_AVAILABLE:
            return
            
        logger.info("Starting browser manager...")
        self._playwright = await async_playwright().start()
        
        launch_args = {
            "headless": not headed if headed else config.settings.playwright.headless,
            "args": ["--disable-blink-features=AutomationControlled"]
        }
        if config.settings.playwright.executable_path:
            launch_args["executable_path"] = config.settings.playwright.executable_path

        self._browser = await self._playwright.chromium.launch(**launch_args)
        
        self._context = await self._browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080}
        )
        logger.info("Browser manager started.")

    async def new_page(self):
        if not PLAYWRIGHT_AVAILABLE:
            raise NotImplementedError("Playwright is not available.")
        if not self._context:
            raise RuntimeError("BrowserManager not started.")
        page = await self._context.new_page()
        await page.route("**/*.{woff,woff2,ttf,otf,mp4,webm,avif}", lambda route: route.abort())
        return page

    async def stop(self):
        if not PLAYWRIGHT_AVAILABLE:
            return
        logger.info("Stopping browser manager...")
        if self._context:
            await self._context.close()
        if self._browser:
            await self._browser.close()
        if self._playwright:
            await self._playwright.stop()
        logger.info("Browser manager stopped.")

browser_manager = BrowserManager()
