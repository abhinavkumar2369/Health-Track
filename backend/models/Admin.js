import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
    phone: { type: String, default: "" }
  },
  { timestamps: true }
);

export const Admin = mongoose.model("Admin", adminSchema, "admin");
