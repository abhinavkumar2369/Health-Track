import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Patient } from "../models/Patient.js";

const router = express.Router();

dotenv.config();

const decodeDoctorToken = (token, res) => {
  if (!token) {
    res.status(401).json({ message: "Access denied: token required" });
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "doctor") {
      res.status(403).json({ message: "Forbidden: doctor only" });
      return null;
    }
    return decoded;
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
    return null;
  }
};

// View all patients linked to the doctor
router.get("/my-patients", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = decodeDoctorToken(token, res);
    if (!decoded) return;

    const patients = await Patient.find({ doctor_id: decoded.id });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ➕ Add Patient (creates Patient document)
router.post("/add-patient", async (req, res) => {
  try {
    const { token, fullname, email, password } = req.body;
    const decoded = decodeDoctorToken(token, res);
    if (!decoded) return;

    const existing = await Patient.findOne({ email });
    if (existing) return res.status(400).json({ message: "Patient already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const patient = await Patient.create({
      name: fullname,
      email,
      password: hashed,
      doctor_id: decoded.id,
      admin_id: decoded.admin_id || null
    });

    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ Remove Patient (only by the doctor who added them)
router.delete("/remove-patient/:id", async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = decodeDoctorToken(token, res);
    if (!decoded) return;

    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // Only allow removal if doctorId matches
    if (String(patient.doctor_id) !== String(decoded.id)) {
      return res.status(403).json({ message: "Forbidden: only the doctor who added can remove" });
    }

  // Remove Patient document
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
