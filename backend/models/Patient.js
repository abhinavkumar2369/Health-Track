import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    role: { type: String, default: "patient" }
  },
  { timestamps: true }
);

export const Patient = mongoose.model("Patient", patientSchema, "patient");
