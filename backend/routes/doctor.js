const express = require('express');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const { authorize } = require('../middleware/auth');
const { medicalRecordValidation, appointmentValidation, validate } = require('../middleware/validation');

const router = express.Router();

// All doctor routes require doctor role
router.use(authorize('doctor'));

// @desc    Get doctor's dashboard
// @route   GET /api/doctor/dashboard
// @access  Private (Doctor only)
router.get('/dashboard', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [
      todayAppointments,
      totalPatients,
      pendingLabReports,
      upcomingAppointments
    ] = await Promise.all([
      Appointment.find({
        doctor: doctor._id,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay }
      }).populate('patient').populate({ path: 'patient', populate: { path: 'user' } }),
      
      MedicalRecord.distinct('patient', { doctor: doctor._id }),
      
      MedicalRecord.countDocuments({
        doctor: doctor._id,
        'labTests.status': 'pending'
      }),
      
      Appointment.find({
        doctor: doctor._id,
        appointmentDate: { $gte: endOfDay },
        status: { $in: ['scheduled', 'confirmed'] }
      }).populate('patient').populate({ path: 'patient', populate: { path: 'user' } }).limit(5)
    ]);

    res.json({
      success: true,
      data: {
        statistics: {
          todayAppointments: todayAppointments.length,
          totalPatients: totalPatients.length,
          pendingLabReports,
          upcomingAppointments: upcomingAppointments.length
        },
        todayAppointments,
        upcomingAppointments,
        doctor
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

// @desc    Create medical record
// @route   POST /api/doctor/medical-records
// @access  Private (Doctor only)
router.post('/medical-records', medicalRecordValidation.create, validate, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const medicalRecord = await MedicalRecord.create({
      ...req.body,
      doctor: doctor._id
    });

    await medicalRecord.populate([
      { path: 'patient', populate: { path: 'user' } },
      { path: 'doctor', populate: { path: 'user' } }
    ]);

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: medicalRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating medical record',
      error: error.message
    });
  }
});

// @desc    Get doctor's medical records
// @route   GET /api/doctor/medical-records
// @access  Private (Doctor only)
router.get('/medical-records', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const { page = 1, limit = 10, patient, startDate, endDate } = req.query;
    
    let query = { doctor: doctor._id };
    
    if (patient) query.patient = patient;
    if (startDate && endDate) {
      query.visitDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const medicalRecords = await MedicalRecord.find(query)
      .populate([
        { path: 'patient', populate: { path: 'user' } },
        { path: 'appointment' }
      ])
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

// @desc    Update medical record
// @route   PUT /api/doctor/medical-records/:id
// @access  Private (Doctor only)
router.put('/medical-records/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const medicalRecord = await MedicalRecord.findOneAndUpdate(
      { _id: req.params.id, doctor: doctor._id },
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'patient', populate: { path: 'user' } },
      { path: 'doctor', populate: { path: 'user' } }
    ]);

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    res.json({
      success: true,
      message: 'Medical record updated successfully',
      data: medicalRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating medical record',
      error: error.message
    });
  }
});

// @desc    Get patient's complete medical history
// @route   GET /api/doctor/patients/:id/history
// @access  Private (Doctor only)
router.get('/patients/:id/history', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const patient = await Patient.findById(req.params.id).populate('user');
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const [medicalRecords, appointments] = await Promise.all([
      MedicalRecord.find({ patient: patient._id })
        .populate('doctor', 'user')
        .sort({ visitDate: -1 }),
      
      Appointment.find({ patient: patient._id })
        .populate('doctor', 'user')
        .sort({ appointmentDate: -1 })
    ]);

    res.json({
      success: true,
      data: {
        patient,
        medicalRecords,
        appointments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patient history',
      error: error.message
    });
  }
});

// @desc    Update lab test results
// @route   PUT /api/doctor/lab-tests/:recordId/:testIndex
// @access  Private (Doctor only)
router.put('/lab-tests/:recordId/:testIndex', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const { result, resultDate, status } = req.body;
    const { recordId, testIndex } = req.params;

    const medicalRecord = await MedicalRecord.findOne({
      _id: recordId,
      doctor: doctor._id
    });

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    if (!medicalRecord.labTests[testIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    // Update lab test
    medicalRecord.labTests[testIndex].result = result;
    medicalRecord.labTests[testIndex].resultDate = resultDate || new Date();
    medicalRecord.labTests[testIndex].status = status || 'completed';

    await medicalRecord.save();

    res.json({
      success: true,
      message: 'Lab test updated successfully',
      data: medicalRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating lab test',
      error: error.message
    });
  }
});

// @desc    Get doctor's appointments
// @route   GET /api/doctor/appointments
// @access  Private (Doctor only)
router.get('/appointments', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const { date, status, page = 1, limit = 10 } = req.query;
    
    let query = { doctor: doctor._id };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }
    
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate([
        { path: 'patient', populate: { path: 'user' } }
      ])
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appointmentDate: 1, appointmentTime: 1 });

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

// @desc    Update appointment status
// @route   PUT /api/doctor/appointments/:id/status
// @access  Private (Doctor only)
router.put('/appointments/:id/status', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const { status, notes } = req.body;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: doctor._id },
      { 
        status, 
        'notes.doctor': notes 
      },
      { new: true }
    ).populate([
      { path: 'patient', populate: { path: 'user' } }
    ]);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating appointment status',
      error: error.message
    });
  }
});

// @desc    Generate insurance report for patient
// @route   GET /api/doctor/patients/:id/insurance-report
// @access  Private (Doctor only)
router.get('/patients/:id/insurance-report', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const patient = await Patient.findById(req.params.id).populate('user');
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const medicalRecords = await MedicalRecord.find({ patient: patient._id })
      .populate('doctor', 'user licenseNumber')
      .sort({ visitDate: -1 });

    // Generate comprehensive report for insurance
    const report = {
      patient: {
        id: patient.patientId,
        name: `${patient.user.profile.firstName} ${patient.user.profile.lastName}`,
        dateOfBirth: patient.user.profile.dateOfBirth,
        gender: patient.user.profile.gender,
        insurance: patient.insurance
      },
      medicalHistory: {
        allergies: patient.medicalHistory.allergies,
        chronicConditions: patient.medicalHistory.chronicConditions,
        currentMedications: patient.medicalHistory.medications
      },
      treatmentHistory: medicalRecords.map(record => ({
        date: record.visitDate,
        doctor: record.doctor.user.profile.firstName + ' ' + record.doctor.user.profile.lastName,
        licenseNumber: record.doctor.licenseNumber,
        diagnosis: record.diagnosis,
        treatment: record.prescription,
        labTests: record.labTests
      })),
      generatedAt: new Date(),
      generatedBy: {
        doctor: `${req.user.profile.firstName} ${req.user.profile.lastName}`,
        licenseNumber: doctor.licenseNumber
      }
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating insurance report',
      error: error.message
    });
  }
});

module.exports = router;
