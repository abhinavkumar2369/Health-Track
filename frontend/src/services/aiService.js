/**
 * AI Service - Frontend Integration with ML Microservice
 * Provides methods to interact with AI-powered health features
 */

import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  .replace(/\/$/, '')
  .replace(/\/api$/, '');

// Create axios instance with default config
const aiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/ai`,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
aiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
aiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('AI Service Error:', error.response.data);
      throw new Error(error.response.data.message || 'AI service request failed');
    } else if (error.request) {
      // No response received
      console.error('AI Service Unavailable:', error.message);
      throw new Error('AI service is currently unavailable. Please try again later.');
    } else {
      // Request setup error
      console.error('Request Error:', error.message);
      throw error;
    }
  }
);

/**
 * AI Service API
 */
export const aiService = {
  /**
   * Check ML service health and availability
   * @returns {Promise<Object>} Health status
   */
  checkHealth: async () => {
    try {
      const response = await aiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  /**
   * Predict health risks based on patient data
   * @param {Object} data - Patient data
   * @param {string} data.patient_id - Patient ID
   * @param {number} data.age - Patient age
   * @param {string} data.gender - Patient gender (male/female/other)
   * @param {string[]} data.symptoms - List of symptoms
   * @param {Object} [data.vital_signs] - Optional vital signs
   * @param {string[]} [data.medical_history] - Optional medical history
   * @returns {Promise<Object>} Health prediction results
   */
  predictHealth: async (data) => {
    try {
      const response = await aiClient.post('/health-prediction', data);
      return response.data;
    } catch (error) {
      console.error('Health prediction failed:', error);
      throw error;
    }
  },

  /**
   * Get diagnostic assistance based on symptoms
   * @param {Object} data - Symptom data
   * @param {string} data.patient_id - Patient ID
   * @param {string[]} data.symptoms - List of symptoms
   * @param {string} [data.duration] - How long symptoms have persisted
   * @param {string} [data.severity] - Severity level (mild/moderate/severe)
   * @param {Object} [data.patient_info] - Additional patient information
   * @returns {Promise<Object>} Diagnostic suggestions
   */
  getDiagnosis: async (data) => {
    try {
      const response = await aiClient.post('/diagnostic', data);
      return response.data;
    } catch (error) {
      console.error('Diagnostic request failed:', error);
      throw error;
    }
  },

  /**
   * Analyze prescription for drug interactions and safety
   * @param {Object} data - Prescription data
   * @param {string} data.patient_id - Patient ID
   * @param {Object[]} data.medications - List of medications
   * @param {string[]} [data.allergies] - Known allergies
   * @param {string[]} [data.current_conditions] - Current medical conditions
   * @returns {Promise<Object>} Prescription analysis results
   */
  analyzePrescription: async (data) => {
    try {
      const response = await aiClient.post('/prescription-analysis', data);
      return response.data;
    } catch (error) {
      console.error('Prescription analysis failed:', error);
      throw error;
    }
  },

  /**
   * Analyze medical reports
   * @param {Object} data - Report data
   * @param {string} data.patient_id - Patient ID
   * @param {string} data.report_type - Type of report
   * @param {Object} data.report_data - Report data and values
   * @param {Object[]} [data.previous_reports] - Historical reports
   * @returns {Promise<Object>} Report analysis results
   */
  analyzeReport: async (data) => {
    try {
      const response = await aiClient.post('/report-analysis', data);
      return response.data;
    } catch (error) {
      console.error('Report analysis failed:', error);
      throw error;
    }
  },

  /**
   * Generate personalized health recommendations
   * @param {Object} data - Health data
   * @param {string} data.patient_id - Patient ID
   * @param {Object} data.current_health_status - Current health metrics
   * @param {string[]} [data.goals] - Health goals
   * @param {Object} [data.preferences] - Patient preferences
   * @returns {Promise<Object>} Health recommendations
   */
  getRecommendations: async (data) => {
    try {
      const response = await aiClient.post('/recommendations', data);
      return response.data;
    } catch (error) {
      console.error('Recommendations request failed:', error);
      throw error;
    }
  },

  /**
   * Batch summarize all medical records using CNN+Transformer
   * @param {Object} data - Documents data
   * @param {string} data.patient_id - Patient ID
   * @param {Object[]} data.documents - List of documents with metadata
   * @returns {Promise<Object>} Batch summarization results
   */
  summarizeAllRecords: async (data) => {
    try {
      const response = await aiClient.post('/summarize-all', data, {
        timeout: 120000 // 2 minutes for batch processing
      });
      return response.data;
    } catch (error) {
      console.error('Batch summarization failed:', error);
      throw error;
    }
  },

  /**
   * Generate combined PDF report from all summaries
   * @param {Object} data - Report data
   * @param {string} data.patient_id - Patient ID
   * @param {string} data.patient_name - Patient name
   * @param {Object[]} data.summaries - List of document summaries
   * @param {string} [data.overall_summary] - Overall health summary
   * @returns {Promise<Object>} PDF report response with base64 data
   */
  generateSummaryReport: async (data) => {
    try {
      const response = await aiClient.post('/generate-summary-report', data, {
        timeout: 60000
      });
      return response.data;
    } catch (error) {
      console.error('Summary report generation failed:', error);
      throw error;
    }
  },

  /**
   * Summarize a medical file using the Medical-Summarizer engine.
   * Supports .txt, .pdf, .docx, .json files.
   * Returns: summary, highlights, patient_info, red_flags, sections, urgency_level.
   *
   * @param {File}   file        - The file object to upload
   * @param {string} patientId   - Patient ID
   * @param {string} documentId  - Document / record ID
   * @param {Object} [options]   - Optional: { maxSentences, useBart }
   */
  summarizeMedicalFile: async (file, patientId, documentId, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_id', patientId);
    formData.append('document_id', documentId);
    if (options.maxSentences) formData.append('max_sentences', String(options.maxSentences));
    if (options.useBart !== undefined) formData.append('use_bart', String(options.useBart));

    try {
      const response = await aiClient.post('/summarize-medical-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      return response.data;
    } catch (error) {
      console.error('Medical file summarization failed:', error);
      throw error;
    }
  }
};

/**
 * Example Usage:
 * 
 * import { aiService } from './services/aiService';
 * 
 * // Check ML service health
 * const health = await aiService.checkHealth();
 * 
 * // Predict health risks
 * const prediction = await aiService.predictHealth({
 *   patient_id: 'P12345',
 *   age: 45,
 *   gender: 'male',
 *   symptoms: ['fever', 'cough', 'fatigue']
 * });
 * 
 * // Get diagnosis
 * const diagnosis = await aiService.getDiagnosis({
 *   patient_id: 'P12345',
 *   symptoms: ['headache', 'fever'],
 *   severity: 'moderate'
 * });
 * 
 * // Analyze prescription
 * const analysis = await aiService.analyzePrescription({
 *   patient_id: 'P12345',
 *   medications: [
 *     { name: 'Aspirin', dosage: '100mg', frequency: 'daily' }
 *   ],
 *   allergies: ['penicillin']
 * });
 * 
 * // Analyze report
 * const reportAnalysis = await aiService.analyzeReport({
 *   patient_id: 'P12345',
 *   report_type: 'blood_test',
 *   report_data: {
 *     hemoglobin: 14.5,
 *     wbc: 7500
 *   }
 * });
 * 
 * // Get recommendations
 * const recommendations = await aiService.getRecommendations({
 *   patient_id: 'P12345',
 *   current_health_status: {
 *     bmi: 24.5,
 *     activity_level: 'moderate'
 *   },
 *   goals: ['weight_loss', 'improve_fitness']
 * });
 */

export default aiService;
