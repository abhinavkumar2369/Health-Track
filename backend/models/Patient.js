const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: String,
    unique: true,
    required: true
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  medicalHistory: {
    allergies: [String],
    chronicConditions: [String],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      endDate: Date
    }],
    surgeries: [{
      procedure: String,
      date: Date,
      hospital: String
    }]
  },
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    expirationDate: Date
  },
  vaccinationHistory: [{
    vaccine: String,
    date: Date,
    nextDue: Date,
    batchNumber: String,
    provider: String
  }],
  qrCode: {
    type: String,
    unique: true
  },
  healthTips: {
    preferences: [String], // diet, exercise, yoga, etc.
    lastSent: Date
  }
}, {
  timestamps: true
});

// Generate patient ID
patientSchema.pre('save', async function(next) {
  if (!this.patientId) {
    const count = await this.constructor.countDocuments();
    this.patientId = `PT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
