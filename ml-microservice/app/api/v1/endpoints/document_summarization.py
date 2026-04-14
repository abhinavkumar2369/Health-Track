"""
API v1 Endpoints - Document Summarization
Enhanced with CNN+Transformer OCR and batch summarization
"""

from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from app.api.schemas import (
    DocumentSummarizationRequest,
    DocumentSummarizationResponse,
    BatchSummarizeRequest,
    BatchSummarizeResponse,
    MedicalFileSummarizeResponse,
    ErrorResponse
)
from app.services.ml_service import ml_service, medical_summarizer
from app.services.medical_summarizer_core import (
    summarize_medical_record,
    read_pdf_bytes,
    clean_text,
    detect_red_flags,
)
import logging
import io
import tempfile
import os
from pathlib import Path
from datetime import datetime

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

        # Enrich with Medical-Summarizer core analysis
        try:
            core = summarize_medical_record(
                request.document_text,
                max_sentences=8,
                use_bart=False,
            )
            result["highlights"] = core.highlights
            result["patient_info"] = core.patient_info
            result["red_flags"] = core.red_flags
            result["sections"] = core.sections
            result["word_count"] = core.word_count
            result["sentence_count"] = core.sentence_count
            # Override urgency if red flags suggest high urgency
            if any(rf["severity"] == "error" for rf in core.red_flags):
                result["urgency_level"] = "high"
        except Exception as enrich_err:
            logger.warning(f"Medical-Summarizer enrichment failed (non-fatal): {enrich_err}")

        return result
        
    except Exception as e:
        logger.error(f"Error in document summarization: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document summarization failed: {str(e)}"
        )


@router.post("/summarize-image", status_code=status.HTTP_200_OK)
async def summarize_image_document(
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    document_id: str = Form(...),
    document_type: str = Form(default="prescription"),
    is_handwritten: bool = Form(default=True)
):
    """
    OCR + Summarize an image document (handwritten prescriptions, lab reports).
    Uses TrOCR (CNN encoder + Transformer decoder) for OCR and BART for summarization.
    
    - **file**: Image file (JPEG, PNG)
    - **patient_id**: Patient identifier
    - **document_id**: Document identifier
    - **document_type**: Type of document (prescription, lab-report, scan, etc.)
    - **is_handwritten**: Whether the document is handwritten
    """
    try:
        logger.info(f"Image OCR+Summarization for patient: {patient_id}, document: {document_id}")
        
        # Read image bytes
        image_bytes = await file.read()
        
        # Process through CNN+Transformer pipeline
        result = await medical_summarizer.process_and_summarize_image(
            image_bytes, 
            doc_type=document_type
        )
        
        # Assess urgency and generate recommendations
        text = result.get("extracted_text", "") + " " + result.get("summary", "")
        urgency = medical_summarizer._assess_urgency(text)
        recommendations = medical_summarizer._generate_recs(text, document_type)
        
        return {
            "success": True,
            "patient_id": patient_id,
            "document_id": document_id,
            "extracted_text": result.get("extracted_text", ""),
            "summary": result.get("summary", ""),
            "key_findings": result.get("key_findings", []),
            "ocr_method": result.get("ocr_method", "unknown"),
            "ocr_confidence": result.get("ocr_confidence", 0.0),
            "model_info": result.get("model_info", {}),
            "urgency_level": urgency,
            "recommendations": recommendations,
            "summarization_model": result.get("summarization_model", "unknown"),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in image summarization: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image summarization failed: {str(e)}"
        )


@router.post("/summarize-pdf", status_code=status.HTTP_200_OK)
async def summarize_pdf_document(
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    document_id: str = Form(...),
    document_type: str = Form(default="other")
):
    """
    Extract text from PDF and summarize using BART transformer.
    Uses pdfplumber for extraction and BART for summarization.
    """
    try:
        logger.info(f"PDF summarization for patient: {patient_id}, document: {document_id}")
        
        pdf_bytes = await file.read()
        
        result = await medical_summarizer.process_and_summarize_pdf(
            pdf_bytes,
            doc_type=document_type
        )
        
        text = result.get("extracted_text", "") + " " + result.get("summary", "")
        urgency = medical_summarizer._assess_urgency(text)
        recommendations = medical_summarizer._generate_recs(text, document_type)
        
        return {
            "success": True,
            "patient_id": patient_id,
            "document_id": document_id,
            "extracted_text": result.get("extracted_text", ""),
            "summary": result.get("summary", ""),
            "key_findings": result.get("key_findings", []),
            "page_count": result.get("page_count", 0),
            "extraction_method": result.get("extraction_method", "pdfplumber"),
            "urgency_level": urgency,
            "recommendations": recommendations,
            "summarization_model": result.get("summarization_model", "unknown"),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in PDF summarization: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF summarization failed: {str(e)}"
        )


