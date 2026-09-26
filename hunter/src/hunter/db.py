import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from hunter.config import config
from hunter.models import Base

# Ensure the directory for SQLite exists
db_url = config.settings.database_url
if db_url.startswith("sqlite:///"):
    db_path = db_url.replace("sqlite:///", "")
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

engine = create_engine(db_url, echo=False)

def init_db():
    Base.metadata.create_all(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
