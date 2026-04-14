import express from 'express';
import jwt from 'jsonwebtoken';
import AWS from 'aws-sdk';
import PDFDocument from 'pdfkit';
import axios from 'axios';
import { Document } from '../models/Document.js';
import { Patient } from '../models/Patient.js';
import { HealthReport } from '../models/HealthReport.js';

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
const generatePDFReport = async (patient, documents, documentsWithSummaries, healthTrackerData = null) => {
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

            // Health Tracker Data Section
            if (healthTrackerData && (healthTrackerData.currentBmi || healthTrackerData.bmiHistory?.length > 0)) {
                statY += 20;
                doc.fillColor('#2563eb')
                   .fontSize(16)
                   .text('Health Tracker Data', 50, statY);

                statY += 30;

                // Current BMI
                if (healthTrackerData.currentBmi) {
                    const bmiValue = parseFloat(healthTrackerData.currentBmi);
                    const bmiCategory = bmiValue < 18.5 ? 'Underweight' :
                                       bmiValue < 25 ? 'Normal Weight' :
                                       bmiValue < 30 ? 'Overweight' : 'Obese';
                    const bmiColor = bmiValue < 18.5 ? '#eab308' :
                                    bmiValue < 25 ? '#10b981' :
                                    bmiValue < 30 ? '#f97316' : '#dc2626';

                    doc.fillColor('#64748b')
                       .fontSize(10)
                       .text('Current BMI:', 60, statY)
                       .fillColor(bmiColor)
                       .fontSize(12)
                       .text(`${bmiValue} (${bmiCategory})`, 200, statY - 1);
                    statY += 20;

                    if (healthTrackerData.currentHeight && healthTrackerData.currentWeight) {
                        doc.fillColor('#64748b')
                           .fontSize(10)
                           .text(`Height: ${healthTrackerData.currentHeight} cm | Weight: ${healthTrackerData.currentWeight} kg`, 60, statY);
                        statY += 20;
                    }
                }

                // Vital Signs
                if (healthTrackerData.bloodPressure?.systolic || healthTrackerData.heartRate || healthTrackerData.temperature) {
                    statY += 10;
                    doc.fillColor('#2563eb')
                       .fontSize(12)
                       .text('Vital Signs', 60, statY);
                    statY += 20;

                    if (healthTrackerData.bloodPressure?.systolic && healthTrackerData.bloodPressure?.diastolic) {
                        doc.fillColor('#64748b')
                           .fontSize(10)
                           .text('Blood Pressure:', 60, statY)
                           .fillColor('#334155')
                           .text(`${healthTrackerData.bloodPressure.systolic}/${healthTrackerData.bloodPressure.diastolic} mmHg`, 200, statY);
                        statY += 18;
                    }

                    if (healthTrackerData.heartRate) {
                        doc.fillColor('#64748b')
                           .fontSize(10)
                           .text('Heart Rate:', 60, statY)
                           .fillColor('#334155')
                           .text(`${healthTrackerData.heartRate} bpm`, 200, statY);
                        statY += 18;
                    }

                    if (healthTrackerData.temperature) {
                        doc.fillColor('#64748b')
                           .fontSize(10)
                           .text('Temperature:', 60, statY)
                           .fillColor('#334155')
                           .text(`${healthTrackerData.temperature} °F`, 200, statY);
                        statY += 18;
                    }
                }

                // BMI History
                if (healthTrackerData.bmiHistory && healthTrackerData.bmiHistory.length > 0) {
                    statY += 10;
                    doc.fillColor('#2563eb')
                       .fontSize(12)
                       .text('BMI History (Last 5 Records)', 60, statY);
                    statY += 20;

                    healthTrackerData.bmiHistory.slice(0, 5).forEach((entry, index) => {
                        const entryBmi = entry.bmi || 0;
                        const category = entryBmi < 18.5 ? 'Underweight' :
                                        entryBmi < 25 ? 'Normal' :
                                        entryBmi < 30 ? 'Overweight' : 'Obese';
                        const date = new Date(entry.date).toLocaleDateString();

                        doc.fillColor('#64748b')
                           .fontSize(9)
                           .text(`${date}: BMI ${entryBmi} (${category}) - ${entry.weight}kg, ${entry.height}cm`, 70, statY);
                        statY += 15;
                    });
                }
            }

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
        const { token, includeRecords, includeAppointments, includePrescriptions, includeHealthMetrics, healthTrackerData } = req.body;

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

        console.log('Generating PDF report with health tracker data...');
        // Generate PDF with health tracker data
        const pdfBuffer = await generatePDFReport(patient, documents, documentsWithSummaries, healthTrackerData);

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

        // Save report to database
        console.log('Saving report to database...');
        const healthReport = new HealthReport({
            patient_id: decoded.id,
            title: `Health Report - ${new Date().toLocaleDateString()}`,
            fileName: fileName,
            originalName: fileName,
            fileSize: pdfBuffer.length,
            s3Key: s3Key,
            s3Url: s3UploadResult.Location,
            totalDocuments: documents.length,
            summarizedDocuments: documents.filter(d => d.isSummarized).length,
            labReports: documents.filter(d => d.category === 'lab-report').length,
            prescriptions: documents.filter(d => d.category === 'prescription').length,
            scans: documents.filter(d => d.category === 'scan').length,
            consultations: documents.filter(d => d.category === 'consultation').length,
            documentIds: documents.map(d => d._id),
            includeRecords,
            includeAppointments,
            includePrescriptions,
            includeHealthMetrics,
            status: 'completed'
        });

        await healthReport.save();

        console.log('Report generated successfully!');

        res.json({
            success: true,
            message: 'Health report generated successfully',
            report: {
                id: healthReport._id,
                title: healthReport.title,
                generatedAt: healthReport.generatedAt,
                fileName: healthReport.fileName,
                fileSize: healthReport.fileSize,
                s3Key: healthReport.s3Key,
                s3Url: healthReport.s3Url,
                downloadUrl: downloadUrl,
                totalDocuments: healthReport.totalDocuments,
                summarizedDocuments: healthReport.summarizedDocuments,
                labReports: healthReport.labReports,
                prescriptions: healthReport.prescriptions,
                scans: healthReport.scans,
                consultations: healthReport.consultations
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

        // Fetch reports from database
        const reports = await HealthReport.find({ patient_id: decoded.id })
            .sort({ createdAt: -1 })
            .lean();

        // Generate fresh pre-signed URLs for each report
        const reportsWithUrls = reports.map(report => {
            const downloadParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: report.s3Key,
                Expires: 3600
            };
            const downloadUrl = s3.getSignedUrl('getObject', downloadParams);

            return {
                id: report._id,
                title: report.title,
                generatedAt: report.generatedAt,
                createdAt: report.createdAt,
                fileName: report.fileName,
                fileSize: report.fileSize,
                downloadUrl: downloadUrl,
                totalDocuments: report.totalDocuments,
                summarizedDocuments: report.summarizedDocuments,
                labReports: report.labReports,
                prescriptions: report.prescriptions,
                scans: report.scans,
                consultations: report.consultations,
                status: report.status
            };
        });

        res.json({
            success: true,
            reports: reportsWithUrls
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
        
        // Fetch report from database
        const report = await HealthReport.findById(reportId);
        
        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // Verify ownership
        if (report.patient_id.toString() !== decoded.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized access' });
        }

        // Generate pre-signed URL
        const downloadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: report.s3Key,
            Expires: 3600
        };
        const downloadUrl = s3.getSignedUrl('getObject', downloadParams);

        res.json({
            success: true,
            downloadUrl: downloadUrl
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
        
        // Fetch report from database
        const report = await HealthReport.findById(reportId);
        
        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // Verify ownership
        if (report.patient_id.toString() !== decoded.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized access' });
        }

        // Generate pre-signed URL with content-disposition for download
        const downloadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: report.s3Key,
            Expires: 3600,
            ResponseContentDisposition: `attachment; filename="${report.fileName}"`
        };
        const downloadUrl = s3.getSignedUrl('getObject', downloadParams);

        res.json({
            success: true,
            downloadUrl: downloadUrl,
            fileName: report.fileName
        });

    } catch (error) {
        console.error('Download report error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to download report'
        });
    }
});

// Delete report
router.delete('/:reportId', async (req, res) => {
    try {
        const { token } = req.body || {};
        const { reportId } = req.params;

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = verifyToken(token);

        if (decoded.role !== 'patient') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const report = await HealthReport.findById(reportId);

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // Verify patient owns this report
        if (report.patient_id.toString() !== decoded.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized access' });
        }

        // Delete file from S3 first
        try {
            await s3.deleteObject({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: report.s3Key
            }).promise();
        } catch (s3Error) {
            if (s3Error.code !== 'NoSuchKey') {
                throw s3Error;
            }

            console.warn('Report file missing in S3, deleting DB record anyway:', report.s3Key);
        }

        await HealthReport.findByIdAndDelete(reportId);

        res.json({
            success: true,
            message: 'Report deleted successfully'
        });

    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete report'
        });
    }
});

export default router;
