import mongoose from "mongoose";

const healthReportSchema = new mongoose.Schema(
  {
    patient_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Patient", 
      required: true,
      index: true
    },
    title: { 
      type: String, 
      default: 'Health Summary Report'
    },
    description: {
      type: String,
      default: 'Comprehensive health report including medical records, AI summaries, and health metrics'
    },
    
    // S3 Storage Fields
    fileName: { type: String, required: true },
    originalName: { type: String },
    fileType: { type: String, default: 'application/pdf' },
    fileSize: { type: Number },
    s3Key: { type: String, required: true },
    s3Url: { type: String },
    
    // Report Statistics
    totalDocuments: { type: Number, default: 0 },
    summarizedDocuments: { type: Number, default: 0 },
    labReports: { type: Number, default: 0 },
    prescriptions: { type: Number, default: 0 },
    scans: { type: Number, default: 0 },
    consultations: { type: Number, default: 0 },
    
    // Report Metadata
    generatedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'completed'
    },
    
    // Documents included in this report
    documentIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document"
    }],
    
    // Generation options
    includeRecords: { type: Boolean, default: true },
    includeAppointments: { type: Boolean, default: true },
    includePrescriptions: { type: Boolean, default: true },
    includeHealthMetrics: { type: Boolean, default: true }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for download URL (pre-signed URL will be generated on-demand)
healthReportSchema.virtual('downloadUrl').get(function() {
  return this.s3Url;
});

// Index for faster queries
healthReportSchema.index({ patient_id: 1, createdAt: -1 });

export const HealthReport = mongoose.model("HealthReport", healthReportSchema, "healthreports");
