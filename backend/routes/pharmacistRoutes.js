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

    const medicine = await Medicine.findOne({
      _id: medicineId,
      pharmacist_id: decoded.id,
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    if (medicine.quantity < quantity) {
      return res.status(400).json({
        message: "Insufficient stock",
        available: medicine.quantity,
      });
    }

    const previousQuantity = medicine.quantity;

    // Decrease quantity
    medicine.quantity -= quantity;
    await medicine.save();

    // Create transaction record
    await Transaction.create({
      type: 'issue',
      medicineName: medicine.name,
      medicineId: medicine._id,
      quantity,
      price: medicine.price || 0,
      totalAmount: quantity * (medicine.price || 0),
      patientName: patientName || 'Unknown',
      notes: notes || `Issued ${quantity} units to ${patientName || 'patient'}`,
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
        quantity,
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

// Helper function to generate PDF report
async function generatePDFReport(data, pharmacist, title, dateFrom, dateTo) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('Health-Track Pharmacy', { align: 'center' });
      doc.fontSize(16).font('Helvetica').text(title, { align: 'center' });
      doc.moveDown();
      
      // Report info
      doc.fontSize(10).font('Helvetica');
      doc.text(`Pharmacist: ${pharmacist.name || pharmacist.email}`);
      doc.text(`Generated: ${new Date().toLocaleString()}`);
      if (dateFrom || dateTo) {
        doc.text(`Period: ${dateFrom ? new Date(dateFrom).toLocaleDateString() : 'Start'} - ${dateTo ? new Date(dateTo).toLocaleDateString() : 'End'}`);
      }
      doc.moveDown();

      // Content based on report type
      if (data.type === 'inventory' || data.type === 'summary') {
        doc.fontSize(14).font('Helvetica-Bold').text('Inventory Summary');
        doc.moveDown(0.5);
        
        if (data.medicines && data.medicines.length > 0) {
          doc.fontSize(10).font('Helvetica');
          doc.text(`Total Items: ${data.medicines.length}`);
          doc.text(`Total Stock: ${data.medicines.reduce((sum, m) => sum + m.quantity, 0)} units`);
          doc.text(`Low Stock Items: ${data.medicines.filter(m => m.quantity < 50 && m.quantity > 0).length}`);
          doc.text(`Out of Stock: ${data.medicines.filter(m => m.quantity === 0).length}`);
          doc.moveDown();

          // Medicine table
          doc.font('Helvetica-Bold');
          doc.text('Name', 50, doc.y, { continued: true, width: 150 });
          doc.text('Category', 200, doc.y, { continued: true, width: 100 });
          doc.text('Qty', 300, doc.y, { continued: true, width: 50 });
          doc.text('Price', 350, doc.y, { width: 80 });
          doc.moveDown(0.5);

          doc.font('Helvetica');
          data.medicines.forEach(med => {
            if (doc.y > 700) {
              doc.addPage();
            }
            doc.text(med.name.substring(0, 25), 50, doc.y, { continued: true, width: 150 });
            doc.text(med.category || 'N/A', 200, doc.y, { continued: true, width: 100 });
            doc.text(String(med.quantity), 300, doc.y, { continued: true, width: 50 });
            doc.text(`₹${med.price || 0}`, 350, doc.y, { width: 80 });
          });
        } else {
          doc.text('No inventory data available.');
        }
        doc.moveDown();
      }

      if (data.type === 'transaction' || data.type === 'summary') {
        doc.fontSize(14).font('Helvetica-Bold').text('Transaction History');
        doc.moveDown(0.5);
        
        if (data.transactions && data.transactions.length > 0) {
          doc.fontSize(10).font('Helvetica');
          doc.text(`Total Transactions: ${data.transactions.length}`);
          
          const totalRevenue = data.transactions
            .filter(t => t.type === 'issue')
            .reduce((sum, t) => sum + (t.totalAmount || 0), 0);
          doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`);
          doc.moveDown();

          // Recent transactions
          doc.font('Helvetica-Bold').text('Recent Transactions:');
          doc.moveDown(0.5);
          
          doc.font('Helvetica');
          data.transactions.slice(0, 20).forEach(txn => {
            if (doc.y > 700) {
              doc.addPage();
            }
            doc.text(`${new Date(txn.createdAt).toLocaleDateString()} - ${txn.type.toUpperCase()} - ${txn.medicineName} - Qty: ${txn.quantity} - ₹${txn.totalAmount || 0}`);
          });
        } else {
          doc.text('No transaction data available.');
        }
      }

      // Footer
      doc.fontSize(8).text('Generated by Health-Track System', 50, 750, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export default router;
