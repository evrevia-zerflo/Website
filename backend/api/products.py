from fastapi import APIRouter, HTTPException
from typing import List, Optional
from backend.models.product import Product
from backend.core.config import settings

router = APIRouter()

@router.get("", response_model=List[Product])
@router.get("/", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    if not settings.MONGODB_URI:
        return []
        
    if category:
        return await Product.find(
            Product.category == category,
            Product.status.in_(["publish", "published"])
        ).to_list()
    return await Product.find(Product.status.in_(["publish", "published"])).to_list()

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    if not settings.MONGODB_URI:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
