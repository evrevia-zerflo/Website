from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import shutil
import uuid
from datetime import datetime, timedelta
from backend.models.product import Product
from backend.models.order import Order
from backend.api.auth import get_current_admin
from backend.core.config import settings

router = APIRouter()

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'public', 'images', 'products'))
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ProductCreateRequest(BaseModel):
    name: str
    category: str
    subcategory: Optional[str] = "All"
    description: str
    price: float
    originalPrice: Optional[float] = None
    stock: int = 100
    images: List[str] = []
    supplierUrl: Optional[str] = None
    sizes: List[str] = ["Free Size"]
    colors: List[str] = []
    isNew: bool = True
    isBestSeller: bool = False
    discount: int = 0
    material: Optional[str] = None
    careInstructions: Optional[str] = None
    tags: List[str] = []
    status: str = "publish" # "publish" or "draft"

@router.get("/analytics")
async def get_analytics(admin: dict = Depends(get_current_admin)):
    if not settings.MONGODB_URI:
        raise HTTPException(status_code=500, detail="Database not connected")
        
    # Get basic counts
    total_products = await Product.count()
    from beanie.operators import NotIn
    active_orders = await Order.find(NotIn(Order.orderStatus, ["DELIVERED", "CANCELLED"])).count()
    
    # Calculate revenue (total of all non-cancelled orders)
    orders = await Order.find(Order.orderStatus != "CANCELLED").to_list()
    total_revenue = sum([order.total for order in orders])
    
    # Low stock items
    low_stock = await Product.find(Product.stock <= 5).count()
    
    # Generate some mock trend data for the chart since it's a new system
    # In a real scenario, this would group by createdAt date.
    trends = []
    for i in range(6, -1, -1):
        date_str = (datetime.utcnow() - timedelta(days=i)).strftime("%b %d")
        # Just randomizing a bit based on total for visual effect, normally group by day
        trends.append({
            "name": date_str,
            "sales": total_revenue // 7 + (total_revenue // 20 * (i%3)) if total_revenue > 0 else 0
        })
        
    return {
        "totalRevenue": total_revenue,
        "activeOrders": active_orders,
        "totalProducts": total_products,
        "lowStock": low_stock,
        "trends": trends
    }

@router.get("/orders")
async def get_orders(admin: dict = Depends(get_current_admin)):
    if not settings.MONGODB_URI:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    # Fetch orders sorted by newest first
    orders = await Order.find_all().sort("-createdAt").to_list()
    return orders

@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, payload: dict, admin: dict = Depends(get_current_admin)):
    if not settings.MONGODB_URI:
        raise HTTPException(status_code=500, detail="Database not connected")
        
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    new_status = payload.get("status")
    if new_status:
        order.orderStatus = new_status
        order.updatedAt = datetime.utcnow()
        await order.save()
        
    return order

@router.post("/upload")
async def upload_image(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    if not file:
        raise HTTPException(status_code=400, detail="No file sent")
        
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'png'
    new_filename = f"prod_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"/images/products/{new_filename}"}

@router.post("/products")
async def create_product(request: ProductCreateRequest, admin: dict = Depends(get_current_admin)):
    if not settings.MONGODB_URI:
        raise HTTPException(status_code=500, detail="Database not connected")
        
    new_product_dict = request.dict()
    if not new_product_dict.get("originalPrice"):
        new_product_dict["originalPrice"] = int(new_product_dict["price"] * 1.5)
        
    product = Product(**new_product_dict)
    await product.insert()
    
    return product

@router.put("/products/{product_id}")
async def update_product(product_id: str, request: dict, admin: dict = Depends(get_current_admin)):
    if not settings.MONGODB_URI:
        raise HTTPException(status_code=500, detail="Database not connected")
        
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Exclude _id to prevent overriding MongoDB's internal object ID
    if "_id" in request:
        del request["_id"]
    if "id" in request:
        del request["id"]
        
    await product.set(request)
    return product

@router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(get_current_admin)):
    if not settings.MONGODB_URI:
        raise HTTPException(status_code=500, detail="Database not connected")
        
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    await product.delete()
    return {"message": "Product deleted successfully"}
