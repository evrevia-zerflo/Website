from beanie import Document
from pydantic import EmailStr
from datetime import datetime

class EmailOTP(Document):
    email: EmailStr
    otp: str # Storing in plain text for MVP but hashed in prod is better
    expiresAt: datetime
    
    class Settings:
        name = "email_otps"
