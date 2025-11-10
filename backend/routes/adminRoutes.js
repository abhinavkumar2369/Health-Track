import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Doctor } from "../models/Doctor.js";
import { Pharmacist } from "../models/Pharmacist.js";

dotenv.config();

const router = express.Router();

// ➕ Add Doctor or Pharmacist
// Expects body: { token, fullname, email, password, role }
router.post("/add-user", async (req, res) => {
  // Inline token verification using token from request body
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: "Access denied: token required" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (decoded.role !== "admin") return res.status(403).json({ message: "Forbidden: admin only" });

    const { fullname, email, password, role, specialization } = req.body;
    if (!["doctor", "pharmacist"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const hashed = await bcrypt.hash(password, 10);

    if (role === "doctor") {
      const existingDoctor = await Doctor.findOne({ email });
      if (existingDoctor) return res.status(400).json({ message: "Doctor already exists" });

      const doctor = await Doctor.create({
        name: fullname,
        email,
        password: hashed,
        specialization,
        admin_id: decoded.id
      });

      return res.status(201).json(doctor);
    }

    const existingPharmacist = await Pharmacist.findOne({ email });
    if (existingPharmacist)
      return res.status(400).json({ message: "Pharmacist already exists" });

    const pharmacist = await Pharmacist.create({
      name: fullname,
      email,
      password: hashed,
      admin_id: decoded.id
    });

    res.status(201).json(pharmacist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ Remove Doctor/Pharmacist
router.delete("/remove-user/:id", async (req, res) => {
  // Expects body: { token, role }
  try {
    const { token, role } = req.body;
    if (!token) return res.status(401).json({ message: "Access denied: token required" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (decoded.role !== "admin") return res.status(403).json({ message: "Forbidden: admin only" });

    if (role === "doctor") {
      await Doctor.findByIdAndDelete(req.params.id);
      return res.json({ message: "Doctor removed successfully" });
    }

    if (role === "pharmacist") {
      await Pharmacist.findByIdAndDelete(req.params.id);
      return res.json({ message: "Pharmacist removed successfully" });
    }

    res.status(400).json({ message: "Invalid role provided" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
