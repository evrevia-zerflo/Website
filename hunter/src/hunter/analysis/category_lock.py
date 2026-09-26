from typing import List, Dict, Any
from hunter.config import config
from hunter.utils.logger import logger

def verify_category_rules_only(product: Dict[str, Any], category: str) -> str:
    """Returns 'pass', 'fail', or 'unsure' based on rules only."""
    cat_config = config.categories.get(category)
    if not cat_config:
        return "fail"
        
    text_to_check = (product.get("title", "") + " " + str(product.get("description", ""))).lower()
    
    # If it contains an exclude keyword, hard fail
    if any(excl.lower() in text_to_check for excl in cat_config.exclude_keywords):
        return "fail"
        
    # If it strongly matches include keywords, pass
    match_count = sum(1 for incl in cat_config.include_keywords if incl.lower() in text_to_check)
    if match_count >= 2:
        return "pass"
        
    if match_count == 1:
        return "unsure"
        
    return "fail"

def run_category_verification(products: List[Dict[str, Any]], category: str) -> List[Dict[str, Any]]:
    logger.info(f"Running category verification for {category}")
    verified = []
    cat_config = config.categories.get(category)
    
    for p in products:
        status = verify_category_rules_only(p, category)
        
        if status == "pass":
            p["category_label"] = category
            verified.append(p)
        elif status == "unsure":
            # In MVP (no AI), we use the unsure_policy
            policy = cat_config.unsure_policy if cat_config else "reject"
            if policy == "pass":
                p["category_label"] = category
                verified.append(p)
            else:
                logger.debug(f"Category verification rejected unsure product: {p.get('url')}")
        else:
            logger.debug(f"Category verification failed: {p.get('url')}")
            
    logger.info(f"Category verification complete. {len(verified)} passed.")
    return verified

def output_validator(selected_products: List[Dict[str, Any]], category: str) -> List[Dict[str, Any]]:
    """Hard guarantee that all final selected products match the category."""
    valid = []
    cat_config = config.categories.get(category)
    
    for p in selected_products:
        # Check that it has the correct category label
        if p.get("category") != category and p.get("category_label") != category:
            logger.error(f"Output validator caught off-category item: {p.get('url')}")
            continue
            
        # Hard check against exclude keywords one last time
        text_to_check = (p.get("title", "") + " " + p.get("url", "")).lower()
        if any(excl.lower() in text_to_check for excl in cat_config.exclude_keywords):
            logger.error(f"Output validator caught exclude keyword violation: {p.get('url')}")
            continue
            
        valid.append(p)
        
    return valid
