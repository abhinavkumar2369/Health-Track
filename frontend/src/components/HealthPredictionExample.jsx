/**
 * Example React Component - AI Health Prediction
 * Demonstrates how to use the AI service in a React component
 */

import React, { useState } from 'react';
import { aiService } from '../services/aiService';

export default function HealthPredictionExample() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    age: '',
    gender: 'male',
    symptoms: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSymptomAdd = (symptom) => {
    if (symptom && !formData.symptoms.includes(symptom)) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptom]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Call AI service
      const response = await aiService.predictHealth({
        patient_id: formData.patient_id,
        age: parseInt(formData.age),
        gender: formData.gender,
        symptoms: formData.symptoms
      });
      
      setResult(response);
    } catch (err) {
      setError(err.message);
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="health-prediction-container">
      <h2>AI Health Risk Prediction</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Patient ID:</label>
          <input
            type="text"
            name="patient_id"
            value={formData.patient_id}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Age:</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            required
            min="0"
            max="150"
          />
        </div>

        <div className="form-group">
          <label>Gender:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Symptoms:</label>
          <div className="symptoms-list">
            {formData.symptoms.map((symptom, index) => (
              <span key={index} className="symptom-tag">
                {symptom}
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      symptoms: prev.symptoms.filter((_, i) => i !== index)
                    }));
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="common-symptoms">
            {['fever', 'cough', 'headache', 'fatigue', 'nausea'].map(symptom => (
              <button
                key={symptom}
                type="button"
                onClick={() => handleSymptomAdd(symptom)}
                disabled={formData.symptoms.includes(symptom)}
              >
                + {symptom}
              </button>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || formData.symptoms.length === 0}
          className="submit-btn"
        >
          {loading ? 'Analyzing...' : 'Predict Health Risk'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="results-container">
          <h3>Analysis Results</h3>
          
          <div className="risk-score">
            <h4>Overall Risk Score</h4>
            <div className="score-value" style={{
              color: result.risk_score > 0.7 ? 'red' : 
                     result.risk_score > 0.4 ? 'orange' : 'green'
            }}>
              {(result.risk_score * 100).toFixed(1)}%
            </div>
          </div>

          <div className="predictions">
            <h4>Predictions</h4>
            {result.predictions.map((pred, index) => (
              <div key={index} className="prediction-item">
                <strong>{pred.condition}</strong>
                <span>Probability: {(pred.probability * 100).toFixed(1)}%</span>
                <span>Severity: {pred.severity}</span>
              </div>
            ))}
          </div>

          <div className="recommendations">
            <h4>Recommendations</h4>
            <ul>
              {result.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>

          <div className="confidence">
            <small>Confidence: {(result.confidence * 100).toFixed(1)}%</small>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * CSS Styling (Add to your CSS file):
 * 
 * .health-prediction-container {
 *   max-width: 800px;
 *   margin: 0 auto;
 *   padding: 20px;
 * }
 * 
 * .form-group {
 *   margin-bottom: 20px;
 * }
 * 
 * .form-group label {
 *   display: block;
 *   margin-bottom: 5px;
 *   font-weight: bold;
 * }
 * 
 * .form-group input,
 * .form-group select {
 *   width: 100%;
 *   padding: 8px;
 *   border: 1px solid #ccc;
 *   border-radius: 4px;
 * }
 * 
 * .symptoms-list {
 *   display: flex;
 *   flex-wrap: wrap;
 *   gap: 8px;
 *   margin-bottom: 10px;
 * }
 * 
 * .symptom-tag {
 *   background: #007bff;
 *   color: white;
 *   padding: 5px 10px;
 *   border-radius: 15px;
 *   display: inline-flex;
 *   align-items: center;
 *   gap: 5px;
 * }
 * 
 * .common-symptoms {
 *   display: flex;
 *   gap: 8px;
 *   flex-wrap: wrap;
 * }
 * 
 * .submit-btn {
 *   background: #28a745;
 *   color: white;
 *   padding: 10px 20px;
 *   border: none;
 *   border-radius: 4px;
 *   cursor: pointer;
 * }
 * 
 * .submit-btn:disabled {
 *   background: #ccc;
 *   cursor: not-allowed;
 * }
 * 
 * .error-message {
 *   background: #f8d7da;
 *   color: #721c24;
 *   padding: 15px;
 *   border-radius: 4px;
 *   margin: 20px 0;
 * }
 * 
 * .results-container {
 *   margin-top: 30px;
 *   border-top: 2px solid #eee;
 *   padding-top: 20px;
 * }
 * 
 * .risk-score {
 *   text-align: center;
 *   margin: 20px 0;
 * }
 * 
 * .score-value {
 *   font-size: 48px;
 *   font-weight: bold;
 * }
 */
