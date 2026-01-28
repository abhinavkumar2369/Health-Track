"""
API v1 Endpoints - Prescription Analysis
"""

from fastapi import APIRouter, HTTPException, status
from app.api.schemas import (
    PrescriptionAnalysisRequest,
    PrescriptionAnalysisResponse,
    ErrorResponse
)
from app.services.ml_service import ml_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/analyze", response_model=PrescriptionAnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_prescription(request: PrescriptionAnalysisRequest):
    """
    Analyze prescription for interactions and contraindications
    
    - **patient_id**: Unique patient identifier
    - **medications**: List of medications
    - **allergies**: Known allergies
    - **current_conditions**: Current medical conditions
    """
    try:
        logger.info(f"Prescription analysis request for patient: {request.patient_id}")
        
        # Convert request to dict
        data = request.dict()
        
        # Process with ML service
        result = await ml_service.analyze_prescription(data)
        
        return result
        
    except Exception as e:
        logger.error(f"Error in prescription analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prescription analysis failed: {str(e)}"
        )
