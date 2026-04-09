import mongoose from "mongoose";
import { generateUniqueHealthcareUserId } from "../utils/healthcareUserId.js";

const pharmacistSchema = new mongoose.Schema(
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
    gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
    phone: { type: String },
    inventory: { type: [String], default: [] },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    role: { type: String, default: "pharmacist" },
  },
  { timestamps: true }
);

// Assign globally unique 8-digit IDs for healthcare users.
pharmacistSchema.pre("validate", async function (next) {
  try {
    if (this.isNew && !this.userId) {
      this.userId = await generateUniqueHealthcareUserId();
    }
    next();
  } catch (error) {
    next(error);
  }
});

export const Pharmacist = mongoose.model("Pharmacist", pharmacistSchema, "pharmacist");
