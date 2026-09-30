import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from backend.models.user import User
from backend.core.config import settings
from bson import ObjectId

async def main():
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    await init_beanie(database=client[settings.MONGODB_DB_NAME], document_models=[User])
    
    users = await User.find_all().to_list()
    print("Users:", len(users))
    if users:
        print("First user ID:", str(users[0].id))
        user = await User.get(users[0].id)
        print("Fetched directly via ID:", user.name if user else "None")
        
        # Test string ID
        try:
            user_str = await User.get(str(users[0].id))
            print("Fetched via string ID:", user_str.name if user_str else "None")
        except Exception as e:
            print("String ID fetch failed:", e)

asyncio.run(main())
