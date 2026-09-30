import jwt
import os
import httpx
import smtplib
import random
import string
from email.mime.text import MIMEText
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from backend.models.user import User
from backend.models.otp import EmailOTP
from backend.core.config import settings

router = APIRouter()
security = HTTPBearer()

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, settings.JWT_SECRET, algorithms=["HS256"])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not authorized as admin")
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# In production, set this in your environment variables
GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")

class GoogleAuthRequest(BaseModel):
    token: str

class SendOTPRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class AuthResponse(BaseModel):
    access_token: str
    user: dict

@router.post("/google", response_model=AuthResponse)
async def google_auth(request: GoogleAuthRequest):
    if not settings.MONGODB_URI:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={request.token}")
            if resp.status_code != 200:
                raise ValueError("Invalid Google token")
            id_info = resp.json()

        email = id_info.get("email")
        name = id_info.get("name", "User")
        google_id = id_info.get("sub")
        avatar = id_info.get("picture")

        user = await User.find_one(User.email == email)
        role = "admin" if email.lower() == "evrevia.zerflo@gmail.com" else "customer"

        if not user:
            user = User(
                email=email,
                name=name,
                googleId=google_id,
                avatar=avatar,
                role=role
            )
            await user.insert()
        else:
            user.lastLogin = datetime.utcnow()
            user.role = role
            if not user.googleId:
                user.googleId = google_id
            await user.save()

        access_token = create_access_token({
            "sub": str(user.id),
            "role": user.role
        })

        return {
            "access_token": access_token,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "role": user.role,
                "avatar": user.avatar
            }
        }
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

def send_otp_email(email_address: str, otp: str):
    sender_email = os.getenv("VERIFY_EMAIL_ACCOUNT")
    sender_password = os.getenv("VERIFY_EMAIL_PASSWORD")
    
    if not sender_email or not sender_password:
        return
        
    msg = MIMEText(f"Hello!\n\nYour EVRÉVIA login OTP is: {otp}\n\nThis code will expire in 10 minutes.")
    msg['Subject'] = 'Your EVRÉVIA Login Code'
    msg['From'] = f"EVRÉVIA <{sender_email}>"
    msg['To'] = email_address

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print(f"Failed to send email: {e}")

@router.post("/send-otp")
async def send_otp(request: SendOTPRequest, background_tasks: BackgroundTasks):
    if not settings.MONGODB_URI:
        raise HTTPException(status_code=500, detail="Database not connected")
        
    # Generate 6 digit code
    otp = ''.join(random.choices(string.digits, k=6))
    
    # Save or update OTP
    existing_otp = await EmailOTP.find_one(EmailOTP.email == request.email)
    expires = datetime.utcnow() + timedelta(minutes=10)
    
    if existing_otp:
        # Rate Limiting: Prevent spamming OTPs within 60 seconds
        if existing_otp.expiresAt > datetime.utcnow() + timedelta(minutes=9):
            raise HTTPException(status_code=429, detail="Please wait 60 seconds before requesting a new OTP.")
            
        existing_otp.otp = otp
        existing_otp.expiresAt = expires
        await existing_otp.save()
    else:
        new_otp = EmailOTP(email=request.email, otp=otp, expiresAt=expires)
        await new_otp.insert()
        
    # Send email in background so response is fast
    background_tasks.add_task(send_otp_email, request.email, otp)
    
    return {"message": "OTP sent successfully"}

@router.post("/verify-otp", response_model=AuthResponse)
async def verify_otp(request: VerifyOTPRequest):
    if not settings.MONGODB_URI:
        raise HTTPException(status_code=500, detail="Database not connected")
        
    otp_record = await EmailOTP.find_one(EmailOTP.email == request.email)
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="No OTP requested for this email.")
        
    if otp_record.otp != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code.")
        
    if otp_record.expiresAt < datetime.utcnow():
        await otp_record.delete()
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")
        
    # Valid OTP! Let's delete it so it can't be reused
    await otp_record.delete()
    
    # Find or create user
    user = await User.find_one(User.email == request.email)
    role = "admin" if request.email.lower() == "evrevia.zerflo@gmail.com" else "customer"
    
    if not user:
        user = User(
            email=request.email,
            name=request.email.split('@')[0], # Default name
            role=role
        )
        await user.insert()
    else:
        user.lastLogin = datetime.utcnow()
        user.role = role
        await user.save()

    access_token = create_access_token({
        "sub": str(user.id),
        "role": user.role
    })

    return {
        "access_token": access_token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "avatar": user.avatar
        }
    }
