import asyncio
import os
import sys

sys.path.append(os.path.abspath('backend'))
from core.config import settings
from motor.motor_asyncio import AsyncIOMotorClient

async def test():
    client = AsyncIOMotorClient(settings.MONGODB_URI, tls=True, tlsInsecure=True)
    try:
        info = await client.server_info()
        print("Connected successfully!", info)
    except Exception as e:
        print("Connection failed:", e)

asyncio.run(test())
