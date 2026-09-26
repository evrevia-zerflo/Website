from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
import json
import os
import shutil
import uuid
from datetime import datetime

router = APIRouter()

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'products.json'))
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'public', 'images', 'products'))

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

if not os.path.exists(DB_PATH):
    with open(DB_PATH, 'w') as f:
        json.dump([], f)

def read_db():
    try:
        with open(DB_PATH, 'r') as f:
            return json.load(f)
    except:
        return []

def write_db(data):
    with open(DB_PATH, 'w') as f:
        json.dump(data, f, indent=2)

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
    rating: float = 5.0
    reviews: int = 1

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file sent")
        
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'png'
    new_filename = f"prod_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Return the relative path for the frontend
    return {"url": f"/images/products/{new_filename}"}

@router.post("/products")
async def create_product(request: ProductCreateRequest):
    products = read_db()
    
    new_product = request.dict()
    new_product["id"] = f"prod_{uuid.uuid4().hex[:8]}"
    new_product["createdAt"] = datetime.utcnow().isoformat()
    
    if not new_product.get("originalPrice"):
        new_product["originalPrice"] = int(new_product["price"] * 1.5)
        
    products.append(new_product)
    write_db(products)
    
    return new_product

@router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    products = read_db()
    filtered = [p for p in products if p.get("id") != product_id]
    
    if len(filtered) == len(products):
        raise HTTPException(status_code=404, detail="Product not found")
        
    write_db(filtered)
    return {"message": "Product deleted successfully"}

@router.put("/products/{product_id}")
async def update_product(product_id: str, request: dict):
    products = read_db()
    for p in products:
        if p.get("id") == product_id:
            p.update(request)
            write_db(products)
            return p
            
    raise HTTPException(status_code=404, detail="Product not found")
