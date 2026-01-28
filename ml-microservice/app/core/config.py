"""
Configuration settings for ML microservice
"""

import os
from typing import List
import json
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    RELOAD: bool = os.getenv("RELOAD", "true").lower() == "true"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # API Configuration
    API_V1_PREFIX: str = os.getenv("API_V1_PREFIX", "/api/v1")
    ALLOWED_ORIGINS: List[str] = json.loads(os.getenv("ALLOWED_ORIGINS", '["*"]'))
    
    # Backend Service
    BACKEND_SERVICE_URL: str = os.getenv("BACKEND_SERVICE_URL", "http://localhost:5000")
    
    # Model Configuration
    MODEL_PATH: str = os.getenv("MODEL_PATH", "./models")
    MAX_MODEL_CACHE_SIZE: int = int(os.getenv("MAX_MODEL_CACHE_SIZE", 5))
    
    # Feature Flags
    ENABLE_HEALTH_PREDICTION: bool = os.getenv("ENABLE_HEALTH_PREDICTION", "true").lower() == "true"
    ENABLE_DIAGNOSTIC_ASSISTANCE: bool = os.getenv("ENABLE_DIAGNOSTIC_ASSISTANCE", "true").lower() == "true"
    ENABLE_PRESCRIPTION_ANALYSIS: bool = os.getenv("ENABLE_PRESCRIPTION_ANALYSIS", "true").lower() == "true"
    ENABLE_REPORT_ANALYSIS: bool = os.getenv("ENABLE_REPORT_ANALYSIS", "true").lower() == "true"
    ENABLE_RECOMMENDATION_ENGINE: bool = os.getenv("ENABLE_RECOMMENDATION_ENGINE", "true").lower() == "true"
    
    # Security
    API_KEY_HEADER: str = os.getenv("API_KEY_HEADER", "X-API-Key")
    API_KEYS: List[str] = json.loads(os.getenv("API_KEYS", "[]"))
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", 60))
    
    # External APIs
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    HUGGINGFACE_API_KEY: str = os.getenv("HUGGINGFACE_API_KEY", "")
    
    class Config:
        case_sensitive = True

settings = Settings()
