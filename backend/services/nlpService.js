const natural = require('natural');
const Tesseract = require('tesseract.js');

// OCR Service for converting physical records to digital
const convertImageToText = async (imagePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
      logger: m => console.log(m)
    });
    
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
};

// NLP Service for processing medical records
const processMedicalText = (text) => {
  try {
    // Tokenize the text
    const tokens = natural.WordTokenizer().tokenize(text.toLowerCase());
    
    // Remove stop words
    const stopWords = natural.stopwords;
    const filteredTokens = tokens.filter(token => !stopWords.includes(token));
    
    // Extract medical terms using simple pattern matching
    const medicalTerms = {
      symptoms: [],
      medications: [],
      conditions: [],
      vitals: {}
    };

    // Common medical patterns
    const symptomPatterns = [
      'pain', 'ache', 'fever', 'cough', 'headache', 'nausea', 'vomiting',
      'diarrhea', 'constipation', 'fatigue', 'weakness', 'dizziness'
    ];
    
    const medicationPatterns = [
      'tablet', 'capsule', 'syrup', 'injection', 'mg', 'ml', 'daily',
      'twice', 'thrice', 'morning', 'evening', 'night'
    ];

    const conditionPatterns = [
      'diabetes', 'hypertension', 'asthma', 'arthritis', 'migraine',
      'depression', 'anxiety', 'infection', 'allergy'
    ];

    // Extract symptoms
    filteredTokens.forEach(token => {
      if (symptomPatterns.some(pattern => token.includes(pattern))) {
        medicalTerms.symptoms.push(token);
      }
    });

    // Extract medications (look for patterns around medication keywords)
    for (let i = 0; i < tokens.length; i++) {
      if (medicationPatterns.some(pattern => tokens[i].includes(pattern))) {
        // Look for medication name in surrounding tokens
        const start = Math.max(0, i - 2);
        const end = Math.min(tokens.length, i + 3);
        const context = tokens.slice(start, end).join(' ');
        medicalTerms.medications.push(context);
      }
    }

    // Extract conditions
    filteredTokens.forEach(token => {
      if (conditionPatterns.some(pattern => token.includes(pattern))) {
        medicalTerms.conditions.push(token);
      }
    });

    // Extract vital signs using regex patterns
    const vitalPatterns = {
      bloodPressure: /(\d{2,3}\/\d{2,3})/g,
      heartRate: /(\d{2,3})\s*bpm|heart\s*rate[:\s]*(\d{2,3})/gi,
      temperature: /(\d{2,3}(?:\.\d)?)\s*°?[cf]|temp[:\s]*(\d{2,3}(?:\.\d)?)/gi,
      weight: /(\d{2,3}(?:\.\d)?)\s*kg|weight[:\s]*(\d{2,3}(?:\.\d)?)/gi
    };

    Object.keys(vitalPatterns).forEach(vital => {
      const matches = text.match(vitalPatterns[vital]);
      if (matches) {
        medicalTerms.vitals[vital] = matches[0];
      }
    });

    // Calculate sentiment (for patient notes)
    const sentiment = natural.SentimentAnalyzer.getSentiment(
      filteredTokens.map(token => natural.PorterStemmer.stem(token))
    );

    return {
      extractedTerms: medicalTerms,
      sentiment: sentiment > 0 ? 'positive' : sentiment < 0 ? 'negative' : 'neutral',
      processedText: {
        originalLength: text.length,
        tokenCount: tokens.length,
        uniqueTokens: [...new Set(filteredTokens)].length
      }
    };
  } catch (error) {
    console.error('NLP Processing Error:', error);
    throw new Error('Failed to process medical text');
  }
};

