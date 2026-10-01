from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import shutil
import uuid
from datetime import datetime, timedelta
from backend.models.product import Product
from backend.models.order import Order
from backend.models.user import User
from backend.api.auth import get_current_admin
from backend.core.config import settings

import cloudinary
import cloudinary.uploader
import cloudinary.api

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
    fabric: Optional[str] = None
    fit: Optional[str] = None
    care: Optional[str] = None
    styling: Optional[str] = None
    whatsIncluded: Optional[str] = None

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
        
    # Get recent orders
    recent_orders = await Order.find_all().sort("-createdAt").limit(5).to_list()
        
    return {
        "totalRevenue": total_revenue,
        "activeOrders": active_orders,
        "totalProducts": total_products,
        "lowStock": low_stock,
        "trends": trends,
        "recentOrders": recent_orders
    }

@router.get("/orders")
async def get_orders(admin: dict = Depends(get_current_admin)):
    if not settings.MONGODB_URI:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    # Fetch orders sorted by newest first
    orders = await Order.find_all().sort("-createdAt").to_list()
    return orders

@router.get("/orders/{order_id}")
async def get_order(order_id: str, admin: dict = Depends(get_current_admin)):
    if not settings.MONGODB_URI:
        raise HTTPException(status_code=500, detail="Database not connected")
        
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    return order

@router.get("/users")
async def get_users(admin: dict = Depends(get_current_admin)):
    if not settings.MONGODB_URI:
        raise HTTPException(status_code=500, detail="Database not connected")
        
    users = await User.find_all().sort("-createdAt").to_list()
    return users

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
        order.trackingId = payload.get("trackingId", order.trackingId)
        order.courierName = payload.get("courierName", order.courierName)
        order.supplierOrderId = payload.get("supplierOrderId", order.supplierOrderId)
        order.updatedAt = datetime.utcnow()
        await order.save()
        
    return order

@router.put("/orders/{order_id}/return-status")
async def update_return_status(order_id: str, payload: dict, admin: dict = Depends(get_current_admin)):
    if not settings.MONGODB_URI:
        raise HTTPException(status_code=500, detail="Database not connected")
        
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    return_status = payload.get("returnStatus")
    if return_status:
        order.returnStatus = return_status
        order.updatedAt = datetime.utcnow()
        await order.save()
        
    return order

@router.post("/upload")
async def upload_image(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    if not file:
        raise HTTPException(status_code=400, detail="No file sent")
        
    # If Cloudinary is configured, use it for production-grade structural storage
    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
        try:
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET,
                secure=True
            )
            
            # Upload structurally into the Evrevia folder
            result = cloudinary.uploader.upload(
                file.file,
                folder="evrevia/products",
                resource_type="image"
            )
            return {"url": result.get("secure_url")}
        except Exception as e:
            print(f"Cloudinary Error: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload image to cloud")
            
    # Fallback to local storage (only for development when keys are missing)
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'png'
    new_filename = f"prod_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"/images/products/{new_filename}"}

@router.get("/products")
async def get_all_products(admin: dict = Depends(get_current_admin)):
    if not settings.MONGODB_URI:
        raise HTTPException(status_code=500, detail="Database not connected")
    # Admin needs to see all products, regardless of published/draft status
    products = await Product.find_all().sort("-createdAt").to_list()
    return products

@router.post("/products")
async def create_product(request: ProductCreateRequest, admin: dict = Depends(get_current_admin)):
    if not settings.MONGODB_URI:
        raise HTTPException(status_code=500, detail="Database not connected")
        
    new_product_dict = request.dict()
    
    # Generate slug from name
    base_slug = new_product_dict["name"].lower().replace(" ", "-")
    # Clean non-alphanumeric (simple approach)
    base_slug = "".join(c for c in base_slug if c.isalnum() or c == "-")
    new_product_dict["slug"] = base_slug
    
    # Map originalPrice to compareAtPrice
    original_price = new_product_dict.pop("originalPrice", None)
    if not original_price:
        new_product_dict["compareAtPrice"] = float(new_product_dict["price"] * 1.5)
    else:
        new_product_dict["compareAtPrice"] = float(original_price)
        
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
        
    # Map originalPrice to compareAtPrice
    if "originalPrice" in request:
        request["compareAtPrice"] = float(request.pop("originalPrice")) if request["originalPrice"] else None
        
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
