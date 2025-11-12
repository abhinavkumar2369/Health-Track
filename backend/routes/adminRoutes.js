import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Doctor } from "../models/Doctor.js";
import { Pharmacist } from "../models/Pharmacist.js";
import { Patient } from "../models/Patient.js";

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

export default router;
