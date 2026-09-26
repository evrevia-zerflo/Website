from hunter.config import config
from hunter.utils.logger import logger

def calculate_estimated_margin(supplier_price: float, market_median: float = None, category: str = None) -> dict:
    """Calculate estimated margin and potential sell price."""
    cat_config = config.categories.get(category)
    shipping_buffer = cat_config.shipping_buffer_inr if cat_config else 100
    
    if market_median and market_median > 0:
        potential_sell_price = market_median
        has_market_data = True
    else:
        # Default markup if no market data (e.g. 2.5x)
        potential_sell_price = supplier_price * 2.5
        has_market_data = False
        
    margin_value = potential_sell_price - supplier_price - shipping_buffer
    
    # Very rough estimate of other costs (10% of sell price)
    other_costs = 0.10 * potential_sell_price
    net_margin_value = margin_value - other_costs
    
    est_margin_pct = (net_margin_value / potential_sell_price) * 100 if potential_sell_price > 0 else 0
    
    return {
        "potential_sell_price": round(potential_sell_price, 2),
        "est_margin_pct": round(est_margin_pct, 2),
        "has_market_data": has_market_data
    }
