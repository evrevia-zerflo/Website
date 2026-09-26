from typing import List, Dict, Any
from hunter.config import config
from hunter.scraping.extractors import get_adapter
from hunter.utils.logger import logger

async def run_detail_extraction(candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    logger.info(f"Starting detail extraction for {len(candidates)} candidates")
    extracted_data = []
    
    # Simple sequential extraction for now.
    # In a full run, this should use asyncio.gather with a semaphore.
    for idx, candidate in enumerate(candidates):
        url = candidate["url"]
        supplier_id = url.split("://")[1].split("/")[0] # Rough domain
        
        # Find supplier config
        supplier_config = next((s for s in config.suppliers if s.base_url.split("://")[1].strip("/") in url), None)
        
        if not supplier_config:
            logger.warning(f"Could not find supplier for {url}, skipping.")
            continue
            
        adapter = get_adapter(supplier_config)
        data = await adapter.extract_product(url)
        data["rank_position"] = candidate.get("rank_position", idx)
        
        extracted_data.append(data)
        
    return extracted_data
