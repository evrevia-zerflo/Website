from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
import uuid
from backend.models.product import Product
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
