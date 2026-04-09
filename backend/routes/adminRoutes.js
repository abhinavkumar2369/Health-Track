import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import { Doctor } from "../models/Doctor.js";
import { Pharmacist } from "../models/Pharmacist.js";
import { Patient } from "../models/Patient.js";
import { Admin } from "../models/Admin.js";
import { Medicine } from "../models/Medicine.js";
import { Transaction } from "../models/Transaction.js";
import { Document } from "../models/Document.js";
import { HealthReport } from "../models/HealthReport.js";

dotenv.config();

const router = express.Router();

const validStaffRoles = ["doctor", "pharmacist"];

const authenticateAdmin = (token, res) => {
  if (!token) {
    res.status(401).json({ message: "Access denied: token required" });
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      res.status(403).json({ message: "Forbidden: admin only" });
      return null;
    }
    return decoded;
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
    return null;
  }
};

const splitName = (name = "") => {
  const trimmed = name.trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  const firstName = parts.shift() || "";
  const lastName = parts.join(" ");
  return { firstName, lastName };
};

const formatStaffUser = (entity, roleOverride = "") => {
  const role = roleOverride || entity.role;
  const { firstName, lastName } = splitName(entity.name || "");
  return {
    id: entity._id?.toString(),
    oderId: entity.userId || entity._id?.toString().slice(-6),
    uniqueId: entity._id?.toString(),
    name: entity.name,
    firstName,
    lastName,
    email: entity.email,
    role,
    specialization: entity.specialization || "",
    createdAt: entity.createdAt,
  };
};

