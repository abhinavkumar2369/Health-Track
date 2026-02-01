"""
API v1 Router - Aggregates all v1 endpoints
"""

from fastapi import APIRouter
from app.api.v1.endpoints import (
    health_prediction,
    diagnostic,
    prescription,
    report_analysis,
    recommendations,
    document_summarization,
    inventory_prediction,
    appointment_scheduling
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    health_prediction.router,
    prefix="/health-prediction",
    tags=["Health Prediction"]
)

api_router.include_router(
    diagnostic.router,
    prefix="/diagnostic",
    tags=["Diagnostic Assistance"]
)

api_router.include_router(
    prescription.router,
    prefix="/prescription",
    tags=["Prescription Analysis"]
)

api_router.include_router(
    report_analysis.router,
    prefix="/report",
    tags=["Report Analysis"]
)

api_router.include_router(
    recommendations.router,
    prefix="/recommendations",
    tags=["Health Recommendations"]
)

api_router.include_router(
    document_summarization.router,
    prefix="/document",
    tags=["Document Summarization"]
)

api_router.include_router(
    inventory_prediction.router,
    prefix="/inventory",
    tags=["Inventory Prediction"]
)

api_router.include_router(
    appointment_scheduling.router,
    prefix="/appointments",
    tags=["Appointment Scheduling"]
)

