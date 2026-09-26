import dns.resolver
dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers = ['8.8.8.8', '8.8.4.4']

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from backend.core.config import settings
from backend.models.product import Product, Category
from backend.models.user import User
from backend.models.cart import Cart
from backend.models.order import Order
from backend.models.otp import EmailOTP

async def init_db():
    if not settings.MONGODB_URI:
        print("Warning: MONGODB_URI not set. Running without real database connection.")
        return False
        
    client = AsyncIOMotorClient(settings.MONGODB_URI, tls=True, tlsInsecure=True)
    await init_beanie(database=client.evrevia, document_models=[Product, Category, User, Cart, Order, EmailOTP])
    print("Database initialized.")
    return True
