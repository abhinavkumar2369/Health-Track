"""
API v1 Endpoints - Health Recommendations
"""

from fastapi import APIRouter, HTTPException, status
from app.api.schemas import (
    RecommendationRequest,
    RecommendationResponse,
    ErrorResponse
)
from app.services.ml_service import ml_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate", response_model=RecommendationResponse, status_code=status.HTTP_200_OK)
async def generate_recommendations(request: RecommendationRequest):
    """
    Generate personalized health recommendations
    
    - **patient_id**: Unique patient identifier
    - **current_health_status**: Current health metrics and status
    - **goals**: Health goals
    - **preferences**: Patient preferences and constraints
    """
    try:
        logger.info(f"Recommendation request for patient: {request.patient_id}")
        
        # Convert request to dict
        data = request.dict()
        
        # Process with ML service
        result = await ml_service.generate_recommendations(data)
        
        return result
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation generation failed: {str(e)}"
        )
