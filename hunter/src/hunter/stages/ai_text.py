import json
from typing import List, Dict, Any
from hunter.ai.openrouter_client import openrouter
from hunter.ai.schemas import ProductRiskAnalysis
from hunter.utils.logger import logger

async def run_ai_text_analysis(products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    logger.info(f"Running AI text analysis on {len(products)} products")
    
    for p in products:
        prompt = f"""
        Analyze this product:
        Title: {p.get('title')}
        Description: {p.get('description', '')[:500]}
        Price: {p.get('price')}
        Category expected: {p.get('category_label')}
        
        Provide JSON matching the schema.
        """
        
        analysis = await openrouter.analyze_product(prompt, ProductRiskAnalysis)
        if analysis:
            p["ai_text_analysis"] = analysis.model_dump()
            
            # Apply AI insights to the score
            if "score" not in p:
                p["score"] = {"total": 0, "penalties": 0, "warnings": []}
            if "total" not in p["score"]:
                p["score"]["total"] = 0
                
            if not analysis.category_confirmed:
                p["category_label"] = "rejected_by_ai"
                
            if analysis.brand_or_replica_suspected:
                p.setdefault("score", {}).setdefault("warnings", []).append("BRAND_OR_REPLICA_SUSPECTED")
                p["score"]["penalties"] = p["score"].get("penalties", 0) + 30
                p["score"]["total"] = max(0, p["score"].get("total", 0) - 30)
                
            p["score"]["total"] += (analysis.uniqueness_score / 2)
            p["score"]["total"] += (analysis.trend_fit_score / 2)
            
    # Filter out those rejected by AI
    return [p for p in products if p.get("category_label") != "rejected_by_ai"]
