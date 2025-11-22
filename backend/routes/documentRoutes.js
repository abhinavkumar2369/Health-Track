import express from 'express';
import multer from 'multer';
import AWS from 'aws-sdk';
import jwt from 'jsonwebtoken';
import { Document } from '../models/Document.js';
import { Patient } from '../models/Patient.js';

const router = express.Router();

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
            status: 'pending'
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

export default router;
