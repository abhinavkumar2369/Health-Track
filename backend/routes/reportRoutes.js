import express from 'express';
import jwt from 'jsonwebtoken';
import AWS from 'aws-sdk';
import PDFDocument from 'pdfkit';
import axios from 'axios';
import FormData from 'form-data';
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

// Helper function to download a document from S3 and get a real AI summary via the ML microservice
const summarizeDocumentFromFile = async (document, patientId) => {
    try {
        // Generate a short-lived signed URL
        const signedUrl = s3.getSignedUrl('getObject', {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: document.s3Key,
            Expires: 300 // 5 minutes
        });

        // Download the actual file bytes
        const fileResponse = await axios.get(signedUrl, {
            responseType: 'arraybuffer',
            timeout: 60000
        });
        const fileBuffer = Buffer.from(fileResponse.data);

        const originalName = document.originalName || document.fileName || 'document.pdf';
        const ext = originalName.includes('.')
            ? originalName.slice(originalName.lastIndexOf('.')).toLowerCase()
            : '.pdf';

        // ML service only handles text-based formats
        const supportedExts = ['.pdf', '.docx', '.txt', '.json'];
        if (!supportedExts.includes(ext)) {
            console.log(`Skipping ML summarization for unsupported file type: ${ext} (${originalName})`);
            return null;
        }

        // Build multipart form
        const formData = new FormData();
        formData.append('file', fileBuffer, {
            filename: originalName,
            contentType: fileResponse.headers['content-type'] || 'application/octet-stream'
        });
        formData.append('patient_id', patientId.toString());
        formData.append('document_id', document._id.toString());

        const mlResponse = await axios.post(
            `${ML_SERVICE_URL}/document/summarize-medical-file`,
            formData,
            {
                headers: formData.getHeaders(),
                timeout: 180000 // 3 minutes per document
            }
        );

        const data = mlResponse.data;
        if (data && data.success !== false) {
            // Normalise to the same schema used when saving
            const summary = data.summary || '';
            const keyFindings = Array.isArray(data.key_findings)
                ? data.key_findings
                : Array.isArray(data.highlights)
                    ? Object.values(data.highlights).flat()
                    : [];
            const recommendations = Array.isArray(data.recommendations) ? data.recommendations : [];
            const medicalTerms = Array.isArray(data.medical_terms)
                ? data.medical_terms
                : Object.entries(data.highlights || {}).map(([term, items]) => ({ term, explanation: items.join('; ') }));

            return {
                summary,
                keyFindings,
                recommendations,
                medicalTerms,
                urgencyLevel: data.urgency_level || 'low',
                redFlags: Array.isArray(data.red_flags) ? data.red_flags : [],
                patientInfo: data.patient_info || {},
                sections: data.sections || {},
                highlights: data.highlights || {},
                wordCount: data.word_count,
                sentenceCount: data.sentence_count,
                summarizedAt: new Date(),
                summarizedBy: 'AI System (Medical-Summarizer)'
            };
        }
        return null;
    } catch (error) {
        console.error(`Error summarizing document ${document._id} from S3:`, error.message);
        return null;
    }
};

// Helper function to get or generate AI summary for a document
const getOrGenerateSummary = async (document, patientId) => {
    // If already summarized, return existing summary
    if (document.isSummarized && document.aiSummary) {
        return document.aiSummary;
    }

    try {
        // Try the file-based approach first (real content)
        const fileSummary = await summarizeDocumentFromFile(document, patientId);
        if (fileSummary) {
            document.aiSummary = fileSummary;
            document.isSummarized = true;
            await document.save();
            return fileSummary;
        }
    } catch (error) {
        console.error('File-based summarization failed, falling back to text endpoint:', error.message);
    }

    try {
        // Fallback: call text-based summarize endpoint with document metadata
        const documentText = `Medical document: ${document.originalName}. Category: ${document.category}. Description: ${document.description || 'N/A'}.`;

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

        document.aiSummary = {
            summary: mlResponse.data.summary,
            keyFindings: mlResponse.data.key_findings || [],
            medicalTerms: mlResponse.data.medical_terms || [],
            recommendations: mlResponse.data.recommendations || [],
            urgencyLevel: mlResponse.data.urgency_level || 'low',
            redFlags: mlResponse.data.red_flags || [],
            summarizedAt: new Date(),
            summarizedBy: 'AI System'
        };
        document.isSummarized = true;
        await document.save();

        return document.aiSummary;
    } catch (error) {
        console.error('Error generating summary:', error.message);
        return null;
    }
};

