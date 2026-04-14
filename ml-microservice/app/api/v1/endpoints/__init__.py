"""Endpoints module initialization"""

from . import (
    health_prediction,
    diagnostic,
    prescription,
    report_analysis,
    recommendations,
    document_summarization,
    inventory_prediction,
    appointment_scheduling
)

__all__ = [
    "health_prediction",
    "diagnostic",
    "prescription",
    "report_analysis",
    "recommendations",
    "document_summarization",
    "inventory_prediction",
    "appointment_scheduling"
]
