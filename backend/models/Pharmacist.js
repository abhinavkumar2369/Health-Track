import mongoose from "mongoose";

const pharmacistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    inventory: { type: [String], default: [] },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    role: { type: String, default: "pharmacist" }
  },
  { timestamps: true }
);

export const Pharmacist = mongoose.model("Pharmacist", pharmacistSchema, "pharmacist");
