const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 30 // minutes
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine'],
    required: true
  },
  notes: {
    patient: String,
    doctor: String
  },
  reminder: {
    sent: { type: Boolean, default: false },
    sentAt: Date
  },
  aiSuggestions: {
    optimalTime: String,
    alternativeSlots: [String]
  }
}, {
  timestamps: true
});

// Index for efficient querying
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
