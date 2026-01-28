"""
Logging configuration for ML microservice
"""

import logging
import sys
from datetime import datetime
import os

def setup_logging():
    """Setup logging configuration"""
    
    # Create logs directory if it doesn't exist
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # Configure logging format
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Get log level from environment
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, log_level),
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(
                f"{log_dir}/ml_service_{datetime.now().strftime('%Y%m%d')}.log"
            )
        ]
    )
    
    logger = logging.getLogger("ml_microservice")
    logger.setLevel(getattr(logging, log_level))
    
    return logger