@router.post("/summarize-all", status_code=status.HTTP_200_OK)
async def batch_summarize_documents(request: BatchSummarizeRequest):
    """
    Batch summarize multiple medical records using CNN+Transformer models.
    Processes each document through the appropriate pipeline (OCR for images, pdfplumber for PDFs).
    
    - **patient_id**: Patient identifier
    - **documents**: List of documents with their metadata and text
    """
    try:
        logger.info(f"Batch summarization for patient: {request.patient_id}, {len(request.documents)} documents")
        
        # Convert documents to dicts
        docs = [doc.dict() for doc in request.documents]
        
        result = await medical_summarizer.batch_summarize(docs)
        
        return {
            "success": True,
            "patient_id": request.patient_id,
            **result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in batch summarization: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch summarization failed: {str(e)}"
        )


@router.post("/generate-report", status_code=status.HTTP_200_OK)
async def generate_combined_pdf_report(
    patient_id: str = Form(...),
    patient_name: str = Form(default="Patient"),
    summaries_json: str = Form(...),
    overall_summary: str = Form(default="")
):
    """
    Generate a combined PDF report from all medical record summaries.
    Returns a downloadable PDF file.
    """
    try:
        import json
        
        logger.info(f"PDF report generation for patient: {patient_id}")
        
        summaries = json.loads(summaries_json)
        
        patient_info = {
            "name": patient_name,
            "id": patient_id
        }
        
        pdf_bytes = await medical_summarizer.generate_combined_pdf(
            patient_info, 
            summaries, 
            overall_summary
        )
        
        # Return as downloadable PDF
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="health_summary_report_{patient_id[:8]}.pdf"',
                "Content-Length": str(len(pdf_bytes))
            }
        )
        
    except Exception as e:
        logger.error(f"Error generating PDF report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF report generation failed: {str(e)}"
        )


@router.post("/summarize-medical-file", response_model=MedicalFileSummarizeResponse, status_code=status.HTTP_200_OK)
async def summarize_medical_file(
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    document_id: str = Form(...),
    max_sentences: int = Form(default=8),
    use_bart: bool = Form(default=False),
):
    """
    Upload a medical record file (.txt, .pdf, .docx, .json) and receive a
    comprehensive structured summary using the Medical-Summarizer core engine.

    Returns:
      - summary          : Extractive (or BART if use_bart=true) clinical summary
      - highlights       : Key sentences grouped by clinical category
      - patient_info     : Extracted patient demographics / identifiers
      - red_flags        : Clinical alerts (e.g. sepsis, MI, stroke)
      - sections         : Raw parsed clinical sections
      - word_count       : Total words in the record
      - sentence_count   : Total sentences analysed
      - urgency_level    : Derived urgency (low / moderate / high)
    """
    ALLOWED_EXTENSIONS = {".txt", ".pdf", ".docx", ".json"}

    try:
        filename = file.filename or "upload"
        ext = Path(filename).suffix.lower()

        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
            )

        file_bytes = await file.read()

        # Extract text based on file type
        if ext == ".txt":
            raw_text = file_bytes.decode("utf-8", errors="ignore")
        elif ext == ".pdf":
            raw_text = read_pdf_bytes(file_bytes)
        elif ext in (".docx",):
            # Write to temp file for python-docx
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                tmp.write(file_bytes)
                tmp_path = tmp.name
            try:
                from app.services.medical_summarizer_core import read_docx_file
                raw_text = read_docx_file(Path(tmp_path))
            finally:
                os.unlink(tmp_path)
        elif ext == ".json":
            import json as _json
            try:
                data = _json.loads(file_bytes.decode("utf-8", errors="ignore"))
                raw_text = _json.dumps(data, indent=2)
            except Exception:
                raw_text = file_bytes.decode("utf-8", errors="ignore")
        else:
            raw_text = file_bytes.decode("utf-8", errors="ignore")

        if not raw_text.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No readable text could be extracted from the uploaded file.",
            )

        logger.info(
            f"Medical file summarization: patient={patient_id}, "
            f"file={filename}, chars={len(raw_text)}, use_bart={use_bart}"
        )

        result = summarize_medical_record(
            raw_text,
            max_sentences=max(3, min(max_sentences, 20)),
            use_bart=use_bart,
        )

        # Derive urgency level
        if any(rf["severity"] == "error" for rf in result.red_flags):
            urgency = "high"
        elif any(rf["severity"] == "warning" for rf in result.red_flags):
            urgency = "moderate"
        else:
            urgency = "low"

        return MedicalFileSummarizeResponse(
            success=True,
            patient_id=patient_id,
            document_id=document_id,
            filename=filename,
            file_type=ext.lstrip("."),
            summary=result.summary,
            highlights=result.highlights,
            patient_info=result.patient_info,
            red_flags=result.red_flags,
            sections=result.sections,
            word_count=result.word_count,
            sentence_count=result.sentence_count,
            urgency_level=urgency,
            timestamp=datetime.utcnow().isoformat(),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in medical file summarization: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Medical file summarization failed: {str(e)}",
        )
