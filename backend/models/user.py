from beanie import Document
from typing import Optional, List
from pydantic import EmailStr, BaseModel
from datetime import datetime
import uuid

class UserAddress(BaseModel):
    id: str
    fullName: str
    mobile: str
    pincode: str
    house: str
    street: str
    landmark: Optional[str] = None
    city: str
    state: str
    isDefault: bool = False

class User(Document):
    googleId: Optional[str] = None
    firebaseUid: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    name: str
    avatar: Optional[str] = None
    role: str = "customer" # 'customer' or 'admin'
    addresses: List[UserAddress] = []
    createdAt: datetime = datetime.utcnow()
    lastLogin: datetime = datetime.utcnow()

    class Settings:
        name = "users"
