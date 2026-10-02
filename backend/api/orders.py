from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import datetime
from backend.models.order import Order, Address, OrderItem
from backend.models.product import Product
from backend.core.config import settings
from backend.api.auth import get_current_user
from bson import ObjectId
import qrcode
import io
import base64
import urllib.parse
from uuid import uuid4

router = APIRouter()

class OrderCreateRequest(BaseModel):
    userId: str
    items: List[OrderItem]
    address: Address
    subtotal: float
    shipping: float = 0.0

@router.post("/")
async def create_order(request: OrderCreateRequest):
    # Securely calculate subtotal from DB
    real_subtotal = 0.0
    from bson.errors import InvalidId
    for item in request.items:
        try:
            product = await Product.get(item.productId)
            if product:
                if product.stock >= item.quantity:
                    product.stock -= item.quantity
                    await product.save()
                else:
                    raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")
                real_subtotal += (product.price * item.quantity)
        except InvalidId:
            pass # Skip mock/invalid ID

    # Calculate real total
    real_total = real_subtotal + request.shipping

    # Generate unique payment reference
    payment_ref = f"EVR-{str(uuid4())[:8].upper()}"

    # Build UPI URI
    # Format: upi://pay?pa={UPI_ID}&pn={NAME}&am={TOTAL}&cu=INR&tr={REF}&tn=Evrevia+Order
    pa = urllib.parse.quote_plus(settings.UPI_PAYEE_ID)
    pn = urllib.parse.quote_plus(settings.UPI_PAYEE_NAME)
    am = f"{real_total:.2f}"
    
    upi_uri = f"upi://pay?pa={pa}&pn={pn}&am={am}&cu=INR&tr={payment_ref}&tn=Evrevia+Order"

    order = Order(
        userId=request.userId,
        items=request.items,
        address=request.address,
        subtotal=real_subtotal,
        shipping=request.shipping,
        total=real_total,
        paymentReference=payment_ref,
        upiUri=upi_uri
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
            
        order_dict = order.dict()
        
        # If pending payment, generate QR code base64 on the fly
        if order.paymentStatus == "PENDING_PAYMENT":
            # Generate upiUri if missing for backward compatibility
            if not order.upiUri:
                pa = urllib.parse.quote_plus(settings.UPI_PAYEE_ID)
                pn = urllib.parse.quote_plus(settings.UPI_PAYEE_NAME)
                am = f"{order.total:.2f}"
                ref = order.paymentReference or f"EVR-{str(order.id)[:8].upper()}"
                order.upiUri = f"upi://pay?pa={pa}&pn={pn}&am={am}&cu=INR&tr={ref}&tn=Evrevia+Order"
                order.paymentReference = ref
                await order.save()
                
            qr = qrcode.QRCode(version=1, box_size=8, border=2)
            qr.add_data(order.upiUri)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            qr_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
            order_dict["qrBase64"] = qr_base64
            
        return order_dict
    except Exception as e:
        print(f"Error fetching order: {e}")
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

@router.put("/{order_id}/cancel")
async def cancel_order(order_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    try:
        order = await Order.get(ObjectId(order_id))
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if order.userId != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        if order.orderStatus not in ["NEW", "PENDING_PAYMENT"]: 
            raise HTTPException(status_code=400, detail="Only new or pending orders can be cancelled")
            
        order.orderStatus = "CANCELLED"
        order.updatedAt = datetime.utcnow()
        await order.save()
        return {"status": "success", "message": "Order cancelled"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
