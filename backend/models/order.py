from beanie import Document
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItem(BaseModel):
    productId: str
    name: str
    price: float
    quantity: int
    size: Optional[str] = None
    color: Optional[str] = None
    image: str

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
    items: List[OrderItem]
    address: Address
    subtotal: float
    shipping: float = 0.0
    total: float
    paymentStatus: str = "PENDING_PAYMENT" # PENDING_PAYMENT, PAID, FAILED, REVIEW
    orderStatus: str = "NEW" # NEW, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    paymentReference: Optional[str] = None
    upiUri: Optional[str] = None
    upiReference: Optional[str] = None
    trackingId: Optional[str] = None
    courierName: Optional[str] = None
    supplierOrderId: Optional[str] = None # Added for dropshipping workflow
    returnStatus: str = "NONE" # NONE, REQUESTED, APPROVED, REJECTED, REFUNDED, REPLACED
    returnReason: Optional[str] = None
    createdAt: datetime = datetime.utcnow()
    updatedAt: datetime = datetime.utcnow()

    class Settings:
        name = "orders"
