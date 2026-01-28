"""Endpoints module initialization"""

from . import health_prediction, diagnostic, prescription, report_analysis, recommendations

__all__ = ["health_prediction", "diagnostic", "prescription", "report_analysis", "recommendations"]
