from beanie import Document
from typing import List, Optional
from datetime import datetime

class Product(Document):
    name: str
    slug: str
    category: str
    subcategory: Optional[str] = None
    description: str
    price: float
    compareAtPrice: Optional[float] = None
    sizes: List[str] = []
    colors: List[str] = []
    stock: int = 0
    tags: List[str] = []
    images: List[dict] = []  # dict with url, alt, type
    videos: List[dict] = []
    status: str = "published" # published or draft
    supplier: Optional[str] = None
    supplierUrl: Optional[str] = None
    createdAt: datetime = datetime.utcnow()
    updatedAt: datetime = datetime.utcnow()

    class Settings:
        name = "products"

class Category(Document):
    name: str
    slug: str
    description: Optional[str] = None

    class Settings:
        name = "categories"
