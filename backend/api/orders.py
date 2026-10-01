from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import datetime
from backend.models.order import Order, Address, OrderItem
from backend.models.product import Product
from backend.core.config import settings
from backend.api.auth import get_current_user
from bson import ObjectId

router = APIRouter()

class OrderCreateRequest(BaseModel):
    userId: str
    items: List[OrderItem]
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

@router.get("/me")
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    orders = await Order.find({"userId": user_id}).sort("-createdAt").to_list()
    return orders

@router.get("/{order_id}")
async def get_order_details(order_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    try:
        order = await Order.get(ObjectId(order_id))
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if order.userId != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this order")
        return order
    except Exception:
        raise HTTPException(status_code=404, detail="Order not found")

class ReturnRequest(BaseModel):
    reason: str

@router.post("/{order_id}/return")
async def request_order_return(order_id: str, payload: ReturnRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    try:
        order = await Order.get(ObjectId(order_id))
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if order.userId != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        if order.orderStatus != "DELIVERED":
            raise HTTPException(status_code=400, detail="Only delivered orders can be returned")
            
        if order.returnStatus != "NONE":
            raise HTTPException(status_code=400, detail="Return already requested")
            
        order.returnStatus = "REQUESTED"
        order.returnReason = payload.reason
        order.updatedAt = datetime.utcnow()
        await order.save()
        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
