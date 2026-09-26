from typing import List, Dict, Any
from hunter.utils.logger import logger

def run_data_quality_gate(products: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Categorizes products into ACTIVE, PRICE_LOCKED, and REJECTED.
    """
    logger.info(f"Running data quality gate on {len(products)} extracted products")
    result = {
        "ACTIVE": [],
        "PRICE_LOCKED": [],
        "REJECTED": []
    }
    
    for p in products:
        url = p.get("canonical_url", "") or p.get("url", "")
        price = p.get("price", 0)
        images = p.get("images", [])
        price_hidden = p.get("price_hidden", False)
        
        if not url:
            logger.debug(f"Quality gate fail (NO_URL)")
            result["REJECTED"].append(p)
            continue
            
        if not images:
            logger.debug(f"Quality gate fail (NO_IMAGES): {url}")
            result["REJECTED"].append(p)
            continue
            
        if price_hidden or price <= 0:
            logger.debug(f"Quality gate (PRICE_LOCKED): {url}")
            result["PRICE_LOCKED"].append(p)
            continue
            
        # Basic validation passed
        result["ACTIVE"].append(p)
        
    logger.info(f"Data quality gate complete. {len(result['ACTIVE'])} ACTIVE, {len(result['PRICE_LOCKED'])} PRICE_LOCKED, {len(result['REJECTED'])} REJECTED.")
    return result
