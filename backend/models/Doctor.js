import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    specialization: String,
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    role: { type: String, default: "doctor" }
  },
  { timestamps: true }
);

export const Doctor = mongoose.model("Doctor", doctorSchema, "doctor");
