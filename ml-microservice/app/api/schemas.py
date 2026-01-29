"""
Pydantic models/schemas for API requests and responses
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Health Prediction Models
class HealthPredictionRequest(BaseModel):
    patient_id: str
    age: int = Field(..., ge=0, le=150)
    gender: str = Field(..., pattern="^(male|female|other)$")
    symptoms: List[str] = Field(..., min_items=1)
    vital_signs: Optional[Dict[str, float]] = None
    medical_history: Optional[List[str]] = None
    
class HealthPredictionResponse(BaseModel):
    success: bool
    patient_id: str
    predictions: List[Dict[str, Any]]
    risk_score: float = Field(..., ge=0, le=1)
    recommendations: List[str]
    confidence: float = Field(..., ge=0, le=1)
    timestamp: str

# Diagnostic Assistance Models
class DiagnosticRequest(BaseModel):
    patient_id: str
    symptoms: List[str] = Field(..., min_items=1)
    duration: Optional[str] = None
    severity: Optional[str] = Field(None, pattern="^(mild|moderate|severe)$")
    patient_info: Optional[Dict[str, Any]] = None

class DiagnosticResponse(BaseModel):
    success: bool
    patient_id: str
    possible_conditions: List[Dict[str, Any]]
    suggested_tests: List[str]
    urgency_level: str
    recommendations: List[str]
    timestamp: str

# Prescription Analysis Models
class PrescriptionAnalysisRequest(BaseModel):
    patient_id: str
    medications: List[Dict[str, Any]] = Field(..., min_items=1)
    allergies: Optional[List[str]] = None
    current_conditions: Optional[List[str]] = None
    
class PrescriptionAnalysisResponse(BaseModel):
    success: bool
    patient_id: str
    interactions: List[Dict[str, Any]]
    contraindications: List[Dict[str, Any]]
    dosage_recommendations: List[Dict[str, Any]]
    warnings: List[str]
    safe: bool
    timestamp: str

# Medical Report Analysis Models
class ReportAnalysisRequest(BaseModel):
    patient_id: str
    report_type: str
    report_data: Dict[str, Any]
    previous_reports: Optional[List[Dict[str, Any]]] = None

class ReportAnalysisResponse(BaseModel):
    success: bool
    patient_id: str
    analysis: Dict[str, Any]
    abnormalities: List[Dict[str, Any]]
    trends: Optional[Dict[str, Any]] = None
    recommendations: List[str]
    severity: str
    timestamp: str

# Health Recommendations Models
class RecommendationRequest(BaseModel):
    patient_id: str
    current_health_status: Dict[str, Any]
    goals: Optional[List[str]] = None
    preferences: Optional[Dict[str, Any]] = None

class RecommendationResponse(BaseModel):
    success: bool
    patient_id: str
    lifestyle_recommendations: List[Dict[str, Any]]
    dietary_suggestions: List[Dict[str, Any]]
    exercise_plan: Optional[Dict[str, Any]] = None
    preventive_measures: List[str]
    timestamp: str

# Document Summarization Models
class DocumentSummarizationRequest(BaseModel):
    patient_id: str
    document_id: str
    document_text: str
    document_type: str = Field(..., pattern="^(lab-report|prescription|scan|consultation|other)$")
    metadata: Optional[Dict[str, Any]] = None

class DocumentSummarizationResponse(BaseModel):
    success: bool
    patient_id: str
    document_id: str
    summary: str
    key_findings: List[str]
    medical_terms: List[Dict[str, str]]
    recommendations: List[str]
    urgency_level: str
    timestamp: str

# Generic Error Response
class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    message: str
    timestamp: str
