import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Set
from hunter.utils.logger import logger

def write_results(run_id: str, category: str, all_active: List[Dict[str, Any]], price_locked: List[Dict[str, Any]], rejected: List[Dict[str, Any]], selected_urls: Set[str]):
    date_str = datetime.utcnow().isoformat() + "Z"
    out_dir = Path("data")
    out_dir.mkdir(exist_ok=True)
    
    findings_path = out_dir / "findings.json"
    
    # Load existing findings
    findings = {}
    if findings_path.exists():
        try:
            with open(findings_path, "r", encoding="utf-8") as f:
                findings = json.load(f)
        except Exception as e:
            logger.error(f"Failed to load existing findings.json: {e}")
            
    # Process all streams
    all_streams = [
        (all_active, "ACTIVE"),
        (price_locked, "PRICE_LOCKED"),
        (rejected, "REJECTED")
    ]
    
    updates = 0
    new_items = 0
    
    for stream, status in all_streams:
        for p in stream:
            url = p.get("canonical_url") or p.get("url")
            if not url:
                continue
                
            is_new = url not in findings
            
            if is_new:
                record = {
                    "url": url,
                    "product_name": p.get("title", ""),
                    "supplier": p.get("supplier", ""),
                    "category": category,
                    "timestamps": {
                        "first_seen": date_str,
                        "last_updated": date_str
                    }
                }
                new_items += 1
            else:
                record = findings[url]
                record["timestamps"]["last_updated"] = date_str
                updates += 1
                
            # Update fields
            if p.get("title"): record["product_name"] = p.get("title")
            if p.get("supplier"): record["supplier"] = p.get("supplier")
            if p.get("description"): record["description"] = p.get("description")
            if p.get("subcategory"): record["subcategory"] = p.get("subcategory")
            if p.get("rating"): record["rating"] = p.get("rating")
            
            record["price"] = p.get("price", 0.0)
            record["mrp"] = p.get("mrp", 0.0)
            record["price_status"] = status
            record["stock"] = p.get("availability", False)
            record["variants"] = p.get("variants", [])
            record["images"] = p.get("images", [])
            
            # AI & Scoring
            record["scores"] = p.get("score", {})
            record["ai_analysis"] = {
                "text": p.get("ai_text_analysis", {}),
                "visual": p.get("ai_visual_analysis", {})
            }
            record["market_data"] = p.get("market_median", {})
            record["confidence"] = record["scores"].get("confidence", "Low") if record.get("scores") else "Low"
            record["warnings"] = record["scores"].get("warnings", []) if record.get("scores") else []
            
            # Tracking Top 5 selections
            if url in selected_urls:
                record["last_selected_run_id"] = run_id
                
            findings[url] = record

    # Save to findings.json
    with open(findings_path, "w", encoding="utf-8") as f:
        json.dump(findings, f, indent=2)
        
    # Save to passed.json
    passed = {k: v for k, v in findings.items() if v.get("price_status") == "ACTIVE"}
    passed_path = out_dir / "passed.json"
    with open(passed_path, "w", encoding="utf-8") as f:
        json.dump(passed, f, indent=2)
        
    # Generate meesho_links.json independently
    meesho_links = []
    for k, v in passed.items():
        if v.get("supplier") == "meesho":
            meesho_links.append({
                "link": v.get("url", k),
                "category": v.get("category", category),
                "subcategory": v.get("subcategory", "")
            })
            
    meesho_links_path = out_dir / "meesho_links.json"
    with open(meesho_links_path, "w", encoding="utf-8") as f:
        json.dump(meesho_links, f, indent=2)
        
    logger.info(f"Updated findings.json: {new_items} new products, {updates} updated.")
    logger.info(f"Updated passed.json with {len(passed)} ACTIVE products.")
    logger.info(f"Generated meesho_links.json with {len(meesho_links)} links.")
