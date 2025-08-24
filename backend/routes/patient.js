const express = require('express');
const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const QRCode = require('qrcode');
const { authorize } = require('../middleware/auth');
const { appointmentValidation, validate } = require('../middleware/validation');

const router = express.Router();

// All patient routes require patient role
router.use(authorize('patient'));

// @desc    Get patient dashboard
// @route   GET /api/patient/dashboard
// @access  Private (Patient only)
router.get('/dashboard', async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id }).populate('user');
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const [
      upcomingAppointments,
      recentRecords,
      pendingLabTests,
      vaccinationsDue
    ] = await Promise.all([
      Appointment.find({
        patient: patient._id,
        appointmentDate: { $gte: new Date() },
        status: { $in: ['scheduled', 'confirmed'] }
      }).populate({ path: 'doctor', populate: { path: 'user' } }).limit(3),

      MedicalRecord.find({ patient: patient._id })
        .populate({ path: 'doctor', populate: { path: 'user' } })
        .sort({ visitDate: -1 })
        .limit(3),

      MedicalRecord.countDocuments({
        patient: patient._id,
        'labTests.status': 'pending'
      }),

      // Check for overdue vaccinations
      patient.vaccinationHistory.filter(vac => 
        vac.nextDue && new Date(vac.nextDue) <= new Date()
      ).length
    ]);

    res.json({
      success: true,
      data: {
        patient,
        statistics: {
          upcomingAppointments: upcomingAppointments.length,
          recentRecords: recentRecords.length,
          pendingLabTests,
          vaccinationsDue
        },
        upcomingAppointments,
        recentRecords
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

// @desc    Get patient profile
// @route   GET /api/patient/profile
// @access  Private (Patient only)
router.get('/profile', async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id }).populate('user');
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// @desc    Update patient profile
// @route   PUT /api/patient/profile
// @access  Private (Patient only)
router.put('/profile', async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('user');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @desc    Get medical records
// @route   GET /api/patient/medical-records
// @access  Private (Patient only)
router.get('/medical-records', async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    let query = { patient: patient._id };
    
    if (startDate && endDate) {
      query.visitDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const medicalRecords = await MedicalRecord.find(query)
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ visitDate: -1 });

    const total = await MedicalRecord.countDocuments(query);

    res.json({
      success: true,
      data: {
        medicalRecords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching medical records',
      error: error.message
    });
  }
});

// @desc    Get specific medical record
// @route   GET /api/patient/medical-records/:id
// @access  Private (Patient only)
router.get('/medical-records/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const medicalRecord = await MedicalRecord.findOne({
      _id: req.params.id,
      patient: patient._id
    }).populate([
      { path: 'doctor', populate: { path: 'user' } },
      { path: 'appointment' }
    ]);

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    res.json({
      success: true,
      data: medicalRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching medical record',
      error: error.message
    });
  }
});

// @desc    Book appointment
// @route   POST /api/patient/appointments
// @access  Private (Patient only)
router.post('/appointments', appointmentValidation.create, validate, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(req.body.doctor);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check for conflicting appointments
    const existingAppointment = await Appointment.findOne({
      doctor: req.body.doctor,
      appointmentDate: new Date(req.body.appointmentDate),
      appointmentTime: req.body.appointmentTime,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    const appointment = await Appointment.create({
      ...req.body,
      patient: patient._id
    });

    await appointment.populate([
      { path: 'doctor', populate: { path: 'user' } },
      { path: 'patient', populate: { path: 'user' } }
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error booking appointment',
      error: error.message
    });
  }
});

// @desc    Get patient appointments
// @route   GET /api/patient/appointments
// @access  Private (Patient only)
router.get('/appointments', async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { patient: patient._id };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appointmentDate: -1 });

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
});

// @desc    Cancel appointment
// @route   PUT /api/patient/appointments/:id/cancel
// @access  Private (Patient only)
router.put('/appointments/:id/cancel', async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { 
        _id: req.params.id, 
        patient: patient._id,
        status: { $in: ['scheduled', 'confirmed'] }
      },
      { 
        status: 'cancelled',
        'notes.patient': req.body.reason 
      },
      { new: true }
    ).populate({ path: 'doctor', populate: { path: 'user' } });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or cannot be cancelled'
      });
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
});

