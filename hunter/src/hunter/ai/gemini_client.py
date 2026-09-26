import os
import json
import httpx
from typing import Dict, Any, Type, List
from pydantic import BaseModel
from hunter.utils.logger import logger

class GeminiClient:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.models = [
            "gemini-3.5-flash-lite", # Fastest, lightest
            "gemini-3.1-flash-lite", # Fallback ultra-light
            "gemini-3.5-flash",      # Standard flash fallback
            "gemini-3.1-pro-preview" # Legacy pro fallback
        ]
        
    async def analyze_visuals(self, prompt: str, image_paths: List[str], schema: Type[BaseModel]) -> BaseModel:
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not set. Skipping visual analysis.")
            return None
            
        parts = [{"text": prompt}]
        
        # Download and append up to 2 images to save bandwidth/quota
        import base64
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            for url in image_paths[:2]:
                try:
                    img_resp = await client.get(url)
                    img_resp.raise_for_status()
                    b64_data = base64.b64encode(img_resp.content).decode("utf-8")
                    mime_type = img_resp.headers.get("Content-Type", "image/jpeg")
                    if not mime_type.startswith("image/"):
                        mime_type = "image/jpeg"
                    parts.append({
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": b64_data
                        }
                    })
                except Exception as e:
                    logger.debug(f"Failed to fetch image {url} for Gemini: {e}")
                    
        payload = {
            "contents": [
                {
                    "parts": parts
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        
        last_error = None
        for model in self.models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
            logger.debug(f"Trying Gemini model {model}")
            
            try:
                async with httpx.AsyncClient(timeout=45.0) as client:
                    resp = await client.post(url, json=payload)
                    
                    if resp.status_code == 429:
                        # 429 applies at the API key/project level. Rotating models won't help.
                        logger.error(f"Gemini API rate limit (429) hit on model {model}. Quota likely exhausted.")
                        return None
                        
                    resp.raise_for_status()
                    data = resp.json()
                    
                    content = data["candidates"][0]["content"]["parts"][0]["text"]
                    
                    import re
                    match = re.search(r'\{.*\}', content, re.DOTALL)
                    if match:
                        content = match.group(0)
                        
                    parsed = json.loads(content.strip())
                    validated = schema(**parsed)
                    return validated
                    
            except httpx.HTTPStatusError as e:
                logger.warning(f"Gemini model {model} failed with HTTP {e.response.status_code}. Rotating to fallback...")
                last_error = e
            except Exception as e:
                logger.warning(f"Gemini model {model} failed with error: {e}. Rotating to fallback...")
                last_error = e
                
        logger.error(f"All Gemini fallback models failed. Last error: {last_error}")
        return None

gemini = GeminiClient()
