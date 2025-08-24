const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  visitDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  chiefComplaint: {
    type: String,
    required: true
  },
  symptoms: [String],
  diagnosis: {
    primary: String,
    secondary: [String],
    icdCodes: [String]
  },
  prescription: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  labTests: [{
    testName: String,
    ordered: { type: Boolean, default: false },
    orderedDate: Date,
    result: String,
    resultDate: Date,
    normalRange: String,
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }
  }],
  vitals: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    bmi: Number,
    oxygenSaturation: Number
  },
  notes: String,
  attachments: [{
    filename: String,
    url: String,
    type: String, // 'image', 'pdf', 'document'
    uploadedAt: { type: Date, default: Date.now }
  }],
  followUpDate: Date,
  recordType: {
    type: String,
    enum: ['consultation', 'emergency', 'routine-checkup', 'lab-report'],
    default: 'consultation'
  },
  fhirData: {
    type: mongoose.Schema.Types.Mixed // Store FHIR formatted data
  }
}, {
  timestamps: true
});

// Index for efficient querying
medicalRecordSchema.index({ patient: 1, visitDate: -1 });
medicalRecordSchema.index({ doctor: 1, visitDate: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
