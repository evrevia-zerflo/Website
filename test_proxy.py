import httpx
from bs4 import BeautifulSoup
import re

url = "https://www-meesho-com.translate.goog/s/p/f7xki6?utm_source=s_cc&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-GB"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}

response = httpx.get(url, headers=headers)
print("STATUS:", response.status_code)

soup = BeautifulSoup(response.text, 'html.parser')

# Check title
print("TITLE:", soup.title.string if soup.title else "No Title")

# Check all images
images = []
for img in soup.find_all('img'):
    src = img.get('src') or img.get('data-src') or ""
    if 'meesho.com' in src or 'images' in src:
        images.append(src)
print("IMAGES:", len(images))
if images:
    print("FIRST FEW:", images[:3])
