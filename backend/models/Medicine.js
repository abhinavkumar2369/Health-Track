import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    quantity: { type: Number, default: 0 },
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    pharmacist_id: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacist" }
  },
  { timestamps: true }
);

export const Medicine = mongoose.model("Medicine", medicineSchema, "medicine");
