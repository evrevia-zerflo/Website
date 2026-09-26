from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseSupplierAdapter(ABC):
    def __init__(self, supplier_config):
        self.supplier = supplier_config

    @abstractmethod
    async def discover(self, category: str, limit: int = 150) -> List[Dict[str, Any]]:
        """Crawl category pages and return candidate URLs and basic data."""
        pass

    @abstractmethod
    async def extract_product(self, url: str) -> Dict[str, Any]:
        """Open a product page and extract full structured data."""
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """Verify the supplier site is reachable and layout is as expected."""
        pass