// ➕ Add Doctor or Pharmacist
// Expects body: { token, fullname, email, password, role }
router.post("/add-user", async (req, res) => {
  try {
    const { token, fullname, email, password, role, specialization } = req.body;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    if (!validStaffRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const hashed = await bcrypt.hash(password, 10);

    if (role === "doctor") {
      const existingDoctor = await Doctor.findOne({ email });
      if (existingDoctor) {
        return res.status(400).json({ message: "Doctor already exists" });
      }

      const doctor = await Doctor.create({
        name: fullname,
        email,
        password: hashed,
        specialization,
        admin_id: decoded.id,
      });

      return res.status(201).json(formatStaffUser(doctor, "doctor"));
    }

    const existingPharmacist = await Pharmacist.findOne({ email });
    if (existingPharmacist) {
      return res.status(400).json({ message: "Pharmacist already exists" });
    }

    const pharmacist = await Pharmacist.create({
      name: fullname,
      email,
      password: hashed,
      admin_id: decoded.id,
    });

    res.status(201).json(formatStaffUser(pharmacist, "pharmacist"));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📋 Fetch doctors/pharmacists lists and stats
router.get("/users", async (req, res) => {
  try {
    const { token, role } = req.query;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    if (role && !validStaffRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (role) {
      const Model = role === "doctor" ? Doctor : Pharmacist;
      const records = await Model.find({ admin_id: decoded.id }).sort({ createdAt: -1 });
      return res.json({ success: true, data: records.map((item) => formatStaffUser(item, role)) });
    }

    const [doctorList, pharmacistList, patientCount] = await Promise.all([
      Doctor.find({ admin_id: decoded.id }).sort({ createdAt: -1 }),
      Pharmacist.find({ admin_id: decoded.id }).sort({ createdAt: -1 }),
      Patient.countDocuments({ admin_id: decoded.id }),
    ]);

    return res.json({
      success: true,
      doctors: doctorList.map((item) => formatStaffUser(item, "doctor")),
      pharmacists: pharmacistList.map((item) => formatStaffUser(item, "pharmacist")),
      patientCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📋 Get all patients
router.get("/patients", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    const patients = await Patient.find({ admin_id: decoded.id }).sort({ createdAt: -1 });
    
    const formattedPatients = patients.map((patient) => {
      const { firstName, lastName } = splitName(patient.name || "");
      return {
        id: patient._id?.toString(),
        oderId: patient.userId || patient._id?.toString().slice(-6),
        uniqueId: patient._id?.toString(),
        name: patient.name,
        firstName,
        lastName,
        email: patient.email,
        role: "patient",
        doctorId: patient.doctor_id?.toString(),
        createdAt: patient.createdAt,
      };
    });

    return res.json({ success: true, data: formattedPatients });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ➕ Add Patient (Admin can add patients directly)
router.post("/add-patient", async (req, res) => {
  try {
    const { token, fullname, email, password } = req.body;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: "Patient already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const patient = await Patient.create({
      name: fullname,
      email,
      password: hashed,
      admin_id: decoded.id,
    });

    const { firstName, lastName } = splitName(patient.name || "");

    return res.status(201).json({
      id: patient._id?.toString(),
      uniqueId: patient._id?.toString(),
      name: patient.name,
      firstName,
      lastName,
      email: patient.email,
      role: "patient",
      createdAt: patient.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ Remove Patient
router.delete("/remove-patient/:id", async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    await Patient.findByIdAndDelete(req.params.id);
    return res.json({ message: "Patient removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✏️ Update Doctor/Pharmacist details
router.put("/update-user/:id", async (req, res) => {
  try {
    const { token, role, fullname, email, specialization } = req.body;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    if (!validStaffRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    if (!fullname || !fullname.trim()) {
      return res.status(400).json({ message: "Full name is required" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    const Model = role === "doctor" ? Doctor : Pharmacist;

    // Check email uniqueness (excluding current record)
    const existing = await Model.findOne({ email: email.trim(), _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(400).json({ message: "Email already in use by another user" });
    }

    const updateData = { name: fullname.trim(), email: email.trim() };
    if (role === "doctor" && specialization !== undefined) {
      updateData.specialization = specialization.trim();
    }

    const updated = await Model.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ success: true, message: "User updated successfully", data: formatStaffUser(updated, role) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ Remove Doctor/Pharmacist
router.delete("/remove-user/:id", async (req, res) => {
  try {
    const { token, role } = req.body;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    if (!validStaffRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    if (role === "doctor") {
      await Doctor.findByIdAndDelete(req.params.id);
      return res.json({ message: "Doctor removed successfully" });
    }

    await Pharmacist.findByIdAndDelete(req.params.id);
    return res.json({ message: "Pharmacist removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔑 Reset Doctor/Pharmacist Password (Admin)
router.put("/reset-user-password/:id", async (req, res) => {
  try {
    const { token, role, newPassword } = req.body;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    if (!validStaffRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role provided" });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const Model = role === "doctor" ? Doctor : Pharmacist;
    const hashed = await bcrypt.hash(newPassword, 10);
    const updated = await Model.findByIdAndUpdate(req.params.id, { password: hashed }, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// 📋 Get Admin Profile
router.get("/profile", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.json({
      success: true,
      profile: {
        id: admin._id.toString(),
        fullname: admin.fullname || "",
        email: admin.email || "",
        role: admin.role || "admin",
        gender: admin.gender || "",
        phone: admin.phone || "",
        createdAt: admin.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✏️ Update Admin Profile
router.put("/profile", async (req, res) => {
  try {
    const { token, fullname, gender, phone } = req.body;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    if (!fullname || !fullname.trim()) {
      return res.status(400).json({ message: "Full name is required" });
    }

    const updateData = { fullname: fullname.trim() };
    if (gender !== undefined) updateData.gender = gender;
    if (phone !== undefined) updateData.phone = phone;

    const admin = await Admin.findByIdAndUpdate(
      decoded.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        id: admin._id.toString(),
        fullname: admin.fullname,
        email: admin.email,
        role: admin.role,
        gender: admin.gender,
        phone: admin.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔒 Change Admin Password
router.put("/change-password", async (req, res) => {
  try {
    const { token, currentPassword, newPassword } = req.body;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get pharmacy inventory statistics with historical data
router.get("/pharmacy-inventory", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    // Get all medicines from all pharmacists
    const medicines = await Medicine.find({});
    
    // Get transactions from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const transactions = await Transaction.find({
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: 1 });

    // Calculate daily inventory levels
    const dailyData = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      dailyData[dayName] = {
        totalQuantity: 0,
        transactions: 0
      };
    }

    // Aggregate transactions by day
    transactions.forEach(txn => {
      const dayName = days[new Date(txn.createdAt).getDay()];
      if (dailyData[dayName]) {
        dailyData[dayName].transactions += 1;
      }
    });

    // Calculate current stats
    const totalItems = medicines.length;
    const totalQuantity = medicines.reduce((sum, med) => sum + med.quantity, 0);
    const lowStock = medicines.filter((med) => med.quantity < 50).length;
    const outOfStock = medicines.filter((med) => med.quantity === 0).length;

    // Format daily data for chart
    const chartData = Object.keys(dailyData).map(day => ({
      day,
      value: dailyData[day].transactions
    }));

    res.json({
      success: true,
      stats: {
        totalItems,
        totalQuantity,
        lowStock,
        outOfStock,
      },
      chartData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get critical disease statistics from patient documents
router.get("/critical-diseases", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    // Get current month's date range
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get all documents with AI summaries from this month
    const documents = await Document.find({
      createdAt: { $gte: firstDayOfMonth },
      isSummarized: true,
      'aiSummary.keyFindings': { $exists: true, $ne: [] }
    });

    // Define disease keywords to search for
    const diseaseKeywords = {
      'Diabetes': ['diabetes', 'diabetic', 'blood sugar', 'glucose', 'insulin', 'hyperglycemia', 'hypoglycemia'],
      'Hypertension': ['hypertension', 'high blood pressure', 'elevated bp', 'blood pressure'],
      'Heart Disease': ['heart disease', 'cardiac', 'cardiovascular', 'coronary', 'heart attack', 'myocardial'],
      'Respiratory': ['respiratory', 'asthma', 'copd', 'pneumonia', 'bronchitis', 'lung'],
      'Kidney Disease': ['kidney', 'renal', 'nephropathy', 'kidney failure', 'dialysis']
    };

    // Count disease occurrences
    const diseaseCounts = {};
    Object.keys(diseaseKeywords).forEach(disease => {
      diseaseCounts[disease] = 0;
    });

    documents.forEach(doc => {
      const searchText = [
        doc.aiSummary?.summary || '',
        ...(doc.aiSummary?.keyFindings || []),
        doc.title || '',
        doc.description || ''
      ].join(' ').toLowerCase();

      Object.keys(diseaseKeywords).forEach(disease => {
        const keywords = diseaseKeywords[disease];
        const hasDisease = keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
        if (hasDisease) {
          diseaseCounts[disease]++;
        }
      });
    });

    // Calculate total and max for percentages
    const totalCases = Object.values(diseaseCounts).reduce((sum, count) => sum + count, 0);
    const maxCases = Math.max(...Object.values(diseaseCounts), 1);

    // Format data for frontend
    const diseases = Object.entries(diseaseCounts).map(([name, cases]) => ({
      name,
      cases,
      percentage: maxCases > 0 ? Math.round((cases / maxCases) * 100) : 0
    }));

    // Sort by cases descending
    diseases.sort((a, b) => b.cases - a.cases);

    // Calculate trend (compare with previous month for simplicity)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const lastMonthDocs = await Document.find({
      createdAt: { $gte: lastMonth, $lte: lastMonthEnd },
      isSummarized: true
    }).countDocuments();

    const trend = lastMonthDocs > 0 ? Math.round(((totalCases - lastMonthDocs) / lastMonthDocs) * 100) : 0;

    res.json({
      success: true,
      diseases,
      totalCases,
      trend
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get weekly activity statistics
router.get("/weekly-activity", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    // Get data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Initialize daily data for last 7 days
    const dailyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      dailyActivity.push({
        day: dayName,
        date: new Date(date),
        documents: 0,
        patients: 0,
        total: 0
      });
    }

    // Get documents uploaded in last 7 days
    const documents = await Document.find({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get patients registered in last 7 days
    const patients = await Patient.find({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Count documents per day
    documents.forEach(doc => {
      const docDate = new Date(doc.createdAt);
      docDate.setHours(0, 0, 0, 0);
      const dayIndex = dailyActivity.findIndex(d => d.date.getTime() === docDate.getTime());
      if (dayIndex !== -1) {
        dailyActivity[dayIndex].documents++;
        dailyActivity[dayIndex].total++;
      }
    });

    // Count patients per day
    patients.forEach(patient => {
      const patientDate = new Date(patient.createdAt);
      patientDate.setHours(0, 0, 0, 0);
      const dayIndex = dailyActivity.findIndex(d => d.date.getTime() === patientDate.getTime());
      if (dayIndex !== -1) {
        dailyActivity[dayIndex].patients++;
        dailyActivity[dayIndex].total++;
      }
    });

    // Calculate totals and average
    const totalActivity = dailyActivity.reduce((sum, day) => sum + day.total, 0);
    const avgPerDay = Math.round(totalActivity / 7);

    // Format chart data
    const chartData = dailyActivity.map(day => ({
      day: day.day,
      value: day.total
    }));

    res.json({
      success: true,
      chartData,
      stats: {
        totalActivity,
        avgPerDay,
        totalDocuments: documents.length,
        totalPatients: patients.length
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Generate API token for interoperability
router.post("/generate-api-token", async (req, res) => {
  try {
    const { token, expiryDays = 365 } = req.body;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    // Generate a secure random token
    const apiToken = crypto.randomBytes(32).toString('hex');
    
    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    // Update admin with new API token
    const admin = await Admin.findByIdAndUpdate(
      decoded.id,
      { 
        apiToken, 
        apiTokenExpiry: expiryDate 
      },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      success: true,
      apiToken,
      expiryDate,
      message: "API token generated successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current API token
router.get("/api-token", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    const admin = await Admin.findById(decoded.id).select('apiToken apiTokenExpiry');
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if token is expired
    const isExpired = admin.apiTokenExpiry && new Date() > admin.apiTokenExpiry;

    res.json({
      success: true,
      apiToken: admin.apiToken || null,
      expiryDate: admin.apiTokenExpiry || null,
      isExpired
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Revoke API token
router.delete("/api-token", async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    await Admin.findByIdAndUpdate(
      decoded.id,
      { 
        apiToken: "", 
        apiTokenExpiry: null 
      }
    );

    res.json({
      success: true,
      message: "API token revoked successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Validate API token (for external access)
router.get("/validate-token/:apiToken", async (req, res) => {
  try {
    const { apiToken } = req.params;

    const admin = await Admin.findOne({ apiToken }).select('fullname email apiTokenExpiry');
    
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid API token" 
      });
    }

    // Check if token is expired
    if (admin.apiTokenExpiry && new Date() > admin.apiTokenExpiry) {
      return res.status(401).json({ 
        success: false,
        message: "API token has expired" 
      });
    }

    res.json({
      success: true,
      message: "Token is valid",
      admin: {
        name: admin.fullname,
        email: admin.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Emergency Access - Get complete patient data
router.get("/emergency/patient/:patientId", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = authenticateAdmin(token, res);
    if (!decoded) return;

    const { patientId } = req.params;

    // Find patient with populated doctor information
    const patient = await Patient.findById(patientId)
      .populate('doctor_id', 'name email specialization')
      .lean();

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Fetch associated medical documents
    const documents = await Document.find({ patient_id: patientId })
      .select('title description category fileType fileSize s3Url createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch health reports
    const healthReports = await HealthReport.find({ patient_id: patientId })
      .select('reportType diagnosis symptoms notes createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch prescribed medicines
    const medicines = await Medicine.find({ patient_id: patientId })
      .select('name description category quantity expiryDate price')
      .sort({ createdAt: -1 })
      .lean();

    // Combine all data
    const emergencyData = {
      ...patient,
      documents,
      healthReports,
      medicines
    };

    // Log emergency access for audit trail
    console.log(`[EMERGENCY ACCESS] Admin ${decoded.id} accessed patient ${patientId} data at ${new Date().toISOString()}`);

    res.json({
      success: true,
      patient: emergencyData,
      accessTimestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Emergency access error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to retrieve patient data'
    });
  }
});

export default router;
