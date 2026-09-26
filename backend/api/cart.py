from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import datetime
from backend.models.cart import Cart, CartItem
from backend.core.config import settings

router = APIRouter()

class CartUpdateRequest(BaseModel):
    userId: str # In production this comes from JWT Depends
    items: List[CartItem]

@router.get("/{user_id}")
async def get_cart(user_id: str):
    if not settings.MONGODB_URI:
        # Return mock cart
        return {"userId": user_id, "items": []}
        
    cart = await Cart.find_one(Cart.userId == user_id)
    if not cart:
        cart = Cart(userId=user_id, items=[])
        await cart.insert()
    return cart

@router.post("/")
async def update_cart(request: CartUpdateRequest):
    if not settings.MONGODB_URI:
        return {"message": "Mock cart updated"}
        
    cart = await Cart.find_one(Cart.userId == request.userId)
    if not cart:
        cart = Cart(userId=request.userId, items=request.items)
        await cart.insert()
    else:
        cart.items = request.items
        cart.updatedAt = datetime.utcnow()
        await cart.save()
        
    return cart
