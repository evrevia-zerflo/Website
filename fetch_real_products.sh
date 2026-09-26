#!/usr/bin/env bash

echo "================================================"
echo "    EVRÉVIA - Real Product Scraper (Laptop)     "
echo "================================================"
echo "This script will open a real browser window to scrape Meesho."
echo "If Meesho asks for a Captcha, please solve it manually in the browser!"
echo ""

# Check if Python is installed
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "ERROR: Python is not installed. Please install Python 3.10+ to run this."
    exit 1
fi

PYTHON_CMD="python"
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
fi

# Create a virtual environment if it doesn't exist
if [ ! -d "hunter/venv" ]; then
    echo "Creating Python virtual environment..."
    $PYTHON_CMD -m venv hunter/venv
fi

# Activate virtual environment
if [ -f "hunter/venv/Scripts/activate" ]; then
    source hunter/venv/Scripts/activate
else
    source hunter/venv/bin/activate
fi

echo "Installing required packages (Playwright, bs4)..."
pip install --upgrade pip > /dev/null
pip install playwright httpx beautifulsoup4 > /dev/null

echo "Installing Playwright system dependencies (Ubuntu/Debian)..."
# In case sudo is needed but missing in a root proot, this will still run apt-get.
playwright install-deps chromium || echo "Warning: Could not automatically install system dependencies. If chromium fails to launch, run 'apt-get update && apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgbm1 libasound2 libpangocairo-1.0-0 libxss1 libgtk-3-0'"

echo "Installing Playwright browsers (this may take a minute if it's the first time)..."
playwright install chromium

echo ""
echo "Starting the Scraper..."
cd hunter
python scraper_playwright.py
cd ..

echo ""
echo "Done! If successful, the products have been added to the website."
echo "You can now run ./run.sh to preview the website!"
