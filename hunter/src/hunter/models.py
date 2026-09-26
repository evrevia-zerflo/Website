from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, DateTime, JSON, Text, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class Run(Base):
    __tablename__ = "runs"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    category: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    config_hash: Mapped[str] = mapped_column(String)
    timings: Mapped[dict] = mapped_column(JSON, default=dict)

class StageStatus(Base):
    __tablename__ = "stage_status"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(String, ForeignKey("runs.id"))
    stage: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    counts: Mapped[dict] = mapped_column(JSON, default=dict)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    finished_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

class Product(Base):
    __tablename__ = "products"
    product_id: Mapped[str] = mapped_column(String, primary_key=True)
    supplier: Mapped[str] = mapped_column(String)
    canonical_url: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String)
    category_label: Mapped[str] = mapped_column(String, nullable=True)
    first_seen: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_seen: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    image_phash: Mapped[str] = mapped_column(String, nullable=True)

class ProductSnapshot(Base):
    __tablename__ = "product_snapshots"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[str] = mapped_column(String, ForeignKey("products.product_id"))
    date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    price: Mapped[float] = mapped_column(Float, nullable=True)
    mrp: Mapped[float] = mapped_column(Float, nullable=True)
    stock_state: Mapped[str] = mapped_column(String, nullable=True)
    variants_json: Mapped[dict] = mapped_column(JSON, nullable=True)
    rating: Mapped[float] = mapped_column(Float, nullable=True)
    review_count: Mapped[int] = mapped_column(Integer, nullable=True)
    rank_position: Mapped[int] = mapped_column(Integer, nullable=True)
    badges: Mapped[dict] = mapped_column(JSON, nullable=True)

class Review(Base):
    __tablename__ = "reviews"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[str] = mapped_column(String, ForeignKey("products.product_id"))
    text: Mapped[str] = mapped_column(Text)
    stars: Mapped[float] = mapped_column(Float)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    hash: Mapped[str] = mapped_column(String, unique=True)

class Comparison(Base):
    __tablename__ = "comparisons"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[str] = mapped_column(String, ForeignKey("products.product_id"))
    source: Mapped[str] = mapped_column(String)
    match_url: Mapped[str] = mapped_column(String)
    match_confidence: Mapped[str] = mapped_column(String)
    price: Mapped[float] = mapped_column(Float, nullable=True)
    rating: Mapped[float] = mapped_column(Float, nullable=True)
    review_count: Mapped[int] = mapped_column(Integer, nullable=True)
    fetched_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class AiCall(Base):
    __tablename__ = "ai_calls"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(String, nullable=True)
    provider: Mapped[str] = mapped_column(String)
    model: Mapped[str] = mapped_column(String)
    purpose: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    latency_ms: Mapped[int] = mapped_column(Integer, nullable=True)
    tokens: Mapped[int] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class AiResult(Base):
    __tablename__ = "ai_results"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[str] = mapped_column(String, ForeignKey("products.product_id"))
    kind: Mapped[str] = mapped_column(String) # text/visual/category
    input_hash: Mapped[str] = mapped_column(String)
    prompt_version: Mapped[str] = mapped_column(String)
    output_json: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Score(Base):
    __tablename__ = "scores"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(String, ForeignKey("runs.id"))
    product_id: Mapped[str] = mapped_column(String, ForeignKey("products.product_id"))
    components: Mapped[dict] = mapped_column(JSON)
    penalties: Mapped[float] = mapped_column(Float, default=0)
    total: Mapped[float] = mapped_column(Float)
    confidence: Mapped[str] = mapped_column(String)

class Selection(Base):
    __tablename__ = "selections"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(String, ForeignKey("runs.id"))
    rank: Mapped[int] = mapped_column(Integer)
    product_id: Mapped[str] = mapped_column(String, ForeignKey("products.product_id"))
    reason: Mapped[str] = mapped_column(Text)
    warning: Mapped[str] = mapped_column(Text, nullable=True)

class Rejection(Base):
    __tablename__ = "rejections"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(String, ForeignKey("runs.id"))
    product_id: Mapped[str] = mapped_column(String)
    stage: Mapped[str] = mapped_column(String)
    reason: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class ErrorLog(Base):
    __tablename__ = "errors"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(String, ForeignKey("runs.id"), nullable=True)
    stage: Mapped[str] = mapped_column(String)
    source: Mapped[str] = mapped_column(String)
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
