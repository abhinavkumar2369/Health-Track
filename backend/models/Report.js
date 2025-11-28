import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    reportType: {
      type: String,
      enum: ['inventory', 'transaction', 'summary', 'custom'],
      default: 'summary'
    },
    pharmacist_id: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacist", required: true },
    // S3 integration fields
    fileName: { type: String },
    originalName: { type: String },
    fileType: { type: String, default: 'application/pdf' },
    fileSize: { type: Number },
    s3Key: { type: String },
    s3Url: { type: String },
    // Report metadata
    dateFrom: { type: Date },
    dateTo: { type: Date },
    generatedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'completed'
    }
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema, "reports");
