import os
import json
import httpx
from typing import Dict, Any, Type
from pydantic import BaseModel
from hunter.config import config
from hunter.utils.logger import logger

class OpenRouterClient:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.models = config.settings.ai.openrouter_models
        
    async def analyze_product(self, prompt: str, schema: Type[BaseModel]) -> BaseModel:
        if not self.api_key:
            logger.warning("OPENROUTER_API_KEY not set. Skipping AI analysis.")
            return None
            
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://evrevia.com",
            "X-Title": "EVREVIA Product Hunter"
        }
        
        for model in self.models:
            logger.debug(f"Trying OpenRouter model {model}")
            system_msg = (
                "You are a fashion product analyst. Respond ONLY in valid JSON format. "
                "Do not include any other text or markdown outside of the JSON block.\n"
                "Return exactly this JSON structure filled with your analysis:\n"
                "{\n"
                '  "uniqueness_score": 5,\n'
                '  "trend_fit_score": 7,\n'
                '  "customer_feedback_summary": "N/A",\n'
                '  "risk_flags": [],\n'
                '  "brand_or_replica_suspected": false,\n'
                '  "category_confirmed": true\n'
                "}"
            )
            
            # Retry once if validation fails
            for attempt in range(2):
                if attempt > 0:
                    system_msg = system_msg + "\nERROR: Your previous response was not valid JSON matching the exact structure. Please try again."
                    logger.debug(f"Retrying with shorter prompt for model {model}")
                
                payload = {
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.1
                }
                
                try:
                    async with httpx.AsyncClient(timeout=30.0) as client:
                        resp = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                        resp.raise_for_status()
                        data = resp.json()
                        
                        content = data["choices"][0]["message"]["content"].strip()
                        
                        # Fallback parsing
                        import re
                        match = re.search(r'\{.*\}', content, re.DOTALL)
                        if match:
                            content = match.group(0)
                        
                        parsed = json.loads(content)
                        
                        # Validate
                        validated = schema(**parsed)
                        return validated
                        
                except Exception as e:
                    logger.error(f"OpenRouter model {model} attempt {attempt+1} failed: {e}")
                    if attempt == 1:
                        # Skip to next model
                        pass
                        
        logger.warning("All OpenRouter models failed.")
        return None

openrouter = OpenRouterClient()
