import jwt
import os
import httpx
import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from bson import ObjectId
import uuid
from backend.models.user import User, UserAddress
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

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, settings.JWT_SECRET, algorithms=["HS256"])
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
    is_new_user: bool = False

class UpdateProfileRequest(BaseModel):
    name: str | None = None
    phone: str | None = None

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
            },
            "is_new_user": False
        }
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

def send_otp_email(email_address: str, otp: str):
    sender_email = os.getenv("VERIFY_EMAIL_ACCOUNT")
    sender_password = os.getenv("VERIFY_EMAIL_PASSWORD")
    
    if not sender_email or not sender_password:
        return
        
    msg = MIMEMultipart("alternative")
    msg['Subject'] = 'Your EVRÉVIA Access Code'
    msg['From'] = f"EVRÉVIA <{sender_email}>"
    msg['To'] = email_address

    text = f"Your EVRÉVIA login code is: {otp}\nThis code will expire in 10 minutes."
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
    <style>
      body {{ margin: 0; padding: 0; background-color: #FDFBF7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }}
      .container {{ max-width: 480px; margin: 40px auto; background: #ffffff; padding: 40px 30px; border-radius: 8px; text-align: center; border: 1px solid #F3EDE4; }}
      .logo {{ font-size: 24px; font-weight: 400; letter-spacing: 0.3em; color: #2C2C2C; margin-bottom: 8px; font-family: "Times New Roman", Times, serif; }}
      .logo-accent {{ color: #D4AF37; font-size: 10px; margin-bottom: 30px; letter-spacing: 2px; }}
      .title {{ font-size: 18px; color: #2C2C2C; margin-bottom: 24px; font-weight: 400; font-family: Georgia, serif; }}
      .copy {{ color: #4A4A4A; font-size: 14px; line-height: 1.6; margin-bottom: 30px; }}
      .otp-box {{ background-color: #FDFBF7; border: 1px solid #EBE3D5; border-radius: 6px; padding: 24px; margin: 0 auto 30px auto; max-width: 260px; }}
      .otp-code {{ font-size: 38px; font-weight: 400; letter-spacing: 0.35em; color: #2C2C2C; margin: 0; -webkit-user-select: all; user-select: all; cursor: text; padding-left: 0.35em; font-family: "Times New Roman", Times, serif; }}
      .decorative-detail {{ color: #A78B81; font-size: 11px; letter-spacing: 2px; margin-bottom: 30px; }}
      .signoff {{ font-size: 14px; color: #4A4A4A; margin-bottom: 4px; font-style: italic; font-family: Georgia, serif; }}
      .brand-name {{ font-size: 13px; font-weight: 600; color: #2C2C2C; letter-spacing: 0.15em; margin-bottom: 4px; }}
      .tagline {{ font-size: 12px; color: #888; margin-bottom: 24px; }}
      .disclaimer {{ font-size: 12px; color: #888; margin-bottom: 30px; }}
      .legal {{ font-size: 11px; color: #aaa; border-top: 1px solid #F3EDE4; padding-top: 20px; }}
    </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">EVR&Eacute;VIA</div>
        <div class="logo-accent">&#10022; &mdash;&mdash;&mdash;&mdash; &mdash;&mdash;&mdash;&mdash; &#10022;</div>
        
        <div class="title">Your secure access code</div>
        
        <div class="copy">
          Hello,<br><br>
          Use the code below to securely continue with EVR&Eacute;VIA.<br>
          Your code expires in 10 minutes.
        </div>
        
        <div class="otp-box">
          <div class="otp-code">{otp}</div>
        </div>
        
        <div class="decorative-detail">&#10022; &mdash;&mdash;&mdash; &#9825; &mdash;&mdash;&mdash; &#10022;</div>
        
        <div class="disclaimer">
          If you didn't request this code, you can safely ignore this email.
        </div>
        
        <div style="text-align: center;">
          <div class="signoff">With love,</div>
          <div class="brand-name">EVR&Eacute;VIA</div>
          <div class="tagline">Where elegance meets everyday.</div>
          
          <div class="legal">
            &copy; 2026 EVR&Eacute;VIA &middot; Privacy &middot; Support
          </div>
        </div>
      </div>
    </body>
    </html>
    """
    
    part1 = MIMEText(text, 'plain')
    part2 = MIMEText(html, 'html')
    msg.attach(part1)
    msg.attach(part2)

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
    
    is_new_user = False
    if not user:
        is_new_user = True
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
        },
        "is_new_user": is_new_user
    }

@router.put("/profile")
async def update_profile(request: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    user = await User.get(ObjectId(current_user["sub"]))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if request.name is not None:
        user.name = request.name
    if request.phone is not None:
        user.phone = request.phone
        
    await user.save()
    
    return {
        "message": "Profile updated successfully",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "role": user.role,
            "avatar": user.avatar
        }
    }

# --- Address Endpoints ---

@router.get("/profile/addresses")
async def get_addresses(current_user: dict = Depends(get_current_user)):
    user = await User.get(ObjectId(current_user["sub"]))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.addresses

@router.post("/profile/addresses")
async def add_address(address: UserAddress, current_user: dict = Depends(get_current_user)):
    user = await User.get(ObjectId(current_user["sub"]))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Generate unique ID for address if not provided or to ensure uniqueness
    address.id = str(uuid.uuid4())
    
    if len(user.addresses) == 0:
        address.isDefault = True
    elif address.isDefault:
        # Unset default from others
        for a in user.addresses:
            a.isDefault = False
            
    user.addresses.append(address)
    await user.save()
    return user.addresses

@router.delete("/profile/addresses/{address_id}")
async def delete_address(address_id: str, current_user: dict = Depends(get_current_user)):
    user = await User.get(ObjectId(current_user["sub"]))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.addresses = [a for a in user.addresses if a.id != address_id]
    await user.save()
    return user.addresses

@router.put("/profile/addresses/{address_id}")
async def update_address(address_id: str, address: Address, current_user: dict = Depends(get_current_user)):
    user = await User.get(current_user["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    for i, a in enumerate(user.addresses):
        if a.id == address_id:
            address.id = address_id
            if address.isDefault:
                for addr in user.addresses:
                    addr.isDefault = False
            user.addresses[i] = address
            await user.save()
            return user.addresses
            
    raise HTTPException(status_code=404, detail="Address not found")
