const express = require('express');
const axios = require('axios');
const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Doctor = require('../models/Doctor');
const { auth } = require('../middleware/auth');

const router = express.Router();

// FHIR Base URL from environment
const FHIR_BASE_URL = process.env.FHIR_SERVER_URL || 'http://localhost:8080/fhir';

// @desc    Convert patient to FHIR format
// @route   GET /api/fhir/patient/:id
// @access  Private
router.get('/patient/:id', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('user');
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Convert to FHIR Patient resource
    const fhirPatient = {
      resourceType: 'Patient',
      id: patient._id.toString(),
      identifier: [
        {
          use: 'usual',
          system: 'http://health-track.local/patient-id',
          value: patient.patientId
        }
      ],
      active: true,
      name: [
        {
          use: 'official',
          family: patient.user.profile.lastName,
          given: [patient.user.profile.firstName]
        }
      ],
      telecom: [
        {
          system: 'email',
          value: patient.user.email,
          use: 'home'
        },
        {
          system: 'phone',
          value: patient.user.profile.phone,
          use: 'home'
        }
      ],
      gender: patient.user.profile.gender || 'unknown',
      birthDate: patient.user.profile.dateOfBirth ? 
        patient.user.profile.dateOfBirth.toISOString().split('T')[0] : null,
      address: patient.user.profile.address ? [
        {
          use: 'home',
          line: [patient.user.profile.address.street],
          city: patient.user.profile.address.city,
          state: patient.user.profile.address.state,
          postalCode: patient.user.profile.address.zipCode,
          country: patient.user.profile.address.country
        }
      ] : [],
      contact: patient.emergencyContact ? [
        {
          relationship: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                  code: 'C',
                  display: 'Emergency Contact'
                }
              ]
            }
          ],
          name: {
            family: patient.emergencyContact.name
          },
          telecom: [
            {
              system: 'phone',
              value: patient.emergencyContact.phone
            }
          ]
        }
      ] : []
    };

    res.json({
      success: true,
      data: fhirPatient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error converting patient to FHIR format',
      error: error.message
    });
  }
});

// @desc    Convert medical record to FHIR Observation
// @route   GET /api/fhir/observation/:recordId
// @access  Private
router.get('/observation/:recordId', auth, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.recordId)
      .populate('patient')
      .populate('doctor');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Convert to FHIR Observation resource
    const fhirObservation = {
      resourceType: 'Observation',
      id: record._id.toString(),
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs',
              display: 'Vital Signs'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '8867-4',
            display: 'Heart rate'
          }
        ]
      },
      subject: {
        reference: `Patient/${record.patient._id}`,
        display: `${record.patient.user?.profile?.firstName} ${record.patient.user?.profile?.lastName}`
      },
      effectiveDateTime: record.visitDate.toISOString(),
      performer: [
        {
          reference: `Practitioner/${record.doctor._id}`,
          display: `Dr. ${record.doctor.user?.profile?.firstName} ${record.doctor.user?.profile?.lastName}`
        }
      ],
      valueQuantity: record.vitals?.heartRate ? {
        value: record.vitals.heartRate,
        unit: 'beats/min',
        system: 'http://unitsofmeasure.org',
        code: '/min'
      } : undefined,
      component: []
    };

    // Add other vital signs as components
    if (record.vitals?.bloodPressure) {
      fhirObservation.component.push({
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '85354-9',
              display: 'Blood pressure panel'
            }
          ]
        },
        valueString: record.vitals.bloodPressure
      });
    }

    if (record.vitals?.temperature) {
      fhirObservation.component.push({
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8310-5',
              display: 'Body temperature'
            }
          ]
        },
        valueQuantity: {
          value: record.vitals.temperature,
          unit: 'Cel',
          system: 'http://unitsofmeasure.org',
          code: 'Cel'
        }
      });
    }

    res.json({
      success: true,
      data: fhirObservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error converting record to FHIR format',
      error: error.message
    });
  }
});

// @desc    Convert doctor to FHIR Practitioner
// @route   GET /api/fhir/practitioner/:id
// @access  Private
router.get('/practitioner/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Convert to FHIR Practitioner resource
    const fhirPractitioner = {
      resourceType: 'Practitioner',
      id: doctor._id.toString(),
      identifier: [
        {
          use: 'official',
          system: 'http://health-track.local/license-number',
          value: doctor.licenseNumber
        }
      ],
      active: doctor.isAvailable,
      name: [
        {
          use: 'official',
          prefix: ['Dr.'],
          family: doctor.user.profile.lastName,
          given: [doctor.user.profile.firstName]
        }
      ],
      telecom: [
        {
          system: 'email',
          value: doctor.user.email,
          use: 'work'
        },
        {
          system: 'phone',
          value: doctor.user.profile.phone,
          use: 'work'
        }
      ],
      gender: doctor.user.profile.gender || 'unknown',
      qualification: doctor.qualifications?.map(qual => ({
        code: {
          text: qual.degree
        },
        issuer: {
          display: qual.institution
        },
        period: {
          start: qual.year ? `${qual.year}-01-01` : undefined
        }
      })) || []
    };

    res.json({
      success: true,
      data: fhirPractitioner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error converting doctor to FHIR format',
      error: error.message
    });
  }
});

