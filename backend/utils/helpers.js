const QRCode = require('qrcode');
const crypto = require('crypto');

// Generate unique patient ID
const generatePatientId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PT${timestamp.slice(-6)}${random}`;
};

// Generate QR code for emergency medical data
const generateEmergencyQR = async (patientData) => {
  try {
    const emergencyInfo = {
      patientId: patientData.patientId,
      name: patientData.name,
      bloodType: patientData.bloodType,
      allergies: patientData.allergies,
      emergencyContact: patientData.emergencyContact,
      criticalMedications: patientData.criticalMedications,
      accessUrl: `${process.env.BASE_URL}/api/fhir/emergency/${patientData.patientId}`
    };

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(emergencyInfo), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Format date for display
const formatDate = (date, format = 'long') => {
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }
  };

  return new Date(date).toLocaleDateString('en-US', options[format]);
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Calculate BMI
const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  
  // Convert height to meters if it's in cm
  const heightInMeters = height > 10 ? height / 100 : height;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  return Math.round(bmi * 10) / 10;
};

// Get BMI category
const getBMICategory = (bmi) => {
  if (!bmi) return 'Unknown';
  
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

// Generate secure random token
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Mask sensitive data for logging
const maskSensitiveData = (data) => {
  const sensitiveFields = ['password', 'ssn', 'creditCard', 'bankAccount'];
  const masked = { ...data };
  
  sensitiveFields.forEach(field => {
    if (masked[field]) {
      masked[field] = '***MASKED***';
    }
  });
  
  return masked;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Format phone number for display
const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

// Generate appointment time slots
const generateTimeSlots = (startTime, endTime, duration = 30) => {
  const slots = [];
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  
  let current = new Date(start);
  
  while (current < end) {
    slots.push(current.toTimeString().slice(0, 5));
    current.setMinutes(current.getMinutes() + duration);
  }
  
  return slots;
};

// Check if time slot is available
const isTimeSlotAvailable = (appointments, date, time) => {
  return !appointments.some(apt => 
    apt.appointmentDate.toDateString() === new Date(date).toDateString() &&
    apt.appointmentTime === time &&
    ['scheduled', 'confirmed'].includes(apt.status)
  );
};

// Convert medical record to patient-friendly summary
const generatePatientSummary = (medicalRecord) => {
  const summary = {
    visitDate: formatDate(medicalRecord.visitDate),
    doctorName: medicalRecord.doctor ? 
      `Dr. ${medicalRecord.doctor.user.profile.firstName} ${medicalRecord.doctor.user.profile.lastName}` : 
      'Unknown Doctor',
    chiefComplaint: medicalRecord.chiefComplaint,
    diagnosis: medicalRecord.diagnosis?.primary || 'Not specified',
    keyPoints: []
  };

  // Add key points
  if (medicalRecord.symptoms?.length > 0) {
    summary.keyPoints.push(`Symptoms: ${medicalRecord.symptoms.join(', ')}`);
  }

  if (medicalRecord.prescription?.length > 0) {
    const medications = medicalRecord.prescription.map(med => med.medication || med.name);
    summary.keyPoints.push(`Medications prescribed: ${medications.join(', ')}`);
  }

  if (medicalRecord.labTests?.length > 0) {
    const pendingTests = medicalRecord.labTests.filter(test => test.status === 'pending');
    if (pendingTests.length > 0) {
      summary.keyPoints.push(`Pending lab tests: ${pendingTests.map(test => test.testName).join(', ')}`);
    }
  }

  if (medicalRecord.followUpDate) {
    summary.keyPoints.push(`Follow-up scheduled: ${formatDate(medicalRecord.followUpDate)}`);
  }

  return summary;
};

// Data validation helpers
const validateRequired = (fields, data) => {
  const missing = [];
  
  fields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missing.push(field);
    }
  });
  
  return missing;
};

// Pagination helper
const getPaginationData = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 10;
  const totalPages = Math.ceil(total / itemsPerPage);
  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;
  
  return {
    page: currentPage,
    limit: itemsPerPage,
    total,
    totalPages,
    hasNext,
    hasPrev,
    offset: (currentPage - 1) * itemsPerPage
  };
};

module.exports = {
  generatePatientId,
  generateEmergencyQR,
  formatDate,
  calculateAge,
  calculateBMI,
  getBMICategory,
  generateSecureToken,
  maskSensitiveData,
  isValidEmail,
  isValidPhone,
  formatPhoneNumber,
  generateTimeSlots,
  isTimeSlotAvailable,
  generatePatientSummary,
  validateRequired,
  getPaginationData
};
