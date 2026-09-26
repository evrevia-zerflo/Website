import asyncio
import uuid
from hunter.config import config
from hunter.scraping.browser import browser_manager
from hunter.stages.discovery import run_discovery
from hunter.stages.detail import run_detail_extraction
from hunter.stages.normalize import run_normalize
from hunter.stages.prefilter import run_prefilter
from hunter.analysis.category_lock import run_category_verification, output_validator
from hunter.analysis.scoring import score_product, apply_diversity_and_select
from hunter.output.writers import write_results
from hunter.stages.data_quality import run_data_quality_gate
from hunter.utils.logger import logger

async def run_pipeline(category: str, max_per_supplier: int = None, dry_run: bool = False, no_ai: bool = False, headed: bool = False):
    run_id = str(uuid.uuid4())[:8]
    logger.info(f"Pipeline [Run {run_id}] started for category: {category}")
    
    # Overrides
    if max_per_supplier:
        config.settings.limits.max_products_per_supplier = max_per_supplier
    
    await browser_manager.start(headed=headed)
    
    stats = {}
    
    try:
        # Phase 1: Discovery
        candidates = await run_discovery(category)
        stats["discovered"] = len(candidates)
        logger.info(f"Discovery complete. Found {len(candidates)} total candidates.")
        
        if not candidates:
            logger.warning("No candidates found. Exiting pipeline.")
            return

        # Phase 2: Pre-filter (No AI)
        survivors = run_prefilter(candidates, category)
        stats["prefiltered"] = len(survivors)
        
        # Phase 1.5: Detail Extraction
        raw_details = await run_detail_extraction(survivors)
        stats["extracted"] = len(raw_details)
        logger.info(f"Extraction complete. Extracted {len(raw_details)} products.")
        
        # Normalize
        normalized_products = run_normalize(raw_details)
        
        # Calculate extraction stats before gating
        stats["ext_price"] = sum(1 for p in normalized_products if p.get("price", 0) > 0)
        stats["ext_image"] = sum(1 for p in normalized_products if len(p.get("images", [])) > 0)
        stats["ext_stock"] = sum(1 for p in normalized_products if p.get("availability"))
        
        # Hard Data Quality Gate
        gated_dict = run_data_quality_gate(normalized_products)
        gated_products = gated_dict["ACTIVE"]
        price_locked = gated_dict["PRICE_LOCKED"]
        stats["quality_passed"] = len(gated_products)
        stats["price_locked"] = len(price_locked)
        
        # Phase 2: Category Verification
        verified_products = run_category_verification(gated_products, category)
        stats["verified"] = len(verified_products)
        
        verified_locked = run_category_verification(price_locked, category)
        
        from hunter.stages.market import run_market_comparison
        
        # Phase 2.5: Market Comparison
        # We only run this on a shortlist (e.g., top 25) to save time, but for MVP we run it on verified.
        # Ideally, we should do a pre-score here and take top N, but for now we pass all verified.
        verified_products = await run_market_comparison(verified_products)
        
        # Phase 3: Fast Scoring
        for p in verified_products:
            p["score"] = score_product(p, market_median=p.get("market_median"))
            
        stats["scanned"] = len(verified_products)
        
        # Phase 5 & 6: AI Text and Visual Analysis
        ai_failed = False
        if not no_ai:
            from hunter.stages.ai_text import run_ai_text_analysis
            from hunter.stages.ai_visual import run_ai_visual_analysis
            
            # Combine both active and price_locked for AI analysis so user can evaluate aesthetics
            ai_candidates = verified_products + verified_locked
            
            try:
                ai_candidates = await run_ai_text_analysis(ai_candidates)
            except Exception as e:
                logger.error(f"AI Text Analysis crashed: {e}")
                ai_failed = True
            
            # For Gemini, limit to top N (shortlist_c) to save budget.
            # But we want to ensure locked products get analyzed if budget permits, or at least the top scored.
            # For this test, we'll just run visual analysis on all of them if the list is small.
            shortlist_c = config.settings.limits.shortlist_c
            
            # Sort ACTIVE products by total score
            verified_products.sort(key=lambda x: x.get("score", {}).get("total", 0), reverse=True)
            
            # Re-combine the sorted active ones with the locked ones
            ai_candidates = verified_products + verified_locked
            top_candidates = ai_candidates[:shortlist_c]
            
            analyzed_top = []
            try:
                analyzed_top = await run_ai_visual_analysis(top_candidates)
            except Exception as e:
                logger.error(f"AI Visual Analysis crashed: {e}")
                ai_failed = True
                analyzed_top = top_candidates # fallback
            
            # Check if AI silently failed by checking if any product got the data
            if len(ai_candidates) > 0 and not any("ai_text_analysis" in p for p in ai_candidates):
                ai_failed = True
            if len(analyzed_top) > 0 and not any("ai_visual_analysis" in p for p in analyzed_top):
                ai_failed = True
            
        # Selection & Diversity (ONLY run on ACTIVE products)
        selected = apply_diversity_and_select(verified_products)
        
        # Output Validation
        final_valid = output_validator(selected, category)
        stats["shortlisted"] = len(final_valid)
        
        # Collect supplier stats
        supplier_stats = {s.id: {"found": 0, "active": 0, "locked": 0, "rejected": 0} for s in config.suppliers}
        
        for c in candidates:
            s_id = c.get("supplier")
            if not s_id:
                matches = [s.id for s in config.suppliers if s.base_url in c.get("url", "")]
                if matches:
                    s_id = matches[0]
            if s_id and s_id in supplier_stats:
                supplier_stats[s_id]["found"] += 1
            
        for p in gated_dict["ACTIVE"]:
            supplier_stats[p.get("supplier")]["active"] += 1
            
        for p in gated_dict["PRICE_LOCKED"]:
            supplier_stats[p.get("supplier")]["locked"] += 1
            
        for p in gated_dict["REJECTED"]:
            if p.get("supplier"):
                supplier_stats[p.get("supplier")]["rejected"] += 1
                
        # Output
        selected_urls = {p.get("canonical_url") or p.get("url") for p in final_valid if (p.get("canonical_url") or p.get("url"))}
        write_results(run_id, category, gated_dict["ACTIVE"], gated_dict["PRICE_LOCKED"], gated_dict["REJECTED"], selected_urls)
        
        pipeline_status = "PARTIAL_SUCCESS" if ai_failed else "SUCCESS"
        
        logger.info(f"\n--- EXTRACTION QUALITY REPORT ---")
        logger.info(f"Price extraction: {stats.get('ext_price', 0)}/{stats.get('extracted', 0)}")
        logger.info(f"Image extraction: {stats.get('ext_image', 0)}/{stats.get('extracted', 0)}")
        logger.info(f"Stock extraction: {stats.get('ext_stock', 0)}/{stats.get('extracted', 0)}")
        logger.info(f"Category verification: {stats.get('verified', 0)}/{stats.get('quality_passed', 0)}")
        logger.info(f"Price Locked: {stats.get('price_locked', 0)}")
        logger.info(f"---------------------------------")
        
        logger.info(f"\n--- SUPPLIER HEALTH TABLE ---")
        logger.info(f"{'SUPPLIER':<20} {'FOUND':<7} {'ACTIVE':<8} {'LOCKED':<8} {'REJECTED':<8}")
        logger.info("-" * 55)
        for s in config.suppliers:
            # Only log if they were actually configured for this category (meaning they could have been found)
            if category in s.category_map:
                st = supplier_stats[s.id]
                logger.info(f"{s.id:<20} {st['found']:<7} {st['active']:<8} {st['locked']:<8} {st['rejected']:<8}")
        logger.info(f"-----------------------------")
        
        logger.info(f"RUN STATUS: {pipeline_status}")
        logger.info(f"Pipeline [Run {run_id}] finished. Top {len(final_valid)} generated.")
        
    except Exception as e:
        logger.error(f"Pipeline failed: {e}", exc_info=True)
    finally:
        await browser_manager.stop()
