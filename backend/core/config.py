import os
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv("backend/.env") # Load variables from .env file

class Settings(BaseModel):
    PROJECT_NAME: str = "EVRÉVIA Backend"
    MONGODB_URI: Optional[str] = os.getenv("MONGODB_URI", None)
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-change-me")
    
settings = Settings()
