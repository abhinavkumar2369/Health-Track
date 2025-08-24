const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  capacity: {
    totalBeds: { type: Number, required: true },
    occupiedBeds: { type: Number, default: 0 },
    icuBeds: { type: Number, default: 0 },
    emergencyBeds: { type: Number, default: 0 }
  },
  departments: [String],
  facilities: [String],
  statistics: {
    totalPatients: { type: Number, default: 0 },
    totalDoctors: { type: Number, default: 0 },
    totalStaff: { type: Number, default: 0 },
    monthlyPatients: { type: Number, default: 0 },
    averageStayDuration: { type: Number, default: 0 }
  },
  projectedEstimates: {
    nextMonthPatients: Number,
    bedsRequired: Number,
    staffRequired: Number,
    lastUpdated: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hospital', hospitalSchema);
