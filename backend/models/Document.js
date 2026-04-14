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
      default: 'under-review'
    },
    // AI Summarization fields
    aiSummary: {
      summary: { type: String },
      extractedText: { type: String },
      keyFindings: [{ type: String }],
      medicalTerms: [{
        term: { type: String },
        explanation: { type: String }
      }],
      recommendations: [{ type: String }],
      urgencyLevel: { 
        type: String, 
        enum: ['low', 'medium', 'high'],
        default: 'low'
      },
      summarizedAt: { type: Date },
      summarizedBy: { type: String, default: 'AI System' }
    },
    isSummarized: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", documentSchema, "document");
