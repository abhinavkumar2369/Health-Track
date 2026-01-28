"""
API v1 Endpoints - Diagnostic Assistance
"""

from fastapi import APIRouter, HTTPException, status
from app.api.schemas import (
    DiagnosticRequest,
    DiagnosticResponse,
    ErrorResponse
)
from app.services.ml_service import ml_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/diagnose", response_model=DiagnosticResponse, status_code=status.HTTP_200_OK)
async def diagnose_symptoms(request: DiagnosticRequest):
    """
    Provide diagnostic assistance based on symptoms
    
    - **patient_id**: Unique patient identifier
    - **symptoms**: List of symptoms
    - **duration**: How long symptoms have persisted
    - **severity**: Symptom severity (mild, moderate, severe)
    - **patient_info**: Additional patient information
    """
    try:
        logger.info(f"Diagnostic request received for patient: {request.patient_id}")
        
        # Convert request to dict
        data = request.dict()
        
        # Process with ML service
        result = await ml_service.diagnose_symptoms(data)
        
        return result
        
    except Exception as e:
        logger.error(f"Error in diagnostic assistance: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Diagnostic assistance failed: {str(e)}"
        )
