from beanie import Document
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CartItem(BaseModel):
    productId: str
    variantId: Optional[str] = None
    quantity: int

class Cart(Document):
    userId: str
    items: List[CartItem] = []
    updatedAt: datetime = datetime.utcnow()

    class Settings:
        name = "carts"
