import mongoose from "mongoose";
import { generateUniqueHealthcareUserId } from "../utils/healthcareUserId.js";

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: true,
      immutable: true,
      index: true,
    },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    role: { type: String, default: "patient" },
    phone: { type: String },
    dateOfBirth: { type: String },
    gender: { type: String },
    address: { type: String },
  },
  { timestamps: true }
);

// Assign globally unique 8-digit IDs for healthcare users.
patientSchema.pre("validate", async function (next) {
  try {
    if (this.isNew && !this.userId) {
      this.userId = await generateUniqueHealthcareUserId();
    }
    next();
  } catch (error) {
    next(error);
  }
});

export const Patient = mongoose.model("Patient", patientSchema, "patient");
