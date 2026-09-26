import requests
import time

BASE_URL = "http://localhost:8000/api"

print("1. Sending OTP...")
r1 = requests.post(f"{BASE_URL}/auth/send-otp", json={"email": "evrevia.zerflo@gmail.com"})
print(r1.status_code, r1.json())

# Wait a second to read terminal logs... Wait, I need to know the OTP!
# Since I'm the one who wrote the OTP logic, I can fetch it from the database instead.
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys

# Append backend to path so we can import models
sys.path.append(os.path.abspath("backend"))

from core.config import settings

async def get_otp():
    client = AsyncIOMotorClient(settings.MONGODB_URI, tlsAllowInvalidCertificates=True, tlsCAFile=None)
    import certifi
    client = AsyncIOMotorClient(settings.MONGODB_URI, tlsCAFile=certifi.where())
    db = client.evrevia
    otp_record = await db.email_otps.find_one({"email": "evrevia.zerflo@gmail.com"})
    return otp_record["otp"] if otp_record else None

otp = asyncio.run(get_otp())
print("2. Fetched OTP from DB:", otp)

if otp:
    r2 = requests.post(f"{BASE_URL}/auth/verify-otp", json={"email": "evrevia.zerflo@gmail.com", "otp": otp})
    print("Verify status:", r2.status_code)
    token = r2.json().get("access_token")
    print("Token:", token[:20], "...")

    print("3. Fetching Analytics...")
    r3 = requests.get(f"{BASE_URL}/admin/analytics", headers={"Authorization": f"Bearer {token}"})
    print("Analytics status:", r3.status_code)
    print("Analytics data:", r3.json())

    print("4. Fetching Orders...")
    r4 = requests.get(f"{BASE_URL}/admin/orders", headers={"Authorization": f"Bearer {token}"})
    print("Orders status:", r4.status_code)
    print("Orders count:", len(r4.json()))

else:
    print("No OTP found.")
