import express from 'express';
import multer from 'multer';
import AWS from 'aws-sdk';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { Document } from '../models/Document.js';
import { Patient } from '../models/Patient.js';

const router = express.Router();

// ML Microservice URL - ensure /api/v1 suffix is always present
const ML_SERVICE_BASE = (process.env.ML_SERVICE_URL || "http://localhost:8000").replace(/\/api\/v1\/?$/, '');
const ML_SERVICE_URL = `${ML_SERVICE_BASE}/api/v1`;

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Configure multer for file upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images, PDFs, and documents
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images (JPG, PNG), PDFs, and Word documents are allowed!'));
        }
    }
});

// Helper function to verify token and get patient ID
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        return decoded;
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// Upload document
router.post('/upload', upload.single('document'), async (req, res) => {
    try {
        const { token, description, category } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = verifyToken(token);
        
        if (decoded.role !== 'patient') {
            return res.status(403).json({ success: false, message: 'Only patients can upload documents' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileName = `${decoded.id}_${timestamp}_${req.file.originalname}`;
        const s3Key = `medical-records/${decoded.id}/${fileName}`;

        // Upload to S3
        const s3Params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ACL: 'private'
        };

        const s3UploadResult = await s3.upload(s3Params).promise();

        // Save document info to database
        const document = new Document({
            patient_id: decoded.id,
            title: req.file.originalname,
            fileName: fileName,
            originalName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            s3Key: s3Key,
            s3Url: s3UploadResult.Location,
            fileUrl: s3UploadResult.Location,
            description: description || '',
            category: category || 'other',
            status: 'under-review'
        });

        await document.save();

        res.json({
            success: true,
            message: 'Document uploaded successfully',
            document: {
                id: document._id,
                fileName: document.originalName,
                fileSize: document.fileSize,
                category: document.category,
                uploadedAt: document.uploadedAt,
                status: document.status
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload document'
        });
    }
});

// Get all documents for a patient
router.post('/list', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = verifyToken(token);
        
        if (decoded.role !== 'patient') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const documents = await Document.find({ patient_id: decoded.id })
            .sort({ createdAt: -1 })
            .select('-s3Key'); // Don't send S3 key to frontend

        res.json({
            success: true,
            documents: documents
        });
    } catch (error) {
        console.error('List documents error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch documents'
        });
    }
});

// Get pre-signed URL for viewing document
router.post('/view/:documentId', async (req, res) => {
    try {
        const { token } = req.body;
        const { documentId } = req.params;

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = verifyToken(token);
        
        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // Verify patient owns the document
        if (document.patient_id.toString() !== decoded.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Generate pre-signed URL (valid for 1 hour)
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: document.s3Key,
            Expires: 3600 // 1 hour
        };

        const url = s3.getSignedUrl('getObject', params);

        res.json({
            success: true,
            url: url,
            fileName: document.originalName
        });
    } catch (error) {
        console.error('View document error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate view URL'
        });
    }
});

// Download document
router.post('/download/:documentId', async (req, res) => {
    try {
        const { token } = req.body;
        const { documentId } = req.params;

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = verifyToken(token);
        
        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // Verify patient owns the document
        if (document.patient_id.toString() !== decoded.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Generate pre-signed URL for download
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: document.s3Key,
            Expires: 3600,
            ResponseContentDisposition: `attachment; filename="${document.originalName}"`
        };

        const url = s3.getSignedUrl('getObject', params);

        res.json({
            success: true,
            url: url
        });
    } catch (error) {
        console.error('Download document error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate download URL'
        });
    }
});

// Delete document
router.delete('/:documentId', async (req, res) => {
    try {
        const { token } = req.body;
        const { documentId } = req.params;

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = verifyToken(token);
        
        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // Verify patient owns the document
        if (document.patient_id.toString() !== decoded.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Delete from S3
        const s3Params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: document.s3Key
        };

        await s3.deleteObject(s3Params).promise();

        // Delete from database
        await Document.findByIdAndDelete(documentId);

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete document'
        });
    }
});

