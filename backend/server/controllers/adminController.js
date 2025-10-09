const User = require('../models/User');
const generateRandomPassword = require('../utils/generatePassword');

// @desc    Register a new admin (Only first admin or by another admin)
// @route   POST /api/admin/register
// @access  Public (for first admin) / Private (for subsequent admins)
exports.registerAdmin = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Generate unique ID
        const uniqueId = await User.generateUniqueId('admin');

        // Create admin
        const user = await User.create({
            uniqueId,
            email,
            password,
            role: 'admin',
            firstName,
            lastName,
            phone,
            isFirstLogin: false
        });

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            data: {
                uniqueId: user.uniqueId,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const { role, isActive } = req.query;
        
        let filter = {};
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const users = await User.find(filter).select('-password');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Deactivate user
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private/Admin
exports.deactivateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = false;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User deactivated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Activate user
// @route   PUT /api/admin/users/:id/activate
// @access  Private/Admin
exports.activateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User activated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add a new doctor (Admin only)
// @route   POST /api/admin/doctors
// @access  Private/Admin
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

// @desc    Add a new patient (Admin only)
// @route   POST /api/admin/patients
// @access  Private/Admin
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

// @desc    Add a new pharmacist (Admin only)
// @route   POST /api/admin/pharmacists
// @access  Private/Admin
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
