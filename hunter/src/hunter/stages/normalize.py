import re
from typing import List, Dict, Any
from hunter.utils.logger import logger

def clean_price(price_val: Any) -> float:
    if isinstance(price_val, (int, float)):
        return float(price_val)
    if not price_val:
        return 0.0
        
    s = str(price_val).replace(',', '')
    match = re.search(r'\d+(\.\d+)?', s)
    if match:
        return float(match.group())
    return 0.0

def run_normalize(raw_products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    logger.info("Running normalization on extracted data")
    normalized = []
    
    for raw in raw_products:
        try:
            price = clean_price(raw.get('price'))
            
            norm = {
                "product_id": raw.get("url"), # Placeholder stable ID
                "supplier": raw.get("supplier"),
                "canonical_url": raw.get("url"),
                "title": raw.get("title", "").strip(),
                "description": raw.get("description", "").strip(),
                "price": price,
                "mrp": clean_price(raw.get("mrp")),
                "price_hidden": raw.get("price_hidden", False),
                "availability": raw.get("availability", ""),
                "images": raw.get("images", []),
                "rank_position": raw.get("rank_position", 0)
            }
            normalized.append(norm)
        except Exception as e:
            logger.error(f"Error normalizing product {raw.get('url')}: {e}")
            
    return normalized
