from typing import Dict, Any, List
from hunter.config import config
from hunter.analysis.margin import calculate_estimated_margin
from hunter.utils.logger import logger

def score_product(product: Dict[str, Any], market_median: float = None) -> Dict[str, Any]:
    """Computes the rule-based MVP score components and total."""
    category = product.get("category_label")
    cat_config = config.categories.get(category)
    
    # 1. Price and Margin (Weight 25)
    margin_data = calculate_estimated_margin(
        supplier_price=product.get("price", 0), 
        market_median=market_median, 
        category=category
    )
    product["margin_data"] = margin_data
    
    margin_pct = margin_data["est_margin_pct"]
    min_margin = cat_config.min_margin_pct if cat_config else 15
    ideal_margin = cat_config.ideal_margin_pct if cat_config else 40
    
    if margin_pct < min_margin:
        price_score = 0
    elif margin_pct >= ideal_margin:
        price_score = 25
    else:
        # Linear between min and ideal
        fraction = (margin_pct - min_margin) / (ideal_margin - min_margin)
        price_score = 25 * fraction
        
    # 2. Demand & Interest (Weight 20)
    # Without API data, use rank_position and any extracted reviews/badges
    demand_score = 10 # Default neutral
    rank = product.get("rank_position", 150)
    if rank < 10:
        demand_score += 5
    elif rank > 100:
        demand_score -= 5
        
    if product.get("review_count", 0) > 5:
        demand_score += 5
        
    demand_score = max(0, min(20, demand_score))
    
    # 3. Availability (Weight 5)
    avail_score = 5
    if "low" in product.get("availability", "").lower():
        avail_score = 2
        
    # Penalties
    penalties = 0
    warnings = []
    
    if not margin_data["has_market_data"]:
        warnings.append("NO_MARKET_DATA")
        
    if margin_pct < min_margin:
        penalties += config.scoring.penalties.get("THIN_MARGIN", 15)
        warnings.append("THIN_MARGIN")
        
    total = price_score + demand_score + avail_score - penalties
    total = max(0, min(100, total))
    
    # Confidence
    confidence = "Low"
    if margin_data["has_market_data"] and product.get("review_count", 0) > 0:
        confidence = "High"
    elif margin_data["has_market_data"]:
        confidence = "Medium"
        
    return {
        "components": {
            "price_score": round(price_score, 2),
            "demand_score": round(demand_score, 2),
            "avail_score": round(avail_score, 2)
        },
        "penalties": penalties,
        "total": round(total, 2),
        "confidence": confidence,
        "warnings": warnings
    }

def apply_diversity_and_select(scored_products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Select top 5 honoring diversity rules."""
    # Sort by total score descending
    sorted_prods = sorted(scored_products, key=lambda x: x.get("score", {}).get("total", 0), reverse=True)
    
    selected = []
    skipped = []
    supplier_counts = {}
    
    max_per_supplier = config.scoring.diversity.get("max_per_supplier_in_top_5", 2)
    
    # Pass 1: Strict diversity
    for p in sorted_prods:
        if len(selected) >= 5:
            break
            
        sup = p.get("supplier")
        if supplier_counts.get(sup, 0) >= max_per_supplier:
            skipped.append(p)
            continue
            
        selected.append(p)
        supplier_counts[sup] = supplier_counts.get(sup, 0) + 1
        
    # Pass 2: Relax constraints if we have less than 5
    if len(selected) < 5 and skipped:
        for p in skipped:
            if len(selected) >= 5:
                break
            selected.append(p)
            
    return selected
