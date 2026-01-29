import express from 'express';
import jwt from 'jsonwebtoken';
import AWS from 'aws-sdk';
import PDFDocument from 'pdfkit';
import axios from 'axios';
import { Document } from '../models/Document.js';
import { Patient } from '../models/Patient.js';

const router = express.Router();

// ML Microservice URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000/api/v1";

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Helper function to verify token and get user info
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        return decoded;
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// Helper function to get document text from S3
const getDocumentTextFromS3 = async (s3Key, fileType) => {
    try {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key
        };

        const s3Object = await s3.getObject(params).promise();
        
        // For now, return a placeholder text
        // In production, you would use proper parsers for PDF, images (OCR), etc.
        return `Document content from ${s3Key}`;
    } catch (error) {
        console.error('Error fetching from S3:', error);
        return null;
    }
};

// Helper function to generate AI summary if not exists
const getOrGenerateSummary = async (document, patientId) => {
    // If already summarized, return existing summary
    if (document.isSummarized && document.aiSummary) {
        return document.aiSummary;
    }

    try {
        // Get document text from S3
        const documentText = await getDocumentTextFromS3(document.s3Key, document.fileType) || 
            `Medical document: ${document.originalName}. Category: ${document.category}.`;

        // Call ML microservice for summarization
        const mlResponse = await axios.post(
            `${ML_SERVICE_URL}/document/summarize`,
            {
                patient_id: patientId,
                document_id: document._id.toString(),
                document_text: documentText,
                document_type: document.category,
                metadata: {
                    originalName: document.originalName,
                    fileType: document.fileType
                }
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );

        // Save the summary to database
        document.aiSummary = {
            summary: mlResponse.data.summary,
            keyFindings: mlResponse.data.key_findings,
            medicalTerms: mlResponse.data.medical_terms,
            recommendations: mlResponse.data.recommendations,
            urgencyLevel: mlResponse.data.urgency_level,
            summarizedAt: new Date(),
            summarizedBy: 'AI System'
        };
        document.isSummarized = true;
        await document.save();

        return document.aiSummary;
    } catch (error) {
        console.error('Error generating summary:', error);
        return null;
    }
};

// Helper function to generate PDF report
const generatePDFReport = async (patient, documents, documentsWithSummaries) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header with colors
            doc.fillColor('#2563eb')
               .fontSize(28)
               .text('Health Track', 50, 50)
               .fontSize(10)
               .fillColor('#64748b')
               .text('Comprehensive Health Report', 50, 85);

            // Patient Information Box
            doc.rect(50, 110, 495, 80).fillAndStroke('#eff6ff', '#2563eb');
            doc.fillColor('#1e3a8a')
               .fontSize(14)
               .text('Patient Information', 60, 120);
            
            doc.fillColor('#334155')
               .fontSize(10)
               .text(`Name: ${patient.fullname || patient.email}`, 60, 145)
               .text(`Email: ${patient.email}`, 60, 160)
               .text(`Report Generated: ${new Date().toLocaleString()}`, 60, 175);

            // Summary Statistics
            const yPos = 210;
            doc.fillColor('#2563eb')
               .fontSize(16)
               .text('Report Summary', 50, yPos);

            const stats = [
                { label: 'Total Documents', value: documents.length, color: '#3b82f6' },
                { label: 'AI Summarized', value: documents.filter(d => d.isSummarized).length, color: '#8b5cf6' },
                { label: 'Lab Reports', value: documents.filter(d => d.category === 'lab-report').length, color: '#06b6d4' },
                { label: 'Prescriptions', value: documents.filter(d => d.category === 'prescription').length, color: '#10b981' },
                { label: 'Scans', value: documents.filter(d => d.category === 'scan').length, color: '#f59e0b' },
                { label: 'Consultations', value: documents.filter(d => d.category === 'consultation').length, color: '#ec4899' }
            ];

            let statY = yPos + 30;
            stats.forEach(stat => {
                doc.fillColor('#64748b')
                   .fontSize(10)
                   .text(`${stat.label}:`, 60, statY)
                   .fillColor(stat.color)
                   .fontSize(12)
                   .text(stat.value.toString(), 200, statY - 1);
                statY += 20;
            });

            // Document Details
            doc.addPage();
            doc.fillColor('#2563eb')
               .fontSize(16)
               .text('Detailed Document Analysis', 50, 50);

            let currentY = 90;

            documentsWithSummaries.forEach((docData, index) => {
                // Check if we need a new page
                if (currentY > 700) {
                    doc.addPage();
                    currentY = 50;
                }

                // Document header box
                const categoryColors = {
                    'lab-report': '#3b82f6',
                    'prescription': '#8b5cf6',
                    'scan': '#ec4899',
                    'consultation': '#10b981',
                    'other': '#64748b'
                };

                doc.rect(50, currentY, 495, 25)
                   .fillAndStroke(categoryColors[docData.document.category] + '20', categoryColors[docData.document.category]);
                
                doc.fillColor('#1e293b')
                   .fontSize(12)
                   .text(`${index + 1}. ${docData.document.title || docData.document.originalName}`, 60, currentY + 8);

                currentY += 35;

                // Document info
                doc.fillColor('#64748b')
                   .fontSize(9)
                   .text(`Category: ${docData.document.category} | Uploaded: ${new Date(docData.document.createdAt).toLocaleDateString()}`, 60, currentY);

                currentY += 20;

                // AI Summary if available
                if (docData.summary) {
                    doc.fillColor('#374151')
                       .fontSize(10)
                       .text('AI Summary:', 60, currentY, { continued: false });
                    
                    currentY += 15;
                    
                    doc.fillColor('#4b5563')
                       .fontSize(9)
                       .text(docData.summary.summary || 'No summary available', 60, currentY, {
                           width: 480,
                           align: 'justify'
                       });
                    
                    currentY += doc.heightOfString(docData.summary.summary || 'No summary available', {
                        width: 480
                    }) + 10;

                    // Key Findings
                    if (docData.summary.keyFindings && docData.summary.keyFindings.length > 0) {
                        doc.fillColor('#374151')
                           .fontSize(10)
                           .text('Key Findings:', 60, currentY);
                        
                        currentY += 15;

                        docData.summary.keyFindings.slice(0, 3).forEach(finding => {
                            if (currentY > 720) {
                                doc.addPage();
                                currentY = 50;
                            }
                            
                            doc.fillColor('#4b5563')
                               .fontSize(8)
                               .text(`• ${finding}`, 70, currentY, { width: 470 });
                            
                            currentY += 15;
                        });
                    }

                    // Urgency level
                    if (docData.summary.urgencyLevel) {
                        const urgencyColors = {
                            'high': '#dc2626',
                            'medium': '#f59e0b',
                            'low': '#10b981'
                        };
                        
                        doc.fillColor(urgencyColors[docData.summary.urgencyLevel])
                           .fontSize(9)
                           .text(`Priority: ${docData.summary.urgencyLevel.toUpperCase()}`, 60, currentY);
                        
                        currentY += 20;
                    }
                } else {
                    doc.fillColor('#94a3b8')
                       .fontSize(9)
                       .text('No AI summary generated yet.', 60, currentY);
                    currentY += 20;
                }

                currentY += 15;
            });

            // Footer on last page
            doc.fillColor('#94a3b8')
               .fontSize(8)
               .text('This report is AI-generated and should be reviewed by healthcare professionals.', 50, 750, {
                   align: 'center',
                   width: 495
               })
               .text('Health Track © 2026 - Confidential Medical Report', 50, 765, {
                   align: 'center',
                   width: 495
               });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

// Generate health report for patient
router.post('/generate', async (req, res) => {
    try {
        const { token, includeRecords, includeAppointments, includePrescriptions, includeHealthMetrics } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = verifyToken(token);
        
        if (decoded.role !== 'patient') {
            return res.status(403).json({ success: false, message: 'Only patients can generate health reports' });
        }

        // Get patient information
        const patient = await Patient.findById(decoded.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Get patient's documents
        let documents = [];
        if (includeRecords) {
            documents = await Document.find({ patient_id: decoded.id })
                .sort({ createdAt: -1 });
        }

        // Get or generate summaries for all documents
        console.log('Generating summaries for documents...');
        const documentsWithSummaries = await Promise.all(
            documents.map(async (doc) => {
                const summary = await getOrGenerateSummary(doc, decoded.id);
                return {
                    document: doc,
                    summary: summary
                };
            })
        );

        console.log('Generating PDF report...');
        // Generate PDF
        const pdfBuffer = await generatePDFReport(patient, documents, documentsWithSummaries);

        // Upload PDF to S3
        const timestamp = Date.now();
        const fileName = `health_report_${patient._id}_${timestamp}.pdf`;
        const s3Key = `health-reports/${patient._id}/${fileName}`;

        const s3Params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
            ACL: 'private'
        };

        console.log('Uploading PDF to S3...');
        const s3UploadResult = await s3.upload(s3Params).promise();

        // Generate pre-signed URL for download (valid for 1 hour)
        const downloadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            Expires: 3600
        };

        const downloadUrl = s3.getSignedUrl('getObject', downloadParams);

        console.log('Report generated successfully!');

        res.json({
            success: true,
            message: 'Health report generated successfully',
            report: {
                id: `report_${timestamp}`,
                title: `Health Report - ${new Date().toLocaleDateString()}`,
                generatedAt: new Date().toISOString(),
                fileName: fileName,
                fileSize: pdfBuffer.length,
                s3Key: s3Key,
                s3Url: s3UploadResult.Location,
                downloadUrl: downloadUrl,
                totalDocuments: documents.length,
                summarizedDocuments: documents.filter(d => d.isSummarized).length
            }
        });

    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate health report'
        });
    }
});

// Get all reports for a patient
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

        // In production, you would fetch reports from database
        // For now, return empty array
        res.json({
            success: true,
            reports: []
        });

    } catch (error) {
        console.error('List reports error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch reports'
        });
    }
});

// View report (get pre-signed URL)
router.post('/view/:reportId', async (req, res) => {
    try {
        const { token } = req.body;
        const { reportId } = req.params;

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = verifyToken(token);
        
        // In production, fetch report from database and generate pre-signed URL
        res.status(404).json({
            success: false,
            message: 'Report viewing not yet implemented'
        });

    } catch (error) {
        console.error('View report error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to view report'
        });
    }
});

// Download report
router.post('/download/:reportId', async (req, res) => {
    try {
        const { token } = req.body;
        const { reportId } = req.params;

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = verifyToken(token);
        
        // In production, fetch report from database and generate download URL
        res.status(404).json({
            success: false,
            message: 'Report download not yet implemented'
        });

    } catch (error) {
        console.error('Download report error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to download report'
        });
    }
});

export default router;
