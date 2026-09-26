import yaml
import os
from pathlib import Path
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

PROJECT_ROOT = Path(__file__).parent.parent.parent
CONFIG_DIR = PROJECT_ROOT / "config"

class PlaywrightSettings(BaseModel):
    headless: bool = True
    max_concurrent_domains: int = 2
    delay_between_requests_sec: int = 3
    timeout_sec: int = 30
    executable_path: Optional[str] = None # For environments like termux

class LimitSettings(BaseModel):
    max_products_per_supplier: int = 150
    detail_cache_hours: int = 24
    cache_retention_days: int = 7
    comparison_cache_days: int = 3
    max_comparison_seconds: int = 60
    shortlist_a: int = 25
    shortlist_b: int = 15
    shortlist_c: int = 10
    cooldown_days: int = 14
    cooldown_override_price_drop_pct: int = 15

class AISettings(BaseModel):
    gemini_daily_limit: int = 20
    gemini_reserve: int = 8
    openrouter_rpm: int = 10
    openrouter_rpd: int = 200
    openrouter_models: List[str] = ["google/gemini-pro"]

class Settings(BaseModel):
    database_url: str = "sqlite:///data/sqlite.db"
    playwright: PlaywrightSettings
    limits: LimitSettings
    ai: AISettings

class SupplierCapabilities(BaseModel):
    price_public: bool = True
    price_requires_login: bool = False
    images_public: bool = True
    stock_public: bool = True
    reviews_public: bool = True

class Supplier(BaseModel):
    id: str
    name: str
    base_url: str
    enabled: bool = True
    adapter: str = "generic"
    category_map: Dict[str, List[str]] = Field(default_factory=dict)
    selectors: Dict[str, str] = Field(default_factory=dict)
    capabilities: SupplierCapabilities = Field(default_factory=SupplierCapabilities)

class SuppliersConfig(BaseModel):
    suppliers: List[Supplier]

class Category(BaseModel):
    include_keywords: List[str] = Field(default_factory=list)
    exclude_keywords: List[str] = Field(default_factory=list)
    min_price: float = 0
    max_price: float = 0
    min_margin_pct: float = 0
    ideal_margin_pct: float = 0
    shipping_buffer_inr: float = 0
    unsure_policy: str = "reject"

class CategoriesConfig(BaseModel):
    categories: Dict[str, Category]

class BrandAesthetic(BaseModel):
    name: str
    description: str
    mood_words: List[str] = Field(default_factory=list)
    color_palette: List[str] = Field(default_factory=list)
    on_brand_examples: List[str] = Field(default_factory=list)
    off_brand_examples: List[str] = Field(default_factory=list)

class BrandProfileConfig(BaseModel):
    aesthetic: BrandAesthetic

class ScoringConfig(BaseModel):
    weights: Dict[str, float]
    penalties: Dict[str, float]
    confidence_thresholds: Dict[str, float]
    diversity: Dict[str, Any]

class ComparisonSource(BaseModel):
    id: str
    name: str
    base_url: str
    search_path: str
    enabled: bool = True

class ComparisonSourcesConfig(BaseModel):
    sources: List[ComparisonSource]

class ConfigManager:
    def __init__(self, config_dir: Path = CONFIG_DIR):
        self.config_dir = config_dir
        self.settings: Settings = self._load_yaml("settings.yaml", Settings)
        self.suppliers: List[Supplier] = self._load_yaml("suppliers.yaml", SuppliersConfig).suppliers
        self.categories: Dict[str, Category] = self._load_yaml("categories.yaml", CategoriesConfig).categories
        self.brand_profile: BrandAesthetic = self._load_yaml("brand_profile.yaml", BrandProfileConfig).aesthetic
        self.scoring: ScoringConfig = self._load_yaml("scoring.yaml", ScoringConfig)
        self.comparison_sources: List[ComparisonSource] = self._load_yaml("comparison_sources.yaml", ComparisonSourcesConfig).sources

    def _load_yaml(self, filename: str, model: type[BaseModel]) -> BaseModel:
        filepath = self.config_dir / filename
        if not filepath.exists():
            raise FileNotFoundError(f"Configuration file {filename} not found at {filepath}")
        with open(filepath, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        if data is None:
            data = {}
        try:
            return model(**data)
        except Exception as e:
            raise ValueError(f"Failed to validate {filename}: {e}")

# Global singleton to be imported
config = ConfigManager()
