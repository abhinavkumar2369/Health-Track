const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const userValidation = {
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('profile.firstName').notEmpty().withMessage('First name is required'),
    body('profile.lastName').notEmpty().withMessage('Last name is required'),
    body('profile.phone').notEmpty().withMessage('Phone number is required'),
    body('role').isIn(['admin', 'doctor', 'patient']).withMessage('Invalid role')
  ],
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ]
};

// Doctor validation rules
const doctorValidation = {
  create: [
    body('licenseNumber').notEmpty().withMessage('License number is required'),
    body('specialization').isArray({ min: 1 }).withMessage('At least one specialization is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('experience').isNumeric().withMessage('Experience must be a number'),
    body('consultationFee').isNumeric().withMessage('Consultation fee must be a number')
  ]
};

// Patient validation rules
const patientValidation = {
  create: [
    body('emergencyContact.name').optional().notEmpty().withMessage('Emergency contact name cannot be empty'),
    body('emergencyContact.phone').optional().notEmpty().withMessage('Emergency contact phone cannot be empty')
  ]
};

// Appointment validation rules
const appointmentValidation = {
  create: [
    body('doctor').notEmpty().withMessage('Doctor is required'),
    body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
    body('appointmentTime').notEmpty().withMessage('Appointment time is required'),
    body('type').isIn(['consultation', 'follow-up', 'emergency', 'routine']).withMessage('Invalid appointment type')
  ]
};

// Medical record validation rules
const medicalRecordValidation = {
  create: [
    body('patient').notEmpty().withMessage('Patient is required'),
    body('chiefComplaint').notEmpty().withMessage('Chief complaint is required'),
    body('diagnosis.primary').optional().notEmpty().withMessage('Primary diagnosis cannot be empty')
  ]
};

module.exports = {
  validate,
  userValidation,
  doctorValidation,
  patientValidation,
  appointmentValidation,
  medicalRecordValidation
};