// @desc    Send patient data to external FHIR server
// @route   POST /api/fhir/sync/patient/:id
// @access  Private
router.post('/sync/patient/:id', auth, async (req, res) => {
  try {
    // Get FHIR patient data
    const patientResponse = await axios.get(`${req.protocol}://${req.get('host')}/api/fhir/patient/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });

    const fhirPatient = patientResponse.data.data;

    // Send to external FHIR server
    const response = await axios.post(`${FHIR_BASE_URL}/Patient`, fhirPatient, {
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      }
    });

    res.json({
      success: true,
      message: 'Patient data synced to FHIR server successfully',
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error syncing patient data to FHIR server',
      error: error.response?.data || error.message
    });
  }
});

// @desc    Send medical record to external FHIR server as Observation
// @route   POST /api/fhir/sync/observation/:recordId
// @access  Private
router.post('/sync/observation/:recordId', auth, async (req, res) => {
  try {
    // Get FHIR observation data
    const observationResponse = await axios.get(
      `${req.protocol}://${req.get('host')}/api/fhir/observation/${req.params.recordId}`,
      {
        headers: { Authorization: req.headers.authorization }
      }
    );

    const fhirObservation = observationResponse.data.data;

    // Send to external FHIR server
    const response = await axios.post(`${FHIR_BASE_URL}/Observation`, fhirObservation, {
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      }
    });

    res.json({
      success: true,
      message: 'Observation data synced to FHIR server successfully',
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error syncing observation data to FHIR server',
      error: error.response?.data || error.message
    });
  }
});

// @desc    Bulk export for government data sharing
// @route   GET /api/fhir/export/bulk
// @access  Private (Admin only)
router.get('/export/bulk', auth, async (req, res) => {
  try {
    const { startDate, endDate, resourceType } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bundle = {
      resourceType: 'Bundle',
      id: `bulk-export-${Date.now()}`,
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: []
    };

    // Export patients if requested
    if (!resourceType || resourceType === 'Patient') {
      const patients = await Patient.find(query).populate('user');
      
      for (const patient of patients) {
        const patientResponse = await axios.get(
          `${req.protocol}://${req.get('host')}/api/fhir/patient/${patient._id}`,
          {
            headers: { Authorization: req.headers.authorization }
          }
        );
        
        bundle.entry.push({
          resource: patientResponse.data.data
        });
      }
    }

    // Export observations (medical records) if requested
    if (!resourceType || resourceType === 'Observation') {
      const records = await MedicalRecord.find(query).populate(['patient', 'doctor']);
      
      for (const record of records) {
        const observationResponse = await axios.get(
          `${req.protocol}://${req.get('host')}/api/fhir/observation/${record._id}`,
          {
            headers: { Authorization: req.headers.authorization }
          }
        );
        
        bundle.entry.push({
          resource: observationResponse.data.data
        });
      }
    }

    res.json({
      success: true,
      message: 'Bulk export completed successfully',
      data: bundle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error performing bulk export',
      error: error.message
    });
  }
});

// @desc    Get emergency patient data (public endpoint for QR code)
// @route   GET /api/fhir/emergency/:patientId
// @access  Public
router.get('/emergency/:patientId', async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.patientId })
      .populate('user');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get recent medical records for emergency context
    const recentRecords = await MedicalRecord.find({ patient: patient._id })
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .sort({ visitDate: -1 })
      .limit(3);

    // Emergency FHIR bundle
    const emergencyBundle = {
      resourceType: 'Bundle',
      id: `emergency-${patient.patientId}`,
      type: 'document',
      timestamp: new Date().toISOString(),
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: patient._id.toString(),
            identifier: [
              {
                value: patient.patientId
              }
            ],
            name: [
              {
                family: patient.user.profile.lastName,
                given: [patient.user.profile.firstName]
              }
            ],
            birthDate: patient.user.profile.dateOfBirth ? 
              patient.user.profile.dateOfBirth.toISOString().split('T')[0] : null,
            gender: patient.user.profile.gender,
            extension: [
              {
                url: 'http://health-track.local/allergies',
                valueString: patient.medicalHistory.allergies?.join(', ') || 'None known'
              },
              {
                url: 'http://health-track.local/chronic-conditions',
                valueString: patient.medicalHistory.chronicConditions?.join(', ') || 'None'
              },
              {
                url: 'http://health-track.local/current-medications',
                valueString: patient.medicalHistory.medications
                  ?.filter(med => !med.endDate || new Date(med.endDate) > new Date())
                  ?.map(med => `${med.name} (${med.dosage})`)
                  ?.join(', ') || 'None'
              }
            ]
          }
        }
      ]
    };

    // Add recent observations
    recentRecords.forEach(record => {
      if (record.vitals) {
        emergencyBundle.entry.push({
          resource: {
            resourceType: 'Observation',
            id: record._id.toString(),
            status: 'final',
            effectiveDateTime: record.visitDate.toISOString(),
            valueString: `BP: ${record.vitals.bloodPressure || 'N/A'}, HR: ${record.vitals.heartRate || 'N/A'}, Temp: ${record.vitals.temperature || 'N/A'}°C`
          }
        });
      }
    });

    res.json({
      success: true,
      data: emergencyBundle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching emergency data',
      error: error.message
    });
  }
});

module.exports = router;
