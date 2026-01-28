"""
Health Track ML Microservice - Main Application Entry Point
FastAPI-based microservice for AI/ML health predictions and analysis
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from datetime import datetime
import os
from dotenv import load_dotenv

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logger import setup_logging

# Load environment variables
load_dotenv()

# Setup logging
logger = setup_logging()

# Initialize FastAPI app
app = FastAPI(
    title="Health Track ML Microservice",
    description="AI/ML microservice for health predictions, diagnostics, and analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
async def root():
    """Root endpoint - Health check"""
    return {
        "service": "Health Track ML Microservice",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "docs": f"{settings.API_V1_PREFIX}/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.ENVIRONMENT,
        "features": {
            "health_prediction": settings.ENABLE_HEALTH_PREDICTION,
            "diagnostic_assistance": settings.ENABLE_DIAGNOSTIC_ASSISTANCE,
            "prescription_analysis": settings.ENABLE_PRESCRIPTION_ANALYSIS,
            "report_analysis": settings.ENABLE_REPORT_ANALYSIS,
            "recommendation_engine": settings.ENABLE_RECOMMENDATION_ENGINE
        }
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Global exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "message": str(exc) if settings.ENVIRONMENT == "development" else "An error occurred"
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        log_level=settings.LOG_LEVEL.lower()
    )
