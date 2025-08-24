const express = require('express');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Hospital = require('../models/Hospital');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const { authorize } = require('../middleware/auth');
const { userValidation, doctorValidation, validate } = require('../middleware/validation');

const router = express.Router();

// All admin routes require admin role
router.use(authorize('admin'));

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      hospital
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        appointmentDate: {
          $gte: new Date().setHours(0, 0, 0, 0),
          $lt: new Date().setHours(23, 59, 59, 999)
        }
      }),
      Hospital.findOne() // Assuming single hospital setup
    ]);

    const occupancyRate = hospital ? 
      ((hospital.capacity.occupiedBeds / hospital.capacity.totalBeds) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        statistics: {
          totalPatients,
          totalDoctors,
          totalAppointments,
          todayAppointments,
          occupancyRate,
          availableBeds: hospital ? hospital.capacity.totalBeds - hospital.capacity.occupiedBeds : 0
        },
        hospital: hospital || null
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

// @desc    Create doctor
// @route   POST /api/admin/doctors
// @access  Private (Admin only)
router.post('/doctors', userValidation.register, doctorValidation.create, validate, async (req, res) => {
  try {
    const { email, password, profile, licenseNumber, specialization, department, experience, qualifications, schedule, consultationFee } = req.body;

    // Create user account for doctor
    const user = await User.create({
      email,
      password,
      role: 'doctor',
      profile,
      createdBy: req.user._id
    });

    // Create doctor profile
    const doctor = await Doctor.create({
      user: user._id,
      licenseNumber,
      specialization,
      department,
      experience,
      qualifications,
      schedule,
      consultationFee
    });

    // Populate user data
    await doctor.populate('user');

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating doctor',
      error: error.message
    });
  }
});

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Private (Admin only)
router.get('/doctors', async (req, res) => {
  try {
    const { page = 1, limit = 10, department, specialization } = req.query;
    
    let query = {};
    if (department) query.department = department;
    if (specialization) query.specialization = { $in: [specialization] };

    const doctors = await Doctor.find(query)
      .populate('user', '-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

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

// @desc    Update doctor
// @route   PUT /api/admin/doctors/:id
// @access  Private (Admin only)
router.put('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', '-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor updated successfully',
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating doctor',
      error: error.message
    });
  }
});

// @desc    Create patient
// @route   POST /api/admin/patients
// @access  Private (Admin only)
router.post('/patients', userValidation.register, validate, async (req, res) => {
  try {
    const { email, password, profile, emergencyContact, medicalHistory, insurance } = req.body;

    // Create user account for patient
    const user = await User.create({
      email,
      password,
      role: 'patient',
      profile,
      createdBy: req.user._id
    });

    // Create patient profile
    const patient = await Patient.create({
      user: user._id,
      emergencyContact,
      medicalHistory,
      insurance
    });

    // Populate user data
    await patient.populate('user');

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating patient',
      error: error.message
    });
  }
});

// @desc    Get all patients
// @route   GET /api/admin/patients
// @access  Private (Admin only)
router.get('/patients', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let query = {};
    if (search) {
      const users = await User.find({
        $or: [
          { 'profile.firstName': { $regex: search, $options: 'i' } },
          { 'profile.lastName': { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      query.user = { $in: users.map(user => user._id) };
    }

    const patients = await Patient.find(query)
      .populate('user', '-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Patient.countDocuments(query);

    res.json({
      success: true,
      data: {
        patients,
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
      message: 'Error fetching patients',
      error: error.message
    });
  }
});

// @desc    Update hospital information
// @route   PUT /api/admin/hospital
// @access  Private (Admin only)
router.put('/hospital', async (req, res) => {
  try {
    let hospital = await Hospital.findOne();
    
    if (!hospital) {
      hospital = await Hospital.create(req.body);
    } else {
      hospital = await Hospital.findByIdAndUpdate(
        hospital._id,
        req.body,
        { new: true, runValidators: true }
      );
    }

    res.json({
      success: true,
      message: 'Hospital information updated successfully',
      data: hospital
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating hospital information',
      error: error.message
    });
  }
});

// @desc    Get hospital statistics and projections
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
router.get('/analytics', async (req, res) => {
  try {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const [
      monthlyPatients,
      monthlyAppointments,
      departmentStats,
      occupancyTrend
    ] = await Promise.all([
      Patient.countDocuments({ createdAt: { $gte: thisMonth } }),
      Appointment.countDocuments({ 
        appointmentDate: { 
          $gte: thisMonth,
          $lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
        }
      }),
      Doctor.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ]),
      // Mock occupancy trend - in real scenario, you'd have historical data
      Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        occupancy: Math.floor(Math.random() * 30) + 70 // Random between 70-100%
      }))
    ]);

    // Calculate projected estimates
    const projectedEstimates = {
      nextMonthPatients: Math.ceil(monthlyPatients * 1.1), // 10% growth assumption
      bedsRequired: Math.ceil(monthlyPatients * 0.3), // 30% of patients need beds
      staffRequired: Math.ceil(monthlyPatients * 0.05), // 5% staff to patient ratio
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: {
        monthlyStats: {
          patients: monthlyPatients,
          appointments: monthlyAppointments
        },
        departmentStats,
        occupancyTrend,
        projectedEstimates
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

module.exports = router;
