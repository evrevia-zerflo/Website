from typing import List, Dict, Any
from hunter.config import config
from hunter.scraping.adapters.reference import GenericReferenceAdapter
from hunter.utils.logger import logger

async def run_market_comparison(shortlisted_products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    logger.info(f"Running market comparison for {len(shortlisted_products)} products")
    
    active_sources = [s for s in config.comparison_sources if s.enabled]
    if not active_sources:
        logger.warning("No comparison sources enabled.")
        return shortlisted_products
        
    for product in shortlisted_products:
        query = product.get("title", "")
        # Strip long titles for better search results
        query = " ".join(query.split()[:5])
        
        all_results = []
        for source in active_sources:
            adapter = GenericReferenceAdapter(source)
            res = await adapter.search(query)
            all_results.extend(res)
            
        if all_results:
            prices = [r["price"] for r in all_results if "price" in r]
            if prices:
                prices.sort()
                median = prices[len(prices)//2]
                product["market_median"] = median
            else:
                product["market_median"] = None
        else:
            product["market_median"] = None
            
    return shortlisted_products
