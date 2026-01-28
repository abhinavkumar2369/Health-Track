"""
API v1 Endpoints - Health Prediction
"""

from fastapi import APIRouter, HTTPException, status
from app.api.schemas import (
    HealthPredictionRequest,
    HealthPredictionResponse,
    ErrorResponse
)
from app.services.ml_service import ml_service
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/predict", response_model=HealthPredictionResponse, status_code=status.HTTP_200_OK)
async def predict_health(request: HealthPredictionRequest):
    """
    Predict health risks based on patient data
    
    - **patient_id**: Unique patient identifier
    - **age**: Patient age
    - **gender**: Patient gender
    - **symptoms**: List of symptoms
    - **vital_signs**: Optional vital signs data
    - **medical_history**: Optional medical history
    """
    try:
        logger.info(f"Health prediction request received for patient: {request.patient_id}")
        
        # Convert request to dict
        data = request.dict()
        
        # Process with ML service
        result = await ml_service.predict_health_risk(data)
        
        return result
        
    except Exception as e:
        logger.error(f"Error in health prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Health prediction failed: {str(e)}"
        )
