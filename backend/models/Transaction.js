import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      required: true,
      enum: ['add', 'issue', 'remove', 'update']
    },
    medicineName: { type: String, required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
    quantity: { type: Number, required: true },
    price: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    patientName: { type: String },
    notes: { type: String },
    pharmacist_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Pharmacist",
      required: true 
    },
    previousQuantity: { type: Number },
    newQuantity: { type: Number }
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema, "transactions");
