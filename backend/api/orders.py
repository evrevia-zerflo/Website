from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
from backend.models.order import Order, Address
from backend.models.cart import CartItem
from backend.models.product import Product
from backend.core.config import settings

router = APIRouter()

class OrderCreateRequest(BaseModel):
    userId: str
    items: List[CartItem]
    address: Address
    subtotal: float
    shipping: float = 0.0

@router.post("/")
async def create_order(request: OrderCreateRequest):
    total = request.subtotal + request.shipping
    
    if not settings.MONGODB_URI:
        # Mock order creation
        return {
            "id": "mock_order_123",
            "total": total,
            "status": "PENDING_PAYMENT",
            "message": "Mock order created successfully"
        }
        
    # Deduct stock for each item
    for item in request.items:
        product = await Product.get(item.productId)
        if product and product.stock >= item.quantity:
            product.stock -= item.quantity
            await product.save()
        elif product:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")

    order = Order(
        userId=request.userId,
        items=request.items,
        address=request.address,
        subtotal=request.subtotal,
        shipping=request.shipping,
        total=total
    )
    
    await order.insert()
    
    return {
        "id": str(order.id),
        "total": order.total,
        "status": order.paymentStatus
    }
