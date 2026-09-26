from typing import List, Dict, Any
from hunter.config import config
from hunter.utils.logger import logger

def passes_prefilter(product: Dict[str, Any], category: str) -> bool:
    cat_config = config.categories.get(category)
    if not cat_config:
        return False
        
    # Check price
    price = product.get("price")
    if price is not None:
        if price < cat_config.min_price or price > cat_config.max_price:
            logger.debug(f"Prefilter fail (price): {product.get('url')} - {price}")
            return False
        
    # Check availability
    avail = product.get("availability")
    if avail:
        avail = avail.lower()
        if "out" in avail or "outofstock" in avail:
            logger.debug(f"Prefilter fail (stock): {product.get('url')}")
            return False
        
    # Check category keywords in title/url
    text_to_check = (product.get("title", "") + " " + product.get("url", "")).lower()
    
    # Excludes (fail fast) - Check only the title to avoid domain name false positives (like amrahwholesale.com)
    title_to_check = product.get("title", "").lower()
    if any(excl.lower() in title_to_check for excl in cat_config.exclude_keywords):
        logger.debug(f"Prefilter fail (exclude keyword): {product.get('url')}")
        return False
        
    # Includes (must have at least one)
    if not any(incl.lower() in text_to_check for incl in cat_config.include_keywords):
        logger.debug(f"Prefilter fail (no include keyword): {product.get('url')}")
        return False
        
    return True

def run_prefilter(products: List[Dict[str, Any]], category: str) -> List[Dict[str, Any]]:
    logger.info(f"Running pre-filter on {len(products)} products for category {category}")
    survivors = []
    
    for p in products:
        if passes_prefilter(p, category):
            survivors.append(p)
            
    logger.info(f"Pre-filter complete. {len(survivors)} passed.")
    return survivors
