import os
from pathlib import Path
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class Settings(BaseModel):
    PROJECT_NAME: str = "EVRÉVIA Backend"
    MONGODB_URI: Optional[str] = os.getenv("MONGODB_URI", None)
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-change-me")
    CLOUDINARY_CLOUD_NAME: Optional[str] = os.getenv("CLOUDINARY_CLOUD_NAME", None)
    CLOUDINARY_API_KEY: Optional[str] = os.getenv("CLOUDINARY_API_KEY", None)
    CLOUDINARY_API_SECRET: Optional[str] = os.getenv("CLOUDINARY_API_SECRET", None)
    
settings = Settings()
