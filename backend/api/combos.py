from fastapi import APIRouter
from typing import List

router = APIRouter()

MOCK_LOOK_COMBOS = []

@router.get("", response_model=List[dict])
@router.get("/", response_model=List[dict])
async def get_combos():
    return MOCK_LOOK_COMBOS
