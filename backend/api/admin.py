from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from backend.models.product import Product
from backend.models.order import Order
from backend.core.config import settings

# In production, we'd use a dependency to verify the user is an admin via JWT.
# For MVP, we'll assume the frontend only shows this to admins, but we'll add a mock token check.

router = APIRouter()

class ProductCreateRequest(BaseModel):
    name: str
    slug: str
    category: str
    description: str
    price: float
    stock: int
    images: List[dict] = []

@router.post("/products")
async def create_product(request: ProductCreateRequest):
    if not settings.MONGODB_URI:
        return {"message": "Product created in mock mode", "product": request.dict()}
        
    product = Product(**request.dict())
    await product.insert()
    return product

@router.put("/products/{product_id}")
async def update_product(product_id: str, request: dict):
    if not settings.MONGODB_URI:
        return {"message": "Product updated in mock mode"}
        
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    for key, value in request.items():
        setattr(product, key, value)
        
    await product.save()
    return product

@router.get("/orders")
async def get_all_orders():
    if not settings.MONGODB_URI:
        return []
        
    orders = await Order.find_all().to_list()
    return orders

@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str):
    if not settings.MONGODB_URI:
        return {"message": f"Order {order_id} status updated to {status} in mock mode"}
        
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.orderStatus = status
    await order.save()
    return order
