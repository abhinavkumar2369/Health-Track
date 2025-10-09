const User = require('../models/User');
const generateRandomPassword = require('../utils/generatePassword');

// @desc    Add a new patient
// @route   POST /api/doctor/patients
// @access  Private/Doctor
exports.addPatient = async (req, res) => {
    try {
        const { email, firstName, lastName, phone } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Generate unique ID and random password
        const uniqueId = await User.generateUniqueId('patient');
        const randomPassword = generateRandomPassword();

        // Create patient
        const patient = await User.create({
            uniqueId,
            email,
            password: randomPassword,
            role: 'patient',
            firstName,
            lastName,
            phone,
            createdBy: req.user.id,
            isFirstLogin: true
        });

        res.status(201).json({
            success: true,
            message: 'Patient added successfully',
            data: {
                uniqueId: patient.uniqueId,
                email: patient.email,
                firstName: patient.firstName,
                lastName: patient.lastName,
                temporaryPassword: randomPassword,
                note: 'Please share this temporary password with the patient. They will be required to change it on first login.'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add a new doctor
// @route   POST /api/doctor/doctors
// @access  Private/Doctor
exports.addDoctor = async (req, res) => {
    try {
        const { email, firstName, lastName, phone } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Generate unique ID and random password
        const uniqueId = await User.generateUniqueId('doctor');
        const randomPassword = generateRandomPassword();

        // Create doctor
        const doctor = await User.create({
            uniqueId,
            email,
            password: randomPassword,
            role: 'doctor',
            firstName,
            lastName,
            phone,
            createdBy: req.user.id,
            isFirstLogin: true
        });

        res.status(201).json({
            success: true,
            message: 'Doctor added successfully',
            data: {
                uniqueId: doctor.uniqueId,
                email: doctor.email,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                temporaryPassword: randomPassword,
                note: 'Please share this temporary password with the doctor. They will be required to change it on first login.'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add a new pharmacist
// @route   POST /api/doctor/pharmacists
// @access  Private/Doctor
exports.addPharmacist = async (req, res) => {
    try {
        const { email, firstName, lastName, phone } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Generate unique ID and random password
        const uniqueId = await User.generateUniqueId('pharmacist');
        const randomPassword = generateRandomPassword();

        // Create pharmacist
        const pharmacist = await User.create({
            uniqueId,
            email,
            password: randomPassword,
            role: 'pharmacist',
            firstName,
            lastName,
            phone,
            createdBy: req.user.id,
            isFirstLogin: true
        });

        res.status(201).json({
            success: true,
            message: 'Pharmacist added successfully',
            data: {
                uniqueId: pharmacist.uniqueId,
                email: pharmacist.email,
                firstName: pharmacist.firstName,
                lastName: pharmacist.lastName,
                temporaryPassword: randomPassword,
                note: 'Please share this temporary password with the pharmacist. They will be required to change it on first login.'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all patients
// @route   GET /api/doctor/patients
// @access  Private/Doctor
exports.getPatients = async (req, res) => {
    try {
        const patients = await User.find({ role: 'patient' }).select('-password');

        res.status(200).json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all doctors
// @route   GET /api/doctor/doctors
// @access  Private/Doctor
exports.getDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('-password');

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all pharmacists
// @route   GET /api/doctor/pharmacists
// @access  Private/Doctor
exports.getPharmacists = async (req, res) => {
    try {
        const pharmacists = await User.find({ role: 'pharmacist' }).select('-password');

        res.status(200).json({
            success: true,
            count: pharmacists.length,
            data: pharmacists
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
