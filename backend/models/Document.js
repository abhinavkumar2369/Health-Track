import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    fileUrl: String,
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    // Added fields for S3 integration
    fileName: { type: String },
    originalName: { type: String },
    fileType: { type: String },
    fileSize: { type: Number },
    s3Key: { type: String },
    s3Url: { type: String },
    category: {
      type: String,
      enum: ['lab-report', 'prescription', 'scan', 'consultation', 'other'],
      default: 'other'
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'under-review'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", documentSchema, "document");
