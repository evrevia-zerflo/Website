from beanie import Document
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from backend.models.cart import CartItem

class Address(BaseModel):
    name: str
    phone: str
    alternatePhone: Optional[str] = None
    house: str
    street: str
    landmark: Optional[str] = None
    city: str
    state: str
    pincode: str
    addressType: str = "Home"

class Order(Document):
    userId: str
    items: List[CartItem]
    address: Address
    subtotal: float
    shipping: float = 0.0
    total: float
    paymentStatus: str = "PENDING_PAYMENT" # PENDING_PAYMENT, PAID, FAILED, REVIEW
    orderStatus: str = "NEW" # NEW, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    upiReference: Optional[str] = None
    createdAt: datetime = datetime.utcnow()
    updatedAt: datetime = datetime.utcnow()

    class Settings:
        name = "orders"
