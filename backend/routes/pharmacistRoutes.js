import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import AWS from "aws-sdk";
import PDFDocument from "pdfkit";
import { Medicine } from "../models/Medicine.js";
import { Transaction } from "../models/Transaction.js";
import { Pharmacist } from "../models/Pharmacist.js";
import { Report } from "../models/Report.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Helper function to verify token from request body
const verifyToken = (token) => {
  if (!token) {
    throw new Error("Access denied: token required");
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};

/**
 * 📦 ADD MEDICINE TO INVENTORY
 */
router.post("/add-medicine", async (req, res) => {
  try {
    const { token, name, description, quantity, category, expiryDate, price } = req.body;

    const decoded = verifyToken(token);

    const medicine = await Medicine.create({
      name,
      description,
      quantity: quantity || 0,
      category,
      expiryDate,
      price,
      pharmacist_id: decoded.id,
    });

    // Create transaction record
    await Transaction.create({
      type: 'add',
      medicineName: name,
      medicineId: medicine._id,
      quantity: quantity || 0,
      price: price || 0,
      totalAmount: (quantity || 0) * (price || 0),
      pharmacist_id: decoded.id,
      newQuantity: quantity || 0,
      notes: `Added new medicine: ${name}`
    });

    res.status(201).json({
      message: "Medicine added successfully",
      medicine: {
        id: medicine._id,
        name: medicine.name,
        description: medicine.description,
        quantity: medicine.quantity,
        category: medicine.category,
        expiryDate: medicine.expiryDate,
        price: medicine.price,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * 📋 GET ALL MEDICINES IN INVENTORY
 */
router.get("/medicines", async (req, res) => {
  try {
    const { token } = req.query;

    const decoded = verifyToken(token);

    const medicines = await Medicine.find({ pharmacist_id: decoded.id }).sort({
      createdAt: -1,
    });

    res.json({
      medicines: medicines.map((med) => ({
        id: med._id,
        name: med.name,
        description: med.description,
        quantity: med.quantity,
        category: med.category,
        expiryDate: med.expiryDate,
        price: med.price,
        createdAt: med.createdAt,
        updatedAt: med.updatedAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ✏️ UPDATE MEDICINE (for restocking or editing)
 */
router.put("/update-medicine/:id", async (req, res) => {
  try {
    const { token, name, description, quantity, category, expiryDate, price } = req.body;
    const { id } = req.params;

    const decoded = verifyToken(token);

    const medicine = await Medicine.findOne({
      _id: id,
      pharmacist_id: decoded.id,
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    const previousQuantity = medicine.quantity;
    const previousPrice = medicine.price;

    // Update fields
    if (name !== undefined) medicine.name = name;
    if (description !== undefined) medicine.description = description;
    if (quantity !== undefined) medicine.quantity = quantity;
    if (category !== undefined) medicine.category = category;
    if (expiryDate !== undefined) medicine.expiryDate = expiryDate;
    if (price !== undefined) medicine.price = price;

    await medicine.save();

    // Create transaction record if quantity changed
    if (quantity !== undefined && quantity !== previousQuantity) {
      const quantityDiff = quantity - previousQuantity;
      await Transaction.create({
        type: 'update',
        medicineName: medicine.name,
        medicineId: medicine._id,
        quantity: Math.abs(quantityDiff),
        price: medicine.price || 0,
        totalAmount: Math.abs(quantityDiff) * (medicine.price || 0),
        pharmacist_id: decoded.id,
        previousQuantity,
        newQuantity: quantity,
        notes: quantityDiff > 0 
          ? `Restocked ${Math.abs(quantityDiff)} units` 
          : `Reduced stock by ${Math.abs(quantityDiff)} units`
      });
    }

    res.json({
      message: "Medicine updated successfully",
      medicine: {
        id: medicine._id,
        name: medicine.name,
        description: medicine.description,
        quantity: medicine.quantity,
        category: medicine.category,
        expiryDate: medicine.expiryDate,
        price: medicine.price,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * 💊 ISSUE MEDICINE (dispense to patient - decreases quantity)
 */
router.post("/issue-medicine", async (req, res) => {
  try {
    const { token, medicineId, quantity, patientName, notes } = req.body;

    const decoded = verifyToken(token);

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const medicine = await Medicine.findOne({
      _id: medicineId,
      pharmacist_id: decoded.id,
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    if (medicine.quantity < parsedQuantity) {
      return res.status(400).json({
        message: "Insufficient stock",
        available: medicine.quantity,
      });
    }

    const previousQuantity = medicine.quantity;

    // Decrease quantity
    medicine.quantity -= parsedQuantity;
    await medicine.save();

    // Create transaction record
    await Transaction.create({
      type: 'issue',
      medicineName: medicine.name,
      medicineId: medicine._id,
      quantity: parsedQuantity,
      price: medicine.price || 0,
      totalAmount: parsedQuantity * (medicine.price || 0),
      patientName: patientName || 'Unknown',
      notes: notes || `Issued ${parsedQuantity} units to ${patientName || 'patient'}`,
      pharmacist_id: decoded.id,
      previousQuantity,
      newQuantity: medicine.quantity
    });

    res.json({
      message: "Medicine issued successfully",
      medicine: {
        id: medicine._id,
        name: medicine.name,
        remainingQuantity: medicine.quantity,
      },
      transaction: {
        type: "issue",
        quantity: parsedQuantity,
        patientName,
        notes,
        timestamp: new Date(),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * 🗑️ REMOVE MEDICINE FROM INVENTORY
 */
router.delete("/remove-medicine/:id", async (req, res) => {
  try {
    const { token } = req.body;
    const { id } = req.params;

    const decoded = verifyToken(token);

    const medicine = await Medicine.findOne({
      _id: id,
      pharmacist_id: decoded.id,
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    // Create transaction record before deletion
    await Transaction.create({
      type: 'remove',
      medicineName: medicine.name,
      medicineId: medicine._id,
      quantity: medicine.quantity,
      price: medicine.price || 0,
      totalAmount: medicine.quantity * (medicine.price || 0),
      pharmacist_id: decoded.id,
      previousQuantity: medicine.quantity,
      newQuantity: 0,
      notes: `Removed ${medicine.name} from inventory (${medicine.quantity} units)`
    });

    await Medicine.findByIdAndDelete(id);

    res.json({
      message: "Medicine removed successfully",
      medicine: {
        id: medicine._id,
        name: medicine.name,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * 📊 GET INVENTORY STATS
 */
router.get("/inventory-stats", async (req, res) => {
  try {
    const { token } = req.query;

    const decoded = verifyToken(token);

    const medicines = await Medicine.find({ pharmacist_id: decoded.id });

    const totalItems = medicines.length;
    const totalQuantity = medicines.reduce((sum, med) => sum + med.quantity, 0);
    const lowStock = medicines.filter((med) => med.quantity < 50).length;
    const outOfStock = medicines.filter((med) => med.quantity === 0).length;

    res.json({
      stats: {
        totalItems,
        totalQuantity,
        lowStock,
        outOfStock,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * 📋 GET ALL TRANSACTIONS
 */
router.get("/transactions", async (req, res) => {
  try {
    const { token } = req.query;

    const decoded = verifyToken(token);

    const transactions = await Transaction.find({ pharmacist_id: decoded.id })
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 transactions

    res.json({
      transactions: transactions.map((txn) => ({
        id: txn._id,
        type: txn.type,
        medicineName: txn.medicineName,
        medicineId: txn.medicineId,
        quantity: txn.quantity,
        price: txn.price,
        totalAmount: txn.totalAmount,
        patientName: txn.patientName,
        notes: txn.notes,
        previousQuantity: txn.previousQuantity,
        newQuantity: txn.newQuantity,
        createdAt: txn.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * 👤 GET PHARMACIST PROFILE
 */
router.get("/profile", async (req, res) => {
  try {
    const { token } = req.query;

    const decoded = verifyToken(token);

    const pharmacist = await Pharmacist.findById(decoded.id).select('-password');

    if (!pharmacist) {
      return res.status(404).json({ message: "Pharmacist not found" });
    }

    res.json({
      profile: {
        id: pharmacist._id,
        name: pharmacist.name,
        email: pharmacist.email,
        gender: pharmacist.gender || '',
        phone: pharmacist.phone || '',
        role: pharmacist.role,
        createdAt: pharmacist.createdAt,
        updatedAt: pharmacist.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ✏️ UPDATE PHARMACIST PROFILE
 */
router.put("/profile", async (req, res) => {
  try {
    const { token, name, gender, phone } = req.body;

    const decoded = verifyToken(token);

    const pharmacist = await Pharmacist.findById(decoded.id);

    if (!pharmacist) {
      return res.status(404).json({ message: "Pharmacist not found" });
    }

    // Update fields
    if (name !== undefined) pharmacist.name = name;
    if (gender !== undefined) pharmacist.gender = gender;
    if (phone !== undefined) pharmacist.phone = phone;

    await pharmacist.save();

    res.json({
      message: "Profile updated successfully",
      profile: {
        id: pharmacist._id,
        name: pharmacist.name,
        email: pharmacist.email,
        gender: pharmacist.gender,
        phone: pharmacist.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * 🔒 UPDATE PASSWORD
 */
router.put("/update-password", async (req, res) => {
  try {
    const { token, currentPassword, newPassword } = req.body;

    const decoded = verifyToken(token);

    const pharmacist = await Pharmacist.findById(decoded.id);

    if (!pharmacist) {
      return res.status(404).json({ message: "Pharmacist not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, pharmacist.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    pharmacist.password = hashedPassword;

    await pharmacist.save();

    res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * 📊 GET ALL REPORTS
 */
router.get("/reports", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = verifyToken(token);

    const reports = await Report.find({ pharmacist_id: decoded.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reports: reports.map((report) => ({
        id: report._id,
        title: report.title,
        description: report.description,
        reportType: report.reportType,
        fileName: report.fileName,
        fileSize: report.fileSize,
        s3Url: report.s3Url,
        dateFrom: report.dateFrom,
        dateTo: report.dateTo,
        generatedAt: report.generatedAt,
        status: report.status,
        createdAt: report.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 📊 GENERATE NEW REPORT
 */
router.post("/generate-report", async (req, res) => {
  try {
    const { token, reportType, title, description, dateFrom, dateTo } = req.body;
    const decoded = verifyToken(token);

    const pharmacist = await Pharmacist.findById(decoded.id);
    if (!pharmacist) {
      return res.status(404).json({ success: false, message: "Pharmacist not found" });
    }

    // Create report record with generating status
    const report = new Report({
      title: title || `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      description: description || `Generated ${reportType} report`,
      reportType,
      pharmacist_id: decoded.id,
      dateFrom: dateFrom ? new Date(dateFrom) : null,
      dateTo: dateTo ? new Date(dateTo) : null,
      status: 'generating'
    });
    await report.save();

    // Fetch data based on report type
    let reportData = {};
    const dateFilter = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.$lte = new Date(dateTo);

    if (reportType === 'inventory') {
      const medicines = await Medicine.find({ pharmacist_id: decoded.id });
      reportData = { medicines, type: 'inventory' };
    } else if (reportType === 'transaction') {
      const query = { pharmacist_id: decoded.id };
      if (dateFrom || dateTo) query.createdAt = dateFilter;
      const transactions = await Transaction.find(query).sort({ createdAt: -1 });
      reportData = { transactions, type: 'transaction' };
    } else {
      // Summary report - both inventory and transactions
      const medicines = await Medicine.find({ pharmacist_id: decoded.id });
      const query = { pharmacist_id: decoded.id };
      if (dateFrom || dateTo) query.createdAt = dateFilter;
      const transactions = await Transaction.find(query).sort({ createdAt: -1 });
      reportData = { medicines, transactions, type: 'summary' };
    }

    // Generate PDF
    const pdfBuffer = await generatePDFReport(reportData, pharmacist, title || `${reportType} Report`, dateFrom, dateTo);

    // Upload to S3
    const timestamp = Date.now();
    const fileName = `report_${reportType}_${timestamp}.pdf`;
    const s3Key = `pharmacy-reports/${decoded.id}/${fileName}`;

    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      ACL: 'private'
    };

    const s3UploadResult = await s3.upload(s3Params).promise();

    // Update report with S3 info
    report.fileName = fileName;
    report.originalName = fileName;
    report.fileSize = pdfBuffer.length;
    report.s3Key = s3Key;
    report.s3Url = s3UploadResult.Location;
    report.status = 'completed';
    await report.save();

    res.json({
      success: true,
      message: 'Report generated successfully',
      report: {
        id: report._id,
        title: report.title,
        description: report.description,
        reportType: report.reportType,
        fileName: report.fileName,
        fileSize: report.fileSize,
        s3Url: report.s3Url,
        generatedAt: report.generatedAt,
        status: report.status,
      }
    });
  } catch (err) {
    console.error('Report generation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 📥 GET REPORT DOWNLOAD URL (Pre-signed URL)
 */
router.get("/report-download/:reportId", async (req, res) => {
  try {
    const { token } = req.query;
    const { reportId } = req.params;
    const decoded = verifyToken(token);

    const report = await Report.findOne({ _id: reportId, pharmacist_id: decoded.id });
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    // Generate pre-signed URL for download
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: report.s3Key,
      Expires: 300 // URL expires in 5 minutes
    });

    res.json({
      success: true,
      downloadUrl: signedUrl,
      fileName: report.fileName
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 🗑️ DELETE REPORT
 */
router.delete("/report/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;
    const { token } = req.body;
    const decoded = verifyToken(token);

    const report = await Report.findOne({ _id: reportId, pharmacist_id: decoded.id });
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    // Delete from S3
    if (report.s3Key) {
      await s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: report.s3Key
      }).promise();
    }

    // Delete from database
    await Report.deleteOne({ _id: reportId });

    res.json({
      success: true,
      message: "Report deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PDF COLOUR PALETTE ──────────────────────────────────────────────────────
const C = {
  primary:   '#1d4ed8',   // blue-700
  primaryDk: '#1e3a8a',   // blue-900
  primaryLt: '#dbeafe',   // blue-100
  teal:      '#0891b2',   // cyan-600
  tealLt:    '#cffafe',   // cyan-100
  green:     '#059669',   // emerald-600
  greenLt:   '#d1fae5',   // emerald-100
  red:       '#dc2626',   // red-600
  redLt:     '#fee2e2',   // red-100
  amber:     '#d97706',   // amber-600
  amberLt:   '#fef3c7',   // amber-100
  purple:    '#7c3aed',   // violet-700
  purpleLt:  '#ede9fe',   // violet-100
  dark:      '#0f172a',   // slate-900
  mid:       '#475569',   // slate-600
  muted:     '#94a3b8',   // slate-400
  rowAlt:    '#f8fafc',   // slate-50
  white:     '#ffffff',
};

// Thin horizontal rule
function rule(doc, y, color = '#e2e8f0') {
  doc.save().moveTo(50, y).lineTo(doc.page.width - 50, y)
     .strokeColor(color).lineWidth(0.5).stroke().restore();
}

// Footer on every page
function footer(doc, pageNum, total) {
  const ph = doc.page.height;
  rule(doc, ph - 38);
  doc.save()
     .fillColor(C.muted).fontSize(7).font('Helvetica')
     .text('Health-Track Pharmacy Management System  ·  Confidential', 50, ph - 30, { width: 380 })
     .text(`Page ${pageNum}${total ? ' of ' + total : ''}`, doc.page.width - 100, ph - 30, { width: 50, align: 'right' })
     .restore();
}

// Coloured section heading bar
function sectionBar(doc, label, y, color = C.primary) {
  const W = doc.page.width - 100;
  doc.rect(50, y, W, 26).fill(color);
  // left accent
  doc.rect(50, y, 5, 26).fill(C.primaryDk);
  doc.fillColor(C.white).fontSize(11).font('Helvetica-Bold').text(label, 63, y + 8);
  return y + 34;
}

// Small key-value pill
function kvPill(doc, x, y, key, value, keyColor, valColor) {
  doc.fillColor(keyColor).fontSize(8).font('Helvetica-Bold').text(key + ':', x, y);
  doc.fillColor(valColor).font('Helvetica').text(' ' + value, { continued: false });
}

// Stat card
function statCard(doc, x, y, w, h, value, label, color) {
  // Shadow
  doc.rect(x + 2, y + 2, w, h).fill('#e2e8f0');
  // Card face
  doc.rect(x, y, w, h).fill(C.white);
  // Top colour strip
  doc.rect(x, y, w, 5).fill(color);
  // Border
  doc.rect(x, y, w, h).stroke(color + '66');
  // Value
  doc.fillColor(color).fontSize(20).font('Helvetica-Bold')
     .text(String(value), x, y + 14, { width: w, align: 'center' });
  // Label
  doc.fillColor(C.mid).fontSize(7.5).font('Helvetica')
     .text(label, x + 2, y + 38, { width: w - 4, align: 'center' });
}

// Helper function to generate PDF report
async function generatePDFReport(data, pharmacist, title, dateFrom, dateTo) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 0, size: 'A4', autoFirstPage: true });
      const chunks = [];
      let pageNum = 1;

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const PW = doc.page.width;   // 595.28
      const PH = doc.page.height;  // 841.89
      const CW = PW - 100;         // content width

      const medicines    = data.medicines    || [];
      const transactions = data.transactions || [];
      const totalStock   = medicines.reduce((s, m) => s + (m.quantity || 0), 0);
      const lowStock     = medicines.filter(m => m.quantity > 0 && m.quantity < 50).length;
      const outOfStock   = medicines.filter(m => m.quantity === 0).length;
      const totalRevenue = transactions.filter(t => t.type === 'issue')
                                       .reduce((s, t) => s + (t.totalAmount || 0), 0);
      const issued  = transactions.filter(t => t.type === 'issue').length;
      const added   = transactions.filter(t => t.type === 'add').length;
      const removed = transactions.filter(t => t.type === 'remove').length;

      // ══════════════════════════════════════════════════════════════════════════
      // PAGE 1 — COVER
      // ══════════════════════════════════════════════════════════════════════════

      // Full-bleed top band
      doc.rect(0, 0, PW, 220).fill(C.primary);
      // Decorative circles (subtle)
      doc.circle(PW - 60, 40, 90).fill(C.primaryDk);
      doc.circle(PW - 20, 160, 50).fill('#1e40af');

      // Brand
      doc.fillColor(C.white).fontSize(32).font('Helvetica-Bold').text('Health-Track', 50, 55);
      doc.fillColor(C.primaryLt).fontSize(12).font('Helvetica').text('Pharmacy Management System', 50, 96);

      // Title
      doc.rect(50, 128, CW, 2).fill('#60a5fa');
      doc.fillColor(C.white).fontSize(17).font('Helvetica-Bold').text(title, 50, 138, { width: CW - 120 });

      // Report meta strip below band
      doc.rect(0, 220, PW, 52).fill('#f1f5f9');
      rule(doc, 220, '#cbd5e1');
      rule(doc, 272, '#cbd5e1');

      const pharmName = pharmacist.name || pharmacist.email;
      const genDate   = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
      const period    = (dateFrom || dateTo)
        ? `${dateFrom ? new Date(dateFrom).toLocaleDateString('en-GB') : 'All time'} – ${dateTo ? new Date(dateTo).toLocaleDateString('en-GB') : 'Present'}`
        : 'All time';

      doc.fillColor(C.mid).fontSize(8).font('Helvetica-Bold').text('PHARMACIST', 60, 232);
      doc.fillColor(C.dark).font('Helvetica').text(pharmName, 60, 244);
      doc.fillColor(C.mid).fontSize(8).font('Helvetica-Bold').text('GENERATED', 220, 232);
      doc.fillColor(C.dark).font('Helvetica').text(genDate, 220, 244);
      doc.fillColor(C.mid).fontSize(8).font('Helvetica-Bold').text('PERIOD', 430, 232);
      doc.fillColor(C.dark).font('Helvetica').text(period, 430, 244);

      // ── Stat cards (2 rows × 3) ─────────────────────────────────────────────
      const cards = [
        { value: medicines.length,              label: 'Total Medicines',   color: C.primary },
        { value: totalStock,                    label: 'Units in Stock',    color: C.green   },
        { value: lowStock,                      label: 'Low Stock Items',   color: C.amber   },
        { value: outOfStock,                    label: 'Out of Stock',      color: C.red     },
        { value: transactions.length,           label: 'Total Transactions',color: C.purple  },
        { value: `₹${totalRevenue.toFixed(0)}`, label: 'Total Revenue',    color: C.teal    },
      ];

      const cW = 148, cH = 60, cGap = 9;
      const row1Y = 290, row2Y = row1Y + cH + 12;
      const startX = (PW - (3 * cW + 2 * cGap)) / 2;

      cards.forEach((c, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        statCard(doc, startX + col * (cW + cGap), row === 0 ? row1Y : row2Y, cW, cH, c.value, c.label, c.color);
      });

      // ── Stock health bar ────────────────────────────────────────────────────
      const barY = row2Y + cH + 22;
      doc.fillColor(C.mid).fontSize(8.5).font('Helvetica-Bold').text('STOCK HEALTH OVERVIEW', 50, barY);
      const barH = 14, barW = CW, barTop = barY + 14;
      const totalMeds = medicines.length || 1;
      const okW  = Math.round((medicines.filter(m => m.quantity >= 50).length / totalMeds) * barW);
      const lwW  = Math.round((lowStock / totalMeds) * barW);
      const ooW  = barW - okW - lwW;
      doc.rect(50,        barTop, okW,  barH).fill(C.green);
      doc.rect(50 + okW,  barTop, lwW,  barH).fill(C.amber);
      doc.rect(50 + okW + lwW, barTop, ooW, barH).fill(C.red);
      rule(doc, barTop + barH + 1, '#94a3b8');
      doc.fillColor(C.green).fontSize(7).font('Helvetica-Bold').text('■', 50, barTop + barH + 5);
      doc.fillColor(C.mid).font('Helvetica').text(' Adequate', 60, barTop + barH + 5, { continued: true });
      doc.fillColor(C.amber).font('Helvetica-Bold').text('   ■', { continued: true });
      doc.fillColor(C.mid).font('Helvetica').text(' Low stock', { continued: true });
      doc.fillColor(C.red).font('Helvetica-Bold').text('   ■', { continued: true });
      doc.fillColor(C.mid).font('Helvetica').text(' Out of stock');

      // ── Divider + disclaimer at bottom of cover ──────────────────────────
      const disclaimerY = PH - 80;
      rule(doc, disclaimerY, '#cbd5e1');
      doc.rect(0, disclaimerY + 1, PW, PH - disclaimerY - 1).fill('#f8fafc');
      doc.fillColor(C.muted).fontSize(7.5).font('Helvetica')
         .text(
           'This report is generated automatically by the Health-Track system. All data reflects the current state of the pharmacy inventory and transaction records.',
           50, disclaimerY + 10, { width: CW, align: 'center' }
         );

      footer(doc, pageNum++);

      // ══════════════════════════════════════════════════════════════════════════
      // Helper – ensure enough space; if not, start a new page and reset y
      // ══════════════════════════════════════════════════════════════════════════
      const FOOTER_MARGIN = 60;
      const safePageBreak = (y, needed) => {
        if (y + needed > PH - FOOTER_MARGIN) {
          footer(doc, pageNum++);
          doc.addPage();
          return 50;
        }
        return y;
      };

      // Shared y-position for cross-section continuation (summary type)
      let continuationY = 50;

      // ══════════════════════════════════════════════════════════════════════════
      // INVENTORY SECTION
      // ══════════════════════════════════════════════════════════════════════════
      if (data.type === 'inventory' || data.type === 'summary') {
        doc.addPage();
        let y = 50;

        y = sectionBar(doc, `Inventory  ·  ${medicines.length} items`, y, C.primary);
        y += 10;

        if (medicines.length > 0) {
          // Quick-stat mini row
          const qStats = [
            { label: 'Total items',  val: medicines.length,  color: C.primary },
            { label: 'Total units',  val: totalStock,        color: C.green   },
            { label: 'Low stock',    val: lowStock,          color: C.amber   },
            { label: 'Out of stock', val: outOfStock,        color: C.red     },
          ];
          const qW = CW / qStats.length;
          qStats.forEach((q, i) => {
            doc.rect(50 + i * qW, y, qW - 3, 34).fill(q.color + '12');
            doc.rect(50 + i * qW, y, 3, 34).fill(q.color);
            doc.fillColor(q.color).fontSize(14).font('Helvetica-Bold')
               .text(String(q.val), 58 + i * qW, y + 5, { width: qW - 10 });
            doc.fillColor(C.mid).fontSize(7).font('Helvetica')
               .text(q.label.toUpperCase(), 58 + i * qW, y + 22, { width: qW - 10 });
          });
          y += 46;

          // Table
          const cols = { name: 50, cat: 218, qty: 320, price: 388, expiry: 456 };
          // Header
          doc.rect(50, y, CW, 22).fill(C.primaryDk);
          doc.fillColor(C.white).fontSize(8).font('Helvetica-Bold')
             .text('Medicine Name',  cols.name  + 6, y + 7)
             .text('Category',       cols.cat   + 6, y + 7)
             .text('Qty',            cols.qty   + 6, y + 7)
             .text('Price (₹)',      cols.price + 6, y + 7)
             .text('Expiry',         cols.expiry+ 6, y + 7);
          y += 22;

          medicines.forEach((med, idx) => {
            y = safePageBreak(y, 20);
            if (y === 50) {
              // Redraw header after page break
              doc.rect(50, y, CW, 22).fill(C.primaryDk);
              doc.fillColor(C.white).fontSize(8).font('Helvetica-Bold')
                 .text('Medicine Name',  cols.name  + 6, y + 7)
                 .text('Category',       cols.cat   + 6, y + 7)
                 .text('Qty',            cols.qty   + 6, y + 7)
                 .text('Price (₹)',      cols.price + 6, y + 7)
                 .text('Expiry',         cols.expiry+ 6, y + 7);
              y += 22;
            }

            const rH = 18;
            doc.rect(50, y, CW, rH).fill(idx % 2 === 0 ? C.rowAlt : C.white);
            const sc = med.quantity === 0 ? C.red : med.quantity < 50 ? C.amber : C.green;
            doc.rect(50, y, 4, rH).fill(sc);

            doc.fillColor(C.dark).fontSize(8.5).font('Helvetica')
               .text(med.name.substring(0, 28), cols.name + 7, y + 5, { width: 162 })
               .text(med.category || '—',       cols.cat  + 6, y + 5, { width: 96  });
            doc.fillColor(sc).font('Helvetica-Bold')
               .text(String(med.quantity), cols.qty + 6, y + 5, { width: 60 });
            doc.fillColor(C.dark).font('Helvetica')
               .text(`₹${(med.price || 0).toLocaleString('en-IN')}`, cols.price + 6, y + 5, { width: 60 });
            const expStr = med.expiryDate ? new Date(med.expiryDate).toLocaleDateString('en-GB') : '—';
            const expColor = med.expiryDate && new Date(med.expiryDate) < new Date(Date.now() + 90 * 86400000) ? C.red : C.mid;
            doc.fillColor(expColor).text(expStr, cols.expiry + 6, y + 5, { width: 80 });
            y += rH;
          });

          // Legend
          y += 10;
          y = safePageBreak(y, 20);
          doc.fillColor(C.mid).fontSize(7.5).font('Helvetica-Bold').text('LEGEND', 50, y);
          y += 11;
          [[C.green, 'Adequate (≥ 50 units)'], [C.amber, 'Low stock (1–49 units)'], [C.red, 'Out of stock (0 units)'], [C.red, 'Expiry within 90 days']].forEach(([c, l]) => {
            doc.rect(50, y + 1, 7, 7).fill(c);
            doc.fillColor(C.mid).fontSize(7.5).font('Helvetica').text(l, 62, y);
            y += 12;
          });
        } else {
          doc.rect(50, y, CW, 40).fill(C.rowAlt);
          doc.fillColor(C.muted).fontSize(10).font('Helvetica')
             .text('No inventory data available.', 50, y + 13, { width: CW, align: 'center' });
          y += 50;
        }

        // If summary, check if transactions section fits below; otherwise new page
        if (data.type === 'summary') {
          const txnNeeded = 34 + 52 + 24 + Math.min(transactions.length, 25) * 17 + 30;
          if (y + txnNeeded > PH - FOOTER_MARGIN) {
            footer(doc, pageNum++);
            doc.addPage();
            continuationY = 50;
          } else {
            continuationY = y + 20;
          }
        } else {
          footer(doc, pageNum++);
        }
      }

      // ══════════════════════════════════════════════════════════════════════════
      // TRANSACTION SECTION
      // ══════════════════════════════════════════════════════════════════════════
      if (data.type === 'transaction' || data.type === 'summary') {
        // For transaction-only report, start fresh page
        if (data.type === 'transaction') {
          doc.addPage();
        }
        let y = (data.type === 'transaction') ? 50 : continuationY;

        y = sectionBar(doc, `Transactions  ·  ${transactions.length} records`, y, C.teal);
        y += 10;

        if (transactions.length > 0) {
          // 4-card summary row
          const tCards = [
            { label: 'Issued',   val: issued,                     color: C.green  },
            { label: 'Added',    val: added,                      color: C.primary},
            { label: 'Removed',  val: removed,                    color: C.red    },
            { label: 'Revenue',  val: `₹${totalRevenue.toFixed(0)}`, color: C.teal},
          ];
          const tcW = CW / tCards.length;
          tCards.forEach((tc, i) => {
            doc.rect(50 + i * tcW, y, tcW - 4, 36).fill(tc.color + '12');
            doc.rect(50 + i * tcW, y, tcW - 4, 4).fill(tc.color);
            doc.fillColor(tc.color).fontSize(14).font('Helvetica-Bold')
               .text(String(tc.val), 50 + i * tcW, y + 12, { width: tcW - 4, align: 'center' });
            doc.fillColor(C.mid).fontSize(7).font('Helvetica')
               .text(tc.label.toUpperCase(), 50 + i * tcW, y + 28, { width: tcW - 4, align: 'center' });
          });
          y += 48;

          // Table
          const tc = { date: 50, type: 140, med: 202, qty: 368, amt: 424, pat: 474 };
          doc.rect(50, y, CW, 22).fill(C.primaryDk);
          doc.fillColor(C.white).fontSize(8).font('Helvetica-Bold')
             .text('Date',        tc.date + 5, y + 7)
             .text('Type',        tc.type + 5, y + 7)
             .text('Medicine',    tc.med  + 5, y + 7)
             .text('Qty',         tc.qty  + 5, y + 7)
             .text('Amount (₹)',  tc.amt  + 5, y + 7)
             .text('Patient',     tc.pat  + 5, y + 7);
          y += 22;

          const TYPE_CLR = { issue: C.green, add: C.primary, remove: C.red, update: C.amber };

          transactions.slice(0, 60).forEach((txn, idx) => {
            y = safePageBreak(y, 20);
            if (y === 50) {
              // Redraw header after page break
              doc.rect(50, y, CW, 22).fill(C.primaryDk);
              doc.fillColor(C.white).fontSize(8).font('Helvetica-Bold')
                 .text('Date',        tc.date + 5, y + 7)
                 .text('Type',        tc.type + 5, y + 7)
                 .text('Medicine',    tc.med  + 5, y + 7)
                 .text('Qty',         tc.qty  + 5, y + 7)
                 .text('Amount (₹)',  tc.amt  + 5, y + 7)
                 .text('Patient',     tc.pat  + 5, y + 7);
              y += 22;
            }

            const rH = 17;
            doc.rect(50, y, CW, rH).fill(idx % 2 === 0 ? C.rowAlt : C.white);
            const tColor = TYPE_CLR[txn.type] || C.mid;

            doc.fillColor(C.mid).fontSize(8).font('Helvetica')
               .text(new Date(txn.createdAt).toLocaleDateString('en-GB'), tc.date + 5, y + 5, { width: 85 });

            // Type pill
            doc.rect(tc.type + 4, y + 3, 46, 11).fill(tColor + '20');
            doc.fillColor(tColor).fontSize(7).font('Helvetica-Bold')
               .text(txn.type.toUpperCase(), tc.type + 4, y + 5, { width: 46, align: 'center' });

            doc.fillColor(C.dark).font('Helvetica').fontSize(8)
               .text((txn.medicineName || '—').substring(0, 22), tc.med + 5, y + 5, { width: 160 });
            doc.fillColor(tColor).font('Helvetica-Bold')
               .text(String(txn.quantity), tc.qty + 5, y + 5, { width: 50 });
            doc.fillColor(C.dark).font('Helvetica')
               .text(`₹${(txn.totalAmount || 0).toLocaleString('en-IN')}`, tc.amt + 5, y + 5, { width: 46 });
            doc.fillColor(C.mid)
               .text((txn.patientName || '—').substring(0, 14), tc.pat + 5, y + 5, { width: 80 });

            y += rH;
          });

          if (transactions.length > 60) {
            y += 8;
            y = safePageBreak(y, 15);
            doc.fillColor(C.muted).fontSize(8).font('Helvetica')
               .text(`+ ${transactions.length - 60} more transactions not shown in this report.`, 50, y, { width: CW, align: 'center' });
          }
        } else {
          doc.rect(50, y, CW, 40).fill(C.rowAlt);
          doc.fillColor(C.muted).fontSize(10).font('Helvetica')
             .text('No transaction data available.', 50, y + 13, { width: CW, align: 'center' });
        }

        footer(doc, pageNum++);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 📊 GET INVENTORY PREDICTIONS (ML-powered)
 * Uses ML microservice to predict stock levels
 */
router.get("/ml-health", async (req, res) => {
  try {
    const { token } = req.query;
    verifyToken(token);

    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const healthResponse = await fetch(`${ML_SERVICE_URL}/api/v1/inventory/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!healthResponse.ok) {
      return res.status(503).json({
        success: false,
        status: 'unhealthy',
        message: 'ML service not responding'
      });
    }

    const healthData = await healthResponse.json();
    return res.json({
      success: true,
      status: healthData.status || 'healthy',
      service: healthData.service || 'inventory-prediction'
    });
  } catch (err) {
    return res.status(503).json({
      success: false,
      status: 'unreachable',
      message: err.message || 'ML service unreachable'
    });
  }
});

router.get("/inventory-prediction", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = verifyToken(token);

    // Get all medicines for this pharmacist
    const medicines = await Medicine.find({ pharmacist_id: decoded.id });

    // Get transactions for the last 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const transactions = await Transaction.find({
      pharmacist_id: decoded.id,
      createdAt: { $gte: sixtyDaysAgo }
    }).sort({ createdAt: 1 });

    // Group transactions by medicine
    const transactionsByMedicine = {};
    transactions.forEach(tx => {
      const medicineName = tx.medicineName;
      if (!transactionsByMedicine[medicineName]) {
        transactionsByMedicine[medicineName] = [];
      }
      transactionsByMedicine[medicineName].push({
        date: tx.createdAt.toISOString(),
        type: tx.type,
        quantity: tx.quantity,
        medicineName: tx.medicineName
      });
    });

    // Prepare data for ML microservice
    const medicinesData = medicines.map(med => ({
      name: med.name,
      currentStock: med.quantity,
      transactions: transactionsByMedicine[med.name] || []
    }));

    // Call ML microservice
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    
    try {
      const mlResponse = await fetch(`${ML_SERVICE_URL}/api/v1/inventory/predict-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicines: medicinesData,
          daysToPredict: 7
        })
      });

      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        return res.json({
          success: true,
          ...mlData,
          dataSource: 'ml-prediction'
        });
      } else {
        throw new Error('ML service returned error');
      }
    } catch (mlError) {
      console.error('ML service error, using fallback:', mlError.message);
      
      // Fallback: Simple average-based prediction
      const fallbackPredictions = medicines.map(med => {
        const medTxns = transactionsByMedicine[med.name] || [];
        const issueTxns = medTxns.filter(t => t.type === 'issue');
        const totalIssued = issueTxns.reduce((sum, t) => sum + t.quantity, 0);
        const avgDailyDemand = issueTxns.length > 0 ? totalIssued / 60 : 0;
        
        const predictions = [];
        let stock = med.quantity;
        
        for (let day = 1; day <= 7; day++) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + day);
          const demand = Math.round(avgDailyDemand);
          stock = Math.max(0, stock - demand);
          predictions.push({
            date: futureDate.toISOString().split('T')[0],
            predictedStock: stock,
            predictedDemand: demand,
            confidence: 0.5
          });
        }

        const daysUntilStockout = avgDailyDemand > 0 
          ? Math.ceil(med.quantity / avgDailyDemand) 
          : 999;

        return {
          medicineName: med.name,
          currentStock: med.quantity,
          daysUntilStockout: Math.min(daysUntilStockout, 30),
          averageDailyDemand: Math.round(avgDailyDemand * 100) / 100,
          restockRecommendation: daysUntilStockout <= 3 
            ? 'URGENT: Restock immediately!' 
            : daysUntilStockout <= 7 
              ? 'WARNING: Consider restocking soon.'
              : 'Stock levels adequate.',
          predictions,
          trendAnalysis: 'Based on simple average (ML service unavailable)'
        };
      });

      const urgentCount = fallbackPredictions.filter(p => p.daysUntilStockout <= 3).length;
      const atRiskCount = fallbackPredictions.filter(p => p.daysUntilStockout > 3 && p.daysUntilStockout <= 7).length;

      return res.json({
        success: true,
        predictions: fallbackPredictions,
        summary: {
          totalMedicines: medicines.length,
          urgentRestock: urgentCount,
          atRisk: atRiskCount,
          stable: medicines.length - urgentCount - atRiskCount
        },
        dataSource: 'fallback-calculation'
      });
    }
  } catch (err) {
    console.error("Inventory prediction error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to get inventory predictions" 
    });
  }
});

export default router;
