from typing import List, Dict, Any
from sqlalchemy.orm import Session
from hunter.config import config
from hunter.scraping.extractors import get_adapter
from hunter.utils.logger import logger

async def run_discovery(category: str) -> List[Dict[str, Any]]:
    logger.info(f"Starting discovery for category: {category}")
    all_candidates = []
    
    limit = config.settings.limits.max_products_per_supplier
    
    for supplier_config in config.suppliers:
        if not supplier_config.enabled:
            continue
            
        adapter = get_adapter(supplier_config)
        logger.info(f"Running discovery for supplier: {supplier_config.name}")
        candidates = await adapter.discover(category, limit=limit)
        all_candidates.extend(candidates)
        logger.info(f"Found {len(candidates)} candidates from {supplier_config.name}")
        
    return all_candidates
