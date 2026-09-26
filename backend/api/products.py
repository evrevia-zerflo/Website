from fastapi import APIRouter
from typing import List
from backend.models.product import Product
from backend.core.config import settings

router = APIRouter()

MOCK_PRODUCTS = []

@router.get("", response_model=List[dict])
@router.get("/", response_model=List[dict])
async def get_products():
    if not settings.MONGODB_URI:
        return MOCK_PRODUCTS
        
    products = await Product.find_all().to_list()
    return products
