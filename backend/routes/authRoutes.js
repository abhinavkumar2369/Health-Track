import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Admin } from "../models/Admin.js";
import { Doctor } from "../models/Doctor.js";
import { Pharmacist } from "../models/Pharmacist.js";
import { Patient } from "../models/Patient.js";

dotenv.config();
const router = express.Router();

/**
 * ADMIN SIGN-UP
 */
router.post("/sign-up", async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;
    if (role !== "admin")
      return res.status(400).json({ message: "Only admin can sign up directly" });

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await Admin.create({ fullname, email, password: hashed, role });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * SIGN-IN (For Admin, Doctor, Patient, Pharmacist)
 */
router.post("/sign-in", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const modelMap = {
      admin: Admin,
      doctor: Doctor,
      patient: Patient,
      pharmacist: Pharmacist,
    };

    const Model = modelMap[role];
    if (!Model) return res.status(400).json({ message: "Invalid role" });

    const user = await Model.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    const payload = { id: user._id, email: user.email, role };
    if (role === "doctor" && user.admin_id) payload.admin_id = user.admin_id;
    if (role === "patient") {
      if (user.admin_id) payload.admin_id = user.admin_id;
      if (user.doctor_id) payload.doctor_id = user.doctor_id;
    }
    if (role === "pharmacist" && user.admin_id) payload.admin_id = user.admin_id;

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: { id: user._id, email: user.email, role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
