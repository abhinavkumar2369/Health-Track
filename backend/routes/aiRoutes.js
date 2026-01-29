/**
 * Express.js Backend - AI Routes
 * Handles communication between frontend and ML microservice
 */

import express from "express";
import axios from "axios";

const router = express.Router();

// ML Microservice base URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000/api/v1";

// Middleware to handle ML service errors
const handleMLServiceError = (error, res) => {
  console.error("ML Service Error:", error.message);
  
  if (error.response) {
    // ML service returned an error response
    return res.status(error.response.status).json({
      success: false,
      error: "ML service error",
      message: error.response.data?.message || error.message
    });
  } else if (error.request) {
    // Request was made but no response received
    return res.status(503).json({
      success: false,
      error: "ML service unavailable",
      message: "Could not connect to ML service"
    });
  } else {
    // Something else went wrong
    return res.status(500).json({
      success: false,
      error: "Internal error",
      message: error.message
    });
  }
};

/**
 * @route   POST /ai/health-prediction
 * @desc    Predict health risks for a patient
 * @access  Protected (add auth middleware as needed)
 */
router.post("/health-prediction", async (req, res) => {
  try {
    const { patient_id, age, gender, symptoms, vital_signs, medical_history } = req.body;

    // Validate required fields
    if (!patient_id || !age || !gender || !symptoms || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Missing required fields: patient_id, age, gender, and symptoms are required"
      });
    }

    // Forward request to ML microservice
    const mlResponse = await axios.post(
      `${ML_SERVICE_URL}/health-prediction/predict`,
      {
        patient_id,
        age,
        gender,
        symptoms,
        vital_signs,
        medical_history
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Return ML service response to frontend
    res.json(mlResponse.data);

  } catch (error) {
    handleMLServiceError(error, res);
  }
});

/**
 * @route   POST /ai/diagnostic
 * @desc    Get diagnostic assistance based on symptoms
 * @access  Protected
 */
router.post("/diagnostic", async (req, res) => {
  try {
    const { patient_id, symptoms, duration, severity, patient_info } = req.body;

    // Validate required fields
    if (!patient_id || !symptoms || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Missing required fields: patient_id and symptoms are required"
      });
    }

    // Forward request to ML microservice
    const mlResponse = await axios.post(
      `${ML_SERVICE_URL}/diagnostic/diagnose`,
      {
        patient_id,
        symptoms,
        duration,
        severity,
        patient_info
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    res.json(mlResponse.data);

  } catch (error) {
    handleMLServiceError(error, res);
  }
});

/**
 * @route   POST /ai/prescription-analysis
 * @desc    Analyze prescription for interactions and safety
 * @access  Protected
 */
router.post("/prescription-analysis", async (req, res) => {
  try {
    const { patient_id, medications, allergies, current_conditions } = req.body;

    // Validate required fields
    if (!patient_id || !medications || medications.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Missing required fields: patient_id and medications are required"
      });
    }

    // Forward request to ML microservice
    const mlResponse = await axios.post(
      `${ML_SERVICE_URL}/prescription/analyze`,
      {
        patient_id,
        medications,
        allergies,
        current_conditions
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    res.json(mlResponse.data);

  } catch (error) {
    handleMLServiceError(error, res);
  }
});

/**
 * @route   POST /ai/report-analysis
 * @desc    Analyze medical reports
 * @access  Protected
 */
router.post("/report-analysis", async (req, res) => {
  try {
    const { patient_id, report_type, report_data, previous_reports } = req.body;

    // Validate required fields
    if (!patient_id || !report_type || !report_data) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Missing required fields: patient_id, report_type, and report_data are required"
      });
    }

    // Forward request to ML microservice
    const mlResponse = await axios.post(
      `${ML_SERVICE_URL}/report/analyze`,
      {
        patient_id,
        report_type,
        report_data,
        previous_reports
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    res.json(mlResponse.data);

  } catch (error) {
    handleMLServiceError(error, res);
  }
});

/**
 * @route   POST /ai/recommendations
 * @desc    Generate personalized health recommendations
 * @access  Protected
 */
router.post("/recommendations", async (req, res) => {
  try {
    const { patient_id, current_health_status, goals, preferences } = req.body;

    // Validate required fields
    if (!patient_id || !current_health_status) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Missing required fields: patient_id and current_health_status are required"
      });
    }

    // Forward request to ML microservice
    const mlResponse = await axios.post(
      `${ML_SERVICE_URL}/recommendations/generate`,
      {
        patient_id,
        current_health_status,
        goals,
        preferences
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    res.json(mlResponse.data);

  } catch (error) {
    handleMLServiceError(error, res);
  }
});

/**
 * @route   POST /ai/summarize-document
 * @desc    Summarize medical documents using AI
 * @access  Protected
 */
router.post("/summarize-document", async (req, res) => {
  try {
    const { patient_id, document_id, document_text, document_type, metadata } = req.body;

    // Validate required fields
    if (!patient_id || !document_id || !document_text || !document_type) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Missing required fields: patient_id, document_id, document_text, and document_type are required"
      });
    }

    // Forward request to ML microservice
    const mlResponse = await axios.post(
      `${ML_SERVICE_URL}/document/summarize`,
      {
        patient_id,
        document_id,
        document_text,
        document_type,
        metadata
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    res.json(mlResponse.data);

  } catch (error) {
    handleMLServiceError(error, res);
  }
});

/**
 * @route   GET /ai/health
 * @desc    Check ML service health
 * @access  Public
 */
router.get("/health", async (req, res) => {
  try {
    const mlResponse = await axios.get(`${ML_SERVICE_URL.replace('/api/v1', '')}/health`, {
      timeout: 5000
    });

    res.json({
      success: true,
      ml_service_status: mlResponse.data.status,
      ml_service_features: mlResponse.data.features,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(503).json({
      success: false,
      ml_service_status: "unavailable",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
