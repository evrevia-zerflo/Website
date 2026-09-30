from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import init_db
from backend.api import products, auth, cart, orders, admin, combos

app = FastAPI(title="EVRÉVIA API")

from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", # Frontend Dev
        "http://localhost:5174", # Admin Dev
        "http://localhost:3000",
        "https://evrevia.com",
        "https://admin.evrevia.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

@app.on_event("startup")
async def on_startup():
    await init_db()

app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(combos.router, prefix="/api/combos", tags=["combos"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(cart.router, prefix="/api/cart", tags=["cart"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.get("/")
def root():
    return {"message": "Welcome to EVRÉVIA API"}
