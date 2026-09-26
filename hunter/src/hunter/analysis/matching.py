from rapidfuzz import fuzz
from typing import Dict, Any

def is_same_product(p1: Dict[str, Any], p2: Dict[str, Any]) -> bool:
    """Check if two products are the same based on title and pHash."""
    # Placeholder for imagehash comparison
    phash1 = p1.get("image_phash")
    phash2 = p2.get("image_phash")
    
    # If both have phashes, compare them (hamming distance)
    # This requires full image downloading which we are skipping for MVP.
    
    # Text fallback
    title1 = p1.get("title", "").lower()
    title2 = p2.get("title", "").lower()
    
    if not title1 or not title2:
        return False
        
    similarity = fuzz.token_sort_ratio(title1, title2)
    return similarity > 85
