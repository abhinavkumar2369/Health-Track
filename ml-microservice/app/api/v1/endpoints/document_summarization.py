"""
API v1 Endpoints - Document Summarization
"""

from fastapi import APIRouter, HTTPException, status
from app.api.schemas import (
    DocumentSummarizationRequest,
    DocumentSummarizationResponse,
    ErrorResponse
)
from app.services.ml_service import ml_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/summarize", response_model=DocumentSummarizationResponse, status_code=status.HTTP_200_OK)
async def summarize_document(request: DocumentSummarizationRequest):
    """
    Summarize medical documents using AI/ML
    
    - **patient_id**: Unique patient identifier
    - **document_id**: Unique document identifier
    - **document_text**: Extracted text from the document
    - **document_type**: Type of medical document
    - **metadata**: Additional metadata about the document
    """
    try:
        logger.info(f"Document summarization request for patient: {request.patient_id}, document: {request.document_id}")
        
        # Convert request to dict
        data = request.dict()
        
        # Process with ML service
        result = await ml_service.summarize_document(data)
        
        return result
        
    except Exception as e:
        logger.error(f"Error in document summarization: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document summarization failed: {str(e)}"
        )
