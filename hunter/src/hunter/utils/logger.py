import sys
from loguru import logger

def setup_logging(run_id: str = None, log_level: str = "INFO"):
    logger.remove()
    
    # Console handler
    logger.add(
        sys.stderr,
        level=log_level,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    )
    
    # File handler if run_id is provided
    if run_id:
        logger.add(
            f"logs/run_{run_id}.log",
            level="DEBUG",
            rotation="10 MB",
            retention="7 days",
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        )
        
    return logger