// Helper – draw a footer line on the current page
const drawPageFooter = (doc, pageNum) => {
    const bottom = doc.page.height - 30;
    doc.save()
       .moveTo(50, bottom - 10).lineTo(doc.page.width - 50, bottom - 10).strokeColor('#e2e8f0').lineWidth(0.5).stroke()
       .fillColor('#94a3b8').fontSize(7)
       .text('This report is AI-generated and must be reviewed by a qualified healthcare professional.', 50, bottom - 6, { width: 350, align: 'left' })
       .text(`Page ${pageNum}`, doc.page.width - 100, bottom - 6, { width: 50, align: 'right' })
       .restore();
};

// Helper – add a coloured section heading
const sectionHeading = (doc, text, y, color = '#2563eb') => {
    doc.fillColor(color).fontSize(13).font('Helvetica-Bold').text(text, 50, y);
    doc.moveTo(50, y + 18).lineTo(doc.page.width - 50, y + 18).strokeColor(color).lineWidth(0.8).stroke();
    return y + 28;
};

// Helper function to generate PDF report
const generatePDFReport = async (patient, documents, documentsWithSummaries, healthTrackerData = null) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4', autoFirstPage: true });
            const chunks = [];
            let pageNum = 1;

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // ─── PAGE 1 : COVER ────────────────────────────────────────────
            // Background accent strip
            doc.rect(0, 0, doc.page.width, 200).fill('#1e40af');

            // Logo / title
            doc.fillColor('#ffffff').fontSize(32).font('Helvetica-Bold')
               .text('Health Track', 50, 60);
            doc.fillColor('#bfdbfe').fontSize(12).font('Helvetica')
               .text('Comprehensive AI-Powered Health Report', 50, 100);

            // Patient info box
            const patName = patient.fullname || patient.fullName || patient.email;
            doc.fillColor('#dbeafe').fontSize(10)
               .text(`Patient: ${patName}`, 50, 125)
               .text(`Email: ${patient.email}`, 50, 140)
               .text(`Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}`, 50, 155);

            // Summary stats boxes
            const statsY = 220;
            const statsItems = [
                { label: 'Total\nDocuments', value: documents.length, color: '#3b82f6' },
                { label: 'AI\nSummarised', value: documentsWithSummaries.filter(d => d.summary).length, color: '#8b5cf6' },
                { label: 'Lab\nReports', value: documents.filter(d => d.category === 'lab-report').length, color: '#06b6d4' },
                { label: 'Prescriptions', value: documents.filter(d => d.category === 'prescription').length, color: '#10b981' },
                { label: 'Scans', value: documents.filter(d => d.category === 'scan').length, color: '#f59e0b' },
                { label: 'Consult-\nations', value: documents.filter(d => d.category === 'consultation').length, color: '#ec4899' }
            ];

            const boxW = 80, boxH = 70, boxGap = 10;
            const totalBoxWidth = statsItems.length * boxW + (statsItems.length - 1) * boxGap;
            let bx = (doc.page.width - totalBoxWidth) / 2;

            statsItems.forEach(s => {
                doc.rect(bx, statsY, boxW, boxH).fillAndStroke(s.color + '18', s.color);
                doc.fillColor(s.color).fontSize(22).font('Helvetica-Bold').text(String(s.value), bx, statsY + 10, { width: boxW, align: 'center' });
                doc.fillColor('#475569').fontSize(7.5).font('Helvetica').text(s.label, bx + 4, statsY + 38, { width: boxW - 8, align: 'center' });
                bx += boxW + boxGap;
            });

            // Urgency breakdown (computed from documentsWithSummaries)
            let covHigh = 0, covMedium = 0, covLow = 0, covNone = 0;
            for (const { summary } of documentsWithSummaries) {
                if (!summary) { covNone++; continue; }
                const ul = (summary.urgencyLevel || '').toLowerCase();
                if (ul === 'high') covHigh++;
                else if (ul === 'medium' || ul === 'moderate') covMedium++;
                else if (ul === 'low') covLow++;
                else covNone++;
            }

            // Urgency summary table on cover
            let noteY = statsY + boxH + 30;
            doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text('Document Urgency Summary', 50, noteY);
            noteY += 18;

            // Table header
            doc.rect(50, noteY, 495, 18).fill('#1e293b');
            doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
               .text('Urgency Level', 60, noteY + 5)
               .text('Documents', 200, noteY + 5)
               .text('Status', 300, noteY + 5)
               .text('Action Required', 390, noteY + 5);
            noteY += 18;

            const urgencyRows = [
                { label: 'Critical / High', count: covHigh, color: '#dc2626', bg: '#fef2f2', status: 'Immediate attention', action: 'Consult doctor urgently' },
                { label: 'Moderate / Medium', count: covMedium, color: '#d97706', bg: '#fffbeb', status: 'Follow up needed', action: 'Schedule appointment' },
                { label: 'Normal / Low', count: covLow, color: '#059669', bg: '#f0fdf4', status: 'Routine', action: 'Regular monitoring' },
                { label: 'Not Analysed', count: covNone, color: '#64748b', bg: '#f8fafc', status: 'No data', action: 'Re-upload as PDF/DOCX' },
            ];

            urgencyRows.forEach((row, ri) => {
                doc.rect(50, noteY, 495, 20).fill(ri % 2 === 0 ? row.bg : '#ffffff');
                doc.rect(50, noteY, 4, 20).fill(row.color);
                doc.fillColor('#1e293b').fontSize(8.5).font('Helvetica')
                   .text(row.label, 60, noteY + 6)
                   .text(String(row.count), 200, noteY + 6)
                   .text(row.status, 300, noteY + 6);
                doc.fillColor(row.color).fontSize(8).font('Helvetica-Bold')
                   .text(row.action, 390, noteY + 6, { width: 150 });
                noteY += 20;
            });

            // Colour key underneath
            noteY += 12;
            doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text('Colour key:', 50, noteY);
            noteY += 12;
            [['#dc2626', 'High – immediate clinical attention required'],
             ['#d97706', 'Medium – follow up soon'],
             ['#059669', 'Low – routine monitoring'],
             ['#64748b', 'Not analysed (unsupported file type or ML unavailable)']].forEach(([c, l]) => {
                doc.rect(50, noteY, 8, 8).fill(c);
                doc.fillColor('#374151').fontSize(7.5).font('Helvetica').text(l, 63, noteY + 0.5);
                noteY += 13;
            });

            drawPageFooter(doc, pageNum++);

            // ─── PAGE 2 : HEALTH TRACKER DATA ─────────────────────────────
            if (healthTrackerData && (healthTrackerData.currentBmi || healthTrackerData.bmiHistory?.length > 0 ||
                healthTrackerData.bloodPressure?.systolic || healthTrackerData.heartRate || healthTrackerData.temperature)) {

                doc.addPage();
                let y = 50;
                y = sectionHeading(doc, 'Health Tracker Data', y, '#0891b2');

                if (healthTrackerData.currentBmi) {
                    const bmiVal = parseFloat(healthTrackerData.currentBmi);
                    const bmiCategory = bmiVal < 18.5 ? 'Underweight' : bmiVal < 25 ? 'Normal Weight' : bmiVal < 30 ? 'Overweight' : 'Obese';
                    const bmiColor = bmiVal < 18.5 ? '#eab308' : bmiVal < 25 ? '#10b981' : bmiVal < 30 ? '#f97316' : '#dc2626';
                    doc.rect(50, y, 495, 50).fillAndStroke('#f0f9ff', '#0891b2');
                    doc.fillColor('#0c4a6e').fontSize(10).font('Helvetica-Bold').text('Current BMI', 60, y + 8);
                    doc.fillColor(bmiColor).fontSize(20).font('Helvetica-Bold').text(String(bmiVal), 60, y + 22);
                    doc.fillColor(bmiColor).fontSize(10).font('Helvetica').text(`(${bmiCategory})`, 105, y + 27);
                    if (healthTrackerData.currentHeight && healthTrackerData.currentWeight) {
                        doc.fillColor('#475569').fontSize(9).text(`Height: ${healthTrackerData.currentHeight} cm  |  Weight: ${healthTrackerData.currentWeight} kg`, 280, y + 20);
                    }
                    y += 65;
                }

                // Vital signs
                const vitals = [];
                if (healthTrackerData.bloodPressure?.systolic && healthTrackerData.bloodPressure?.diastolic) {
                    vitals.push({ label: 'Blood Pressure', value: `${healthTrackerData.bloodPressure.systolic}/${healthTrackerData.bloodPressure.diastolic} mmHg` });
                }
                if (healthTrackerData.heartRate) vitals.push({ label: 'Heart Rate', value: `${healthTrackerData.heartRate} bpm` });
                if (healthTrackerData.temperature) vitals.push({ label: 'Temperature', value: `${healthTrackerData.temperature} °F` });

                if (vitals.length > 0) {
                    doc.fillColor('#374151').fontSize(10).font('Helvetica-Bold').text('Vital Signs', 50, y);
                    y += 16;
                    vitals.forEach(v => {
                        doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(`${v.label}:`, 60, y);
                        doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold').text(v.value, 200, y);
                        y += 16;
                    });
                    y += 10;
                }

                // BMI history table
                if (healthTrackerData.bmiHistory?.length > 0) {
                    doc.fillColor('#374151').fontSize(10).font('Helvetica-Bold').text('BMI History', 50, y);
                    y += 16;
                    // Header row
                    doc.rect(50, y, 495, 18).fill('#e0f2fe');
                    doc.fillColor('#0c4a6e').fontSize(8).font('Helvetica-Bold')
                       .text('Date', 55, y + 5)
                       .text('BMI', 160, y + 5)
                       .text('Category', 220, y + 5)
                       .text('Weight (kg)', 340, y + 5)
                       .text('Height (cm)', 440, y + 5);
                    y += 18;

                    healthTrackerData.bmiHistory.forEach((entry, idx) => {
                        if (y > 730) { doc.addPage(); drawPageFooter(doc, pageNum++); y = 50; }
                        const rowBg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
                        doc.rect(50, y, 495, 16).fill(rowBg);
                        const cat = entry.bmi < 18.5 ? 'Underweight' : entry.bmi < 25 ? 'Normal' : entry.bmi < 30 ? 'Overweight' : 'Obese';
                        doc.fillColor('#374151').fontSize(8).font('Helvetica')
                           .text(new Date(entry.date).toLocaleDateString(), 55, y + 4)
                           .text(String(entry.bmi), 160, y + 4)
                           .text(cat, 220, y + 4)
                           .text(String(entry.weight), 340, y + 4)
                           .text(String(entry.height), 440, y + 4);
                        y += 16;
                    });
                }

                drawPageFooter(doc, pageNum++);
            }

            // ─── DOCUMENT ANALYSIS PAGES ───────────────────────────────────
            const categoryColors = {
                'lab-report': '#3b82f6',
                'prescription': '#8b5cf6',
                'scan': '#ec4899',
                'consultation': '#10b981',
                'other': '#64748b'
            };

            // Collect all key findings and recommendations across documents for the summary page
            const allKeyFindings = [];
            const allRecommendations = [];
            const highUrgencyDocs = [];

            documentsWithSummaries.forEach((docData, index) => {
                doc.addPage();
                let y = 50;

                const catColor = categoryColors[docData.document.category] || '#64748b';

                // Document header
                doc.rect(50, y, 495, 32).fill(catColor);
                doc.fillColor('#ffffff').fontSize(13).font('Helvetica-Bold')
                   .text(`${index + 1}. ${docData.document.title || docData.document.originalName}`, 60, y + 10, { width: 475 });
                y += 42;

                // Meta row
                doc.fillColor('#64748b').fontSize(8).font('Helvetica')
                   .text(`Category: ${docData.document.category}`, 50, y)
                   .text(`Uploaded: ${new Date(docData.document.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}`, 200, y)
                   .text(`File: ${docData.document.originalName}`, 380, y);
                y += 20;

                if (!docData.summary) {
                    doc.fillColor('#94a3b8').fontSize(9).font('Helvetica')
                       .text('No AI summary available for this document. (Unsupported file type or ML service unavailable.)', 50, y, { width: 495 });
                    drawPageFooter(doc, pageNum++);
                    return;
                }

                const s = docData.summary;

                // Urgency badge
                if (s.urgencyLevel) {
                    const urgColor = s.urgencyLevel === 'high' ? '#dc2626' : s.urgencyLevel === 'medium' ? '#f59e0b' : '#10b981';
                    doc.rect(50, y, 100, 18).fill(urgColor);
                    doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
                       .text(`PRIORITY: ${s.urgencyLevel.toUpperCase()}`, 52, y + 5, { width: 96, align: 'center' });
                    y += 26;
                    if (s.urgencyLevel === 'high') highUrgencyDocs.push(docData.document.title || docData.document.originalName);
                }

                // AI Summary
                y = sectionHeading(doc, 'AI Summary', y, catColor);
                const summaryText = s.summary || 'No summary generated.';
                const summaryHeight = doc.heightOfString(summaryText, { width: 475, fontSize: 9 }) + 10;
                if (y + summaryHeight > 730) { doc.addPage(); drawPageFooter(doc, pageNum++); y = 50; }
                doc.rect(50, y - 5, 495, summaryHeight + 10).fill('#f8fafc');
                doc.fillColor('#1e293b').fontSize(9).font('Helvetica').text(summaryText, 55, y, { width: 475, align: 'justify' });
                y += summaryHeight + 10;

                // Red Flags
                if (s.redFlags?.length > 0) {
                    if (y > 680) { doc.addPage(); drawPageFooter(doc, pageNum++); y = 50; }
                    y = sectionHeading(doc, `Clinical Alerts (${s.redFlags.length})`, y, '#dc2626');
                    s.redFlags.forEach(flag => {
                        if (y > 720) { doc.addPage(); drawPageFooter(doc, pageNum++); y = 50; }
                        const desc = typeof flag === 'string' ? flag : flag.description || String(flag);
                        const severity = typeof flag === 'object' ? flag.severity : 'warning';
                        const flagColor = severity === 'error' ? '#dc2626' : '#f59e0b';
                        doc.rect(50, y, 6, 12).fill(flagColor);
                        doc.fillColor(flagColor).fontSize(8).font('Helvetica-Bold').text(severity === 'error' ? 'ALERT' : 'NOTICE', 62, y + 2);
                        doc.fillColor('#374151').fontSize(8).font('Helvetica').text(desc, 110, y + 2, { width: 430 });
                        y += 18;
                    });
                    y += 6;
                }

                // Key Findings
                if (s.keyFindings?.length > 0) {
                    if (y > 680) { doc.addPage(); drawPageFooter(doc, pageNum++); y = 50; }
                    y = sectionHeading(doc, `Key Findings (${s.keyFindings.length})`, y, catColor);
                    s.keyFindings.forEach((finding, fi) => {
                        if (y > 720) { doc.addPage(); drawPageFooter(doc, pageNum++); y = 50; }
                        const text = typeof finding === 'string' ? finding : String(finding);
                        const fh = doc.heightOfString(text, { width: 460 });
                        doc.rect(58, y + 3, 5, 5).fill(catColor);
                        doc.fillColor('#374151').fontSize(9).font('Helvetica').text(text, 70, y, { width: 460 });
                        y += fh + 6;
                        allKeyFindings.push({ finding: text, source: docData.document.title || docData.document.originalName });
                    });
                    y += 6;
                }

                // Recommendations
                if (s.recommendations?.length > 0) {
                    if (y > 680) { doc.addPage(); drawPageFooter(doc, pageNum++); y = 50; }
                    y = sectionHeading(doc, `Recommendations (${s.recommendations.length})`, y, '#10b981');
                    s.recommendations.forEach(rec => {
                        if (y > 720) { doc.addPage(); drawPageFooter(doc, pageNum++); y = 50; }
                        const text = typeof rec === 'string' ? rec : String(rec);
                        const rh = doc.heightOfString(text, { width: 460 });
                        doc.rect(58, y + 4, 8, 8).fill('#10b981');
                        doc.fillColor('#10b981').fontSize(8).font('Helvetica-Bold').text('✓', 58, y + 3, { width: 10, align: 'center' });
                        doc.fillColor('#1e293b').fontSize(9).font('Helvetica').text(text, 72, y, { width: 458 });
                        y += rh + 6;
                        allRecommendations.push({ rec: text, source: docData.document.title || docData.document.originalName });
                    });
                    y += 6;
                }

                // Medical Terms
                if (s.medicalTerms?.length > 0) {
                    if (y > 680) { doc.addPage(); drawPageFooter(doc, pageNum++); y = 50; }
                    y = sectionHeading(doc, `Medical Terms Explained (${s.medicalTerms.length})`, y, '#8b5cf6');
                    s.medicalTerms.forEach(mt => {
                        if (y > 700) { doc.addPage(); drawPageFooter(doc, pageNum++); y = 50; }
                        const term = typeof mt === 'string' ? mt : mt.term || String(mt);
                        const explanation = typeof mt === 'object' ? mt.explanation || '' : '';
                        const block = `${term}${explanation ? ': ' + explanation : ''}`;
                        const bh = doc.heightOfString(block, { width: 465 });
                        doc.rect(50, y, 495, bh + 10).fill('#faf5ff');
                        doc.fillColor('#7c3aed').fontSize(9).font('Helvetica-Bold').text(term, 56, y + 5);
                        if (explanation) {
                            doc.fillColor('#374151').fontSize(8.5).font('Helvetica').text(explanation, 56, y + 17, { width: 465 });
                        }
                        y += bh + 16;
                    });
                    y += 4;
                }

                // Patient info extracted from file
                if (s.patientInfo && Object.keys(s.patientInfo).length > 0) {
                    if (y > 680) { doc.addPage(); drawPageFooter(doc, pageNum++); y = 50; }
                    y = sectionHeading(doc, 'Patient Info Extracted from Document', y, '#0891b2');
                    Object.entries(s.patientInfo).forEach(([k, v]) => {
                        if (y > 720) { doc.addPage(); drawPageFooter(doc, pageNum++); y = 50; }
                        doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(`${k}:`, 60, y);
                        doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold').text(String(v), 200, y, { width: 295 });
                        y += 15;
                    });
                    y += 8;
                }

                // Summarisation timestamp
                if (s.summarizedAt) {
                    doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica')
                       .text(`AI summary generated: ${new Date(s.summarizedAt).toLocaleString()}  |  Engine: ${s.summarizedBy || 'AI System'}`, 50, y);
                }

                drawPageFooter(doc, pageNum++);
            });

            // ─── CONSOLIDATED FINDINGS PAGE ────────────────────────────────
            if (allKeyFindings.length > 0 || allRecommendations.length > 0 || highUrgencyDocs.length > 0) {
                doc.addPage();
                let y = 50;
                y = sectionHeading(doc, 'Consolidated Clinical Overview', y, '#1e40af');

                if (highUrgencyDocs.length > 0) {
                    doc.fillColor('#dc2626').fontSize(10).font('Helvetica-Bold').text('High Priority Documents', 50, y);
                    y += 16;
                    highUrgencyDocs.forEach(d => {
                        if (y > 720) { doc.addPage(); drawPageFooter(doc, pageNum++); y = 50; }
                        doc.fillColor('#dc2626').fontSize(9).font('Helvetica').text(`• ${d}`, 60, y, { width: 470 });
                        y += 14;
                    });
                    y += 10;
                }

                if (allKeyFindings.length > 0) {
                    if (y > 680) { doc.addPage(); drawPageFooter(doc, pageNum++); y = 50; }
                    doc.fillColor('#2563eb').fontSize(10).font('Helvetica-Bold').text('All Key Findings Across Documents', 50, y);
                    y += 16;
                    allKeyFindings.forEach(({ finding, source }) => {
                        if (y > 720) { doc.addPage(); drawPageFooter(doc, pageNum++); y = 50; }
                        const fh = doc.heightOfString(finding, { width: 430 });
                        doc.fillColor('#64748b').fontSize(7).font('Helvetica').text(`[${source}]`, 50, y, { width: 200 });
                        doc.fillColor('#1e293b').fontSize(8.5).font('Helvetica').text(`• ${finding}`, 60, y + 9, { width: 465 });
                        y += fh + 18;
                    });
                    y += 8;
                }

                if (allRecommendations.length > 0) {
                    if (y > 680) { doc.addPage(); drawPageFooter(doc, pageNum++); y = 50; }
                    doc.fillColor('#059669').fontSize(10).font('Helvetica-Bold').text('All Recommendations Across Documents', 50, y);
                    y += 16;
                    allRecommendations.forEach(({ rec, source }) => {
                        if (y > 720) { doc.addPage(); drawPageFooter(doc, pageNum++); y = 50; }
                        const rh = doc.heightOfString(rec, { width: 430 });
                        doc.fillColor('#64748b').fontSize(7).font('Helvetica').text(`[${source}]`, 50, y, { width: 200 });
                        doc.fillColor('#1e293b').fontSize(8.5).font('Helvetica').text(`✓ ${rec}`, 60, y + 9, { width: 465 });
                        y += rh + 18;
                    });
                }

                drawPageFooter(doc, pageNum++);
            }

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

        // Get or generate summaries for all documents (sequential to avoid overloading ML service)
        console.log(`Generating summaries for ${documents.length} documents...`);
        const documentsWithSummaries = [];
        for (const doc of documents) {
            const summary = await getOrGenerateSummary(doc, decoded.id);
            documentsWithSummaries.push({ document: doc, summary });
        }

        console.log('Generating PDF report with health tracker data...');
        // Generate PDF with health tracker data
        const pdfBuffer = await generatePDFReport(patient, documents, documentsWithSummaries, healthTrackerData);

        // Compute urgency breakdown
        let urgencyHigh = 0, urgencyMedium = 0, urgencyLow = 0, urgencyNone = 0;
        for (const { summary } of documentsWithSummaries) {
            if (!summary) { urgencyNone++; continue; }
            const level = (summary.urgencyLevel || '').toLowerCase();
            if (level === 'high') urgencyHigh++;
            else if (level === 'medium' || level === 'moderate') urgencyMedium++;
            else if (level === 'low') urgencyLow++;
            else urgencyNone++;
        }

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
            summarizedDocuments: documentsWithSummaries.filter(d => d.summary).length,
            labReports: documents.filter(d => d.category === 'lab-report').length,
            prescriptions: documents.filter(d => d.category === 'prescription').length,
            scans: documents.filter(d => d.category === 'scan').length,
            consultations: documents.filter(d => d.category === 'consultation').length,
            urgencyHigh,
            urgencyMedium,
            urgencyLow,
            urgencyNone,
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
                consultations: healthReport.consultations,
                urgencyHigh: healthReport.urgencyHigh,
                urgencyMedium: healthReport.urgencyMedium,
                urgencyLow: healthReport.urgencyLow,
                urgencyNone: healthReport.urgencyNone
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
                urgencyHigh: report.urgencyHigh || 0,
                urgencyMedium: report.urgencyMedium || 0,
                urgencyLow: report.urgencyLow || 0,
                urgencyNone: report.urgencyNone || 0,
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
