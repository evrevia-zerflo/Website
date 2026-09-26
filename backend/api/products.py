from fastapi import APIRouter
from typing import List
import os
import json

router = APIRouter()

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'products.json'))

def read_db():
    try:
        with open(DB_PATH, 'r') as f:
            return json.load(f)
    except:
        return []

@router.get("", response_model=List[dict])
@router.get("/", response_model=List[dict])
async def get_products():
    return read_db()
