from typing import List, Dict, Any
from hunter.ai.gemini_client import gemini
from hunter.ai.schemas import VisualAnalysis
from hunter.ai.budget import budget_manager
from hunter.config import config
from hunter.utils.logger import logger

async def run_ai_visual_analysis(products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    logger.info(f"Running AI visual analysis on {len(products)} products")
    
    aesthetic = config.brand_profile
    prompt = f"""
    Evaluate this product against the EVRÉVIA aesthetic:
    Mood: {', '.join(aesthetic.mood_words)}
    Palette: {', '.join(aesthetic.color_palette)}
    
    Provide a JSON response matching exactly this JSON schema:
    {VisualAnalysis.model_json_schema()}
    """
    
    for p in products:
        if not budget_manager.can_make_gemini_call():
            p.setdefault("score", {}).setdefault("warnings", []).append("VISUAL_NOT_ANALYZED")
            p["score"]["penalties"] = p.get("score", {}).get("penalties", 0) + config.scoring.penalties.get("VISUAL_NOT_ANALYZED", 5)
            continue
            
        try:
            analysis = await gemini.analyze_visuals(prompt, p.get("images", []), VisualAnalysis)
            
            if analysis:
                budget_manager.record_gemini_call(True)
                p["ai_visual_analysis"] = analysis.model_dump()
                
                # Update scores based on visual rubrics (max 20 points for Pinterest potential)
                visual_score = (analysis.aesthetic_fit + analysis.visual_appeal + analysis.pin_potential) / 30 * 20
                p["score"]["total"] += visual_score
                
                if analysis.photo_usability_note:
                    p.setdefault("score", {}).setdefault("warnings", []).append(f"PHOTO: {analysis.photo_usability_note}")
            else:
                budget_manager.record_gemini_call(False)
        except Exception as e:
            logger.error(f"Gemini API failed for product {p.get('title')}: {e}")
            budget_manager.record_gemini_call(False)
            
        import asyncio
        # Gemini Free Tier limit is strictly 15 Requests Per Minute (RPM) per project API key.
        # 60 seconds / 4.0 seconds = 15 requests exactly.
        # Combined with network latency, this guarantees we run at ~12 RPM and NEVER hit the 429 quota.
        await asyncio.sleep(4.0)
            
    return products