// Extract structured data from free text medical records
const extractMedicalData = (freeText) => {
  try {
    const processed = processMedicalText(freeText);
    
    // Structure the data for database storage
    const structuredData = {
      chiefComplaint: '', // To be filled manually or extracted based on context
      symptoms: [...new Set(processed.extractedTerms.symptoms)],
      diagnosis: {
        primary: '', // To be filled by doctor
        secondary: processed.extractedTerms.conditions
      },
      prescription: processed.extractedTerms.medications.map(med => ({
        medication: med,
        dosage: '', // To be extracted or filled manually
        frequency: '', // To be extracted or filled manually
        duration: '', // To be extracted or filled manually
        instructions: ''
      })),
      vitals: processed.extractedTerms.vitals,
      notes: freeText,
      extractionMetadata: {
        method: 'nlp',
        confidence: processed.sentiment === 'neutral' ? 'medium' : 'low',
        extractedAt: new Date(),
        requiresReview: true
      }
    };

    return structuredData;
  } catch (error) {
    console.error('Medical Data Extraction Error:', error);
    throw new Error('Failed to extract medical data');
  }
};

// Generate summary report from multiple medical records
const generateMedicalSummary = (medicalRecords) => {
  try {
    const summary = {
      totalRecords: medicalRecords.length,
      dateRange: {
        from: medicalRecords.length > 0 ? 
          new Date(Math.min(...medicalRecords.map(r => new Date(r.visitDate)))) : null,
        to: medicalRecords.length > 0 ? 
          new Date(Math.max(...medicalRecords.map(r => new Date(r.visitDate)))) : null
      },
      commonSymptoms: {},
      frequentDiagnoses: {},
      prescriptionPatterns: {},
      vitalsTrends: {
        bloodPressure: [],
        heartRate: [],
        temperature: [],
        weight: []
      }
    };

    // Analyze patterns across records
    medicalRecords.forEach(record => {
      // Count symptoms
      if (record.symptoms) {
        record.symptoms.forEach(symptom => {
          summary.commonSymptoms[symptom] = (summary.commonSymptoms[symptom] || 0) + 1;
        });
      }

      // Count diagnoses
      if (record.diagnosis?.primary) {
        const diagnosis = record.diagnosis.primary;
        summary.frequentDiagnoses[diagnosis] = (summary.frequentDiagnoses[diagnosis] || 0) + 1;
      }

      // Analyze prescriptions
      if (record.prescription) {
        record.prescription.forEach(med => {
          const medication = med.medication || med.name;
          if (medication) {
            summary.prescriptionPatterns[medication] = 
              (summary.prescriptionPatterns[medication] || 0) + 1;
          }
        });
      }

      // Track vitals trends
      if (record.vitals) {
        ['bloodPressure', 'heartRate', 'temperature', 'weight'].forEach(vital => {
          if (record.vitals[vital]) {
            summary.vitalsTrends[vital].push({
              date: record.visitDate,
              value: record.vitals[vital]
            });
          }
        });
      }
    });

    // Sort by frequency
    summary.commonSymptoms = Object.fromEntries(
      Object.entries(summary.commonSymptoms).sort(([,a], [,b]) => b - a)
    );
    
    summary.frequentDiagnoses = Object.fromEntries(
      Object.entries(summary.frequentDiagnoses).sort(([,a], [,b]) => b - a)
    );
    
    summary.prescriptionPatterns = Object.fromEntries(
      Object.entries(summary.prescriptionPatterns).sort(([,a], [,b]) => b - a)
    );

    // Generate insights
    summary.insights = [];
    
    if (Object.keys(summary.commonSymptoms).length > 0) {
      const mostCommonSymptom = Object.keys(summary.commonSymptoms)[0];
      summary.insights.push(`Most reported symptom: ${mostCommonSymptom}`);
    }
    
    if (Object.keys(summary.frequentDiagnoses).length > 0) {
      const mostFrequentDiagnosis = Object.keys(summary.frequentDiagnoses)[0];
      summary.insights.push(`Most frequent diagnosis: ${mostFrequentDiagnosis}`);
    }

    // Check for concerning patterns
    const recentRecords = medicalRecords
      .filter(r => new Date(r.visitDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
      .length;
    
    if (recentRecords > 5) {
      summary.insights.push('High frequency of recent visits - may require attention');
    }

    return summary;
  } catch (error) {
    console.error('Summary Generation Error:', error);
    throw new Error('Failed to generate medical summary');
  }
};

module.exports = {
  convertImageToText,
  processMedicalText,
  extractMedicalData,
  generateMedicalSummary
};
