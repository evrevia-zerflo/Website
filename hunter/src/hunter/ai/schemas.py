from pydantic import BaseModel, Field
from typing import List, Optional

class ProductRiskAnalysis(BaseModel):
    uniqueness_score: int = Field(..., ge=0, le=10, description="Score 0-10 on how unique this product is vs market.")
    trend_fit_score: int = Field(..., ge=0, le=10, description="Score 0-10 on trend fit.")
    customer_feedback_summary: Optional[str] = Field(None, description="Summary of positive/negative feedback.")
    risk_flags: List[str] = Field(default_factory=list, description="Any risk flags (e.g. QUALITY_COMPLAINTS).")
    brand_or_replica_suspected: bool = Field(..., description="Is this item pretending to be a major brand?")
    category_confirmed: bool = Field(..., description="Is this definitely in the requested category?")

class VisualAnalysis(BaseModel):
    aesthetic_fit: int = Field(..., ge=0, le=10)
    visual_appeal: int = Field(..., ge=0, le=10)
    pin_potential: int = Field(..., ge=0, le=10)
    visual_distinctiveness: int = Field(..., ge=0, le=10)
    photo_usability_note: Optional[str] = None