// @desc    Get vaccination history
// @route   GET /api/patient/vaccinations
// @access  Private (Patient only)
router.get('/vaccinations', async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id }).populate('user');
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Separate overdue and upcoming vaccinations
    const now = new Date();
    const overdue = patient.vaccinationHistory.filter(vac => 
      vac.nextDue && new Date(vac.nextDue) <= now
    );
    const upcoming = patient.vaccinationHistory.filter(vac => 
      vac.nextDue && new Date(vac.nextDue) > now && 
      new Date(vac.nextDue) <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
    );

    res.json({
      success: true,
      data: {
        vaccinationHistory: patient.vaccinationHistory,
        overdue,
        upcoming
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vaccination history',
      error: error.message
    });
  }
});

// @desc    Generate emergency QR code
// @route   GET /api/patient/emergency-qr
// @access  Private (Patient only)
router.get('/emergency-qr', async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id }).populate('user');
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Emergency medical information
    const emergencyData = {
      patientId: patient.patientId,
      name: `${patient.user.profile.firstName} ${patient.user.profile.lastName}`,
      dateOfBirth: patient.user.profile.dateOfBirth,
      bloodType: patient.medicalHistory.bloodType,
      allergies: patient.medicalHistory.allergies,
      chronicConditions: patient.medicalHistory.chronicConditions,
      emergencyContact: patient.emergencyContact,
      currentMedications: patient.medicalHistory.medications.filter(med => 
        !med.endDate || new Date(med.endDate) > new Date()
      ),
      apiUrl: `${req.protocol}://${req.get('host')}/api/patient/emergency-data/${patient.patientId}`
    };

    // Generate QR code
    const qrCode = await QRCode.toDataURL(JSON.stringify(emergencyData));

    // Save QR code to patient profile if not exists
    if (!patient.qrCode) {
      patient.qrCode = qrCode;
      await patient.save();
    }

    res.json({
      success: true,
      data: {
        qrCode,
        emergencyData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating QR code',
      error: error.message
    });
  }
});

// @desc    Get health tips
// @route   GET /api/patient/health-tips
// @access  Private (Patient only)
router.get('/health-tips', async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Get latest medical records to provide personalized tips
    const recentRecords = await MedicalRecord.find({ patient: patient._id })
      .sort({ visitDate: -1 })
      .limit(3);

    // Generate health tips based on patient's conditions and preferences
    const healthTips = {
      diet: [
        "Eat a balanced diet rich in fruits and vegetables",
        "Limit processed foods and added sugars",
        "Stay hydrated by drinking 8-10 glasses of water daily",
        "Include lean proteins in your meals"
      ],
      exercise: [
        "Aim for at least 30 minutes of moderate exercise daily",
        "Take regular breaks if you have a sedentary job",
        "Try walking, swimming, or cycling for cardiovascular health",
        "Include strength training exercises twice a week"
      ],
      yoga: [
        "Practice deep breathing exercises for stress relief",
        "Try gentle yoga stretches to improve flexibility",
        "Meditation can help reduce anxiety and improve mental health",
        "Consider joining a yoga class for guided practice"
      ],
      general: [
        "Get 7-9 hours of quality sleep each night",
        "Schedule regular health check-ups",
        "Avoid smoking and limit alcohol consumption",
        "Manage stress through relaxation techniques"
      ]
    };

    // Filter tips based on patient preferences
    const preferences = patient.healthTips?.preferences || ['general'];
    const personalizedTips = {};
    
    preferences.forEach(pref => {
      if (healthTips[pref]) {
        personalizedTips[pref] = healthTips[pref];
      }
    });

    res.json({
      success: true,
      data: {
        tips: personalizedTips,
        preferences: patient.healthTips?.preferences || [],
        lastSent: patient.healthTips?.lastSent
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching health tips',
      error: error.message
    });
  }
});

// @desc    Update health tip preferences
// @route   PUT /api/patient/health-tips/preferences
// @access  Private (Patient only)
router.put('/health-tips/preferences', async (req, res) => {
  try {
    const { preferences } = req.body;
    
    const patient = await Patient.findOneAndUpdate(
      { user: req.user._id },
      { 
        'healthTips.preferences': preferences,
        'healthTips.lastSent': new Date()
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Health tip preferences updated successfully',
      data: patient.healthTips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
});

// @desc    Get available doctors
// @route   GET /api/patient/doctors
// @access  Private (Patient only)
router.get('/doctors', async (req, res) => {
  try {
    const { specialization, department, page = 1, limit = 10 } = req.query;
    
    let query = { isAvailable: true };
    if (specialization) query.specialization = { $in: [specialization] };
    if (department) query.department = department;

    const doctors = await Doctor.find(query)
      .populate('user', '-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'rating.average': -1 });

    const total = await Doctor.countDocuments(query);

    res.json({
      success: true,
      data: {
        doctors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    });
  }
});

module.exports = router;
