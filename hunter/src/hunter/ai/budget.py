from datetime import datetime
from hunter.config import config
from hunter.utils.logger import logger

class AIBudgetManager:
    def __init__(self):
        # In a real app this would be backed by the ai_calls SQLite table.
        # Keeping it simple for the skeleton.
        self.daily_limit = config.settings.ai.gemini_daily_limit
        self.reserve = config.settings.ai.gemini_reserve
        self.used_today = 0
        
    def can_make_gemini_call(self) -> bool:
        if self.used_today >= (self.daily_limit - self.reserve):
            logger.warning("Gemini budget exhausted for today.")
            return False
        return True
        
    def record_gemini_call(self, success: bool):
        self.used_today += 1
        
budget_manager = AIBudgetManager()
