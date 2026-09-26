from beanie import Document
from typing import Optional
from pydantic import EmailStr
from datetime import datetime

class User(Document):
    googleId: Optional[str] = None
    firebaseUid: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    name: str
    avatar: Optional[str] = None
    role: str = "customer" # 'customer' or 'admin'
    createdAt: datetime = datetime.utcnow()
    lastLogin: datetime = datetime.utcnow()

    class Settings:
        name = "users"
