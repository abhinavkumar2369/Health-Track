const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  specialization: [{
    type: String,
    required: true
  }],
  department: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  schedule: {
    workingDays: [String],
    workingHours: {
      start: String,
      end: String
    },
    consultationDuration: {
      type: Number,
      default: 30 // minutes
    }
  },
  consultationFee: {
    type: Number,
    required: true
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
