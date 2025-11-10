import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    fileUrl: String,
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", documentSchema, "document");