// Summarize document using AI (with CNN+Transformer OCR for images, pdfplumber for PDFs)
router.post('/summarize/:documentId', async (req, res) => {
    try {
        const { token } = req.body;
        const { documentId } = req.params;

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = verifyToken(token);
        
        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // Verify patient owns the document
        if (document.patient_id.toString() !== decoded.id && decoded.role !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        let mlResponse;
        let s3Object = null;
        let fallbackDocumentText = '';

        // Try to get file bytes from S3 for advanced OCR/PDF processing
        try {
            const s3Params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: document.s3Key
            };
            s3Object = await s3.getObject(s3Params).promise();
        } catch (s3Error) {
            console.log('S3 fetch failed, falling back to text-based summarization:', s3Error.message);
            s3Object = null;
        }

        if (s3Object && document.fileType.startsWith('image/')) {
            // For images: Send to ML microservice for TrOCR (CNN+Transformer) OCR
            const FormData = (await import('form-data')).default;
            const formData = new FormData();
            formData.append('file', s3Object.Body, {
                filename: document.originalName,
                contentType: document.fileType
            });
            formData.append('patient_id', decoded.id);
            formData.append('document_id', documentId);
            formData.append('document_type', document.category || 'prescription');
            formData.append('is_handwritten', document.category === 'prescription' ? 'true' : 'false');

            mlResponse = await axios.post(
                `${ML_SERVICE_URL}/document/summarize-image`,
                formData,
                {
                    headers: formData.getHeaders(),
                    timeout: 60000
                }
            );
        } else if (s3Object && document.fileType === 'application/pdf') {
            // For PDFs: Send to ML microservice for pdfplumber extraction + BART summarization
            const FormData = (await import('form-data')).default;
            const formData = new FormData();
            formData.append('file', s3Object.Body, {
                filename: document.originalName,
                contentType: document.fileType
            });
            formData.append('patient_id', decoded.id);
            formData.append('document_id', documentId);
            formData.append('document_type', document.category || 'other');

            mlResponse = await axios.post(
                `${ML_SERVICE_URL}/document/summarize-pdf`,
                formData,
                {
                    headers: formData.getHeaders(),
                    timeout: 60000
                }
            );
        } else {
            // Fallback: text-based summarization using document metadata
            // This runs when S3 is unavailable or for text documents
            if (s3Object && !document.fileType.startsWith('image/') && document.fileType !== 'application/pdf') {
                fallbackDocumentText = s3Object.Body.toString('utf-8');
            } else {
                // Build context from document metadata
                fallbackDocumentText = `Medical ${(document.category || 'document').replace('-', ' ')}: ${document.title || document.originalName}. ` +
                    `Category: ${document.category || 'general'}. ` +
                    `File type: ${document.fileType}. ` +
                    `Uploaded on: ${document.createdAt}. ` +
                    (document.description ? `Description: ${document.description}. ` : '') +
                    `This is a medical record that requires professional analysis.`;
            }

            mlResponse = await axios.post(
                `${ML_SERVICE_URL}/document/summarize`,
                {
                    patient_id: decoded.id,
                    document_id: documentId,
                    document_text: fallbackDocumentText,
                    document_type: document.category || 'other',
                    metadata: {
                        originalName: document.originalName,
                        fileType: document.fileType,
                        fileSize: document.fileSize,
                        uploadedAt: document.createdAt
                    }
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 30000
                }
            );
        }

        // Save summary to database
        const responseData = mlResponse.data;
        // Map ML service urgency levels to Document model enum ('low', 'medium', 'high')
        const urgencyMap = { 'low': 'low', 'moderate': 'medium', 'medium': 'medium', 'high': 'high' };
        document.aiSummary = {
            summary: responseData.summary,
            // Use extracted_text from ML (OCR/PDF pipelines), fall back to the text we sent
            extractedText: responseData.extracted_text || fallbackDocumentText || '',
            keyFindings: responseData.key_findings || [],
            // Normalize to always use 'explanation' key (ML may return 'definition' or 'explanation')
            medicalTerms: (responseData.medical_terms || []).map(t => ({
                term: t.term || '',
                explanation: t.explanation || t.definition || ''
            })),
            recommendations: responseData.recommendations || [],
            urgencyLevel: urgencyMap[responseData.urgency_level] || 'low',
            summarizedAt: new Date(),
            summarizedBy: responseData.ocr_method
                ? `AI System (OCR: ${responseData.ocr_method})`
                : 'AI System (BART Transformer)'
        };
        document.isSummarized = true;

        await document.save();

        // Return the saved aiSummary (camelCase) so the frontend receives normalized fields
        res.json({
            success: true,
            message: 'Document summarized successfully',
            summary: document.aiSummary
        });

    } catch (error) {
        console.error('Summarize document error:', error);
        res.status(500).json({
            success: false,
            message: error.response?.data?.detail || error.message || 'Failed to summarize document'
        });
    }
});

// Get document summary
router.post('/summary/:documentId', async (req, res) => {
    try {
        const { token } = req.body;
        const { documentId } = req.params;

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = verifyToken(token);
        
        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // Verify patient owns the document or is a doctor
        if (document.patient_id.toString() !== decoded.id && decoded.role !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        if (!document.isSummarized) {
            return res.status(404).json({ 
                success: false, 
                message: 'Document has not been summarized yet' 
            });
        }

        res.json({
            success: true,
            document: {
                id: document._id,
                fileName: document.originalName,
                category: document.category,
                uploadedAt: document.createdAt,
                summary: document.aiSummary
            }
        });

    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch document summary'
        });
    }
});

export default router;
