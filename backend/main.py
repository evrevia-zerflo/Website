from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import init_db
from backend.api import products, auth, cart, orders, admin, combos

app = FastAPI(title="EVRÉVIA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
