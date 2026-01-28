"""
API v1 Endpoints - Medical Report Analysis
"""

from fastapi import APIRouter, HTTPException, status
from app.api.schemas import (
    ReportAnalysisRequest,
    ReportAnalysisResponse,
    ErrorResponse
)
from app.services.ml_service import ml_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/analyze", response_model=ReportAnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_report(request: ReportAnalysisRequest):
    """
    Analyze medical reports and identify abnormalities
    
    - **patient_id**: Unique patient identifier
    - **report_type**: Type of medical report
    - **report_data**: Report data and values
    - **previous_reports**: Historical reports for trend analysis
    """
    try:
        logger.info(f"Report analysis request for patient: {request.patient_id}")
        
        # Convert request to dict
        data = request.dict()
        
        # Process with ML service
        result = await ml_service.analyze_report(data)
        
        return result
        
    except Exception as e:
        logger.error(f"Error in report analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report analysis failed: {str(e)}"
        )
