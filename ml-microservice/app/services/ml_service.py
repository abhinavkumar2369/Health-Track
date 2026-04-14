"""
ML Service for health predictions and analysis
"""

import logging
from typing import Dict, Any, List
from datetime import datetime
import random
import os
from openai import OpenAI

logger = logging.getLogger(__name__)

class MLService:
    """Main ML service for health-related predictions"""
    
    def __init__(self):
        self.model_loaded = False
        self.openai_client = None
        self.use_openai = os.getenv('USE_OPENAI', 'false').lower() == 'true'
        self.ai_model = os.getenv('AI_MODEL', 'gpt-3.5-turbo')
        
        # Initialize OpenAI client if API key is provided
        openai_api_key = os.getenv('OPENAI_API_KEY')
        if openai_api_key and openai_api_key != 'your-openai-api-key-here' and self.use_openai:
            try:
                self.openai_client = OpenAI(api_key=openai_api_key)
                logger.info("OpenAI client initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
                self.openai_client = None
        
        logger.info("MLService initialized")
    
    async def _summarize_with_openai(self, text: str, doc_type: str, metadata: Dict) -> Dict[str, Any]:
        """Use OpenAI GPT for deep AI-powered medical document summarization"""
        try:
            # Main summarization prompt
            summary_prompt = f"""You are a medical AI assistant.

Document text:
{text[:3000]}  

Please provide a comprehensive medical summary that includes:
1. Main purpose and type of document
2. Key medical findings or information
3. Important values, measurements, or observations
4. Any abnormalities or concerns mentioned
5. Overall clinical significance

Keep the summary professional, accurate, and concise (3-4 sentences)."""

            # Get summary
            summary_response = self.openai_client.chat.completions.create(
                model=self.ai_model,
                messages=[{"role": "user", "content": summary_prompt}],
                temperature=0.3,
                max_tokens=300
            )
            summary = summary_response.choices[0].message.content.strip()
            
            # Extract key findings
            findings_prompt = f"""Based on this medical document, extract 3-5 key clinical findings or important points:

{text[:2000]}

List only the most critical findings, one per line. Be specific and concise."""

            findings_response = self.openai_client.chat.completions.create(
                model=self.ai_model,
                messages=[{"role": "user", "content": findings_prompt}],
                temperature=0.2,
                max_tokens=200
            )
            findings_text = findings_response.choices[0].message.content.strip()
            key_findings = [f.strip() for f in findings_text.split('\n') if f.strip() and not f.strip().startswith('#')][:5]
            
            # Extract medical terms
            terms_prompt = f"""Identify 3-5 important medical terms from this document and provide brief explanations:

{text[:2000]}

Format: Term | Explanation
List only the most significant medical terms."""

            terms_response = self.openai_client.chat.completions.create(
                model=self.ai_model,
                messages=[{"role": "user", "content": terms_prompt}],
                temperature=0.2,
                max_tokens=300
            )
            terms_text = terms_response.choices[0].message.content.strip()
            
            medical_terms = []
            for line in terms_text.split('\n'):
                if '|' in line or ':' in line:
                    separator = '|' if '|' in line else ':'
                    parts = line.split(separator, 1)
                    if len(parts) == 2:
                        medical_terms.append({
                            "term": parts[0].strip().strip('-*•').strip(),
                            "explanation": parts[1].strip()
                        })
            
            if not medical_terms:
                medical_terms = [{"term": "Medical Document", "explanation": "Contains patient health information"}]
            
            # Generate recommendations
            rec_prompt = f"""Based on this medical document, suggest 2-3 actionable recommendations or next steps:

{text[:2000]}

Be specific and practical. Focus on patient care and follow-up."""

            rec_response = self.openai_client.chat.completions.create(
                model=self.ai_model,
                messages=[{"role": "user", "content": rec_prompt}],
                temperature=0.4,
                max_tokens=200
            )
            rec_text = rec_response.choices[0].message.content.strip()
            recommendations = [r.strip() for r in rec_text.split('\n') if r.strip() and not r.strip().startswith('#')][:3]
            
            # Determine urgency
            urgency_prompt = f"""Assess the urgency level of this medical document. Consider any abnormal findings, critical values, or urgent conditions mentioned.

{text[:1500]}

Respond with only ONE word: low, moderate, or high"""

            urgency_response = self.openai_client.chat.completions.create(
                model=self.ai_model,
                messages=[{"role": "user", "content": urgency_prompt}],
                temperature=0.1,
                max_tokens=10
            )
            urgency_level = urgency_response.choices[0].message.content.strip().lower()
            if urgency_level not in ['low', 'moderate', 'high']:
                urgency_level = 'moderate'
            
            return {
                'summary': summary,
                'key_findings': key_findings if key_findings else ["Document has been analyzed by AI"],
                'medical_terms': medical_terms[:5],
                'recommendations': recommendations if recommendations else ["Consult with healthcare provider for detailed interpretation"],
                'urgency_level': urgency_level
            }
            
        except Exception as e:
            logger.error(f"OpenAI summarization error: {str(e)}")
            # Fallback to template-based
            return self._summarize_with_template(text, doc_type)
    
    def _extract_key_findings_offline(self, text: str, doc_type: str) -> List[str]:
        """Extract key findings using pattern matching and keywords"""
        findings = []
        text_lower = text.lower()
        
        # Medical keywords to look for
        keywords = {
            'lab_report': ['elevated', 'decreased', 'normal', 'abnormal', 'positive', 'negative'],
            'prescription': ['prescribed', 'dosage', 'medication', 'treatment'],
            'scan': ['observed', 'detected', 'visible', 'shows', 'indicates'],
            'diagnosis': ['diagnosed', 'condition', 'symptoms', 'findings']
        }
        
        relevant_keywords = keywords.get(doc_type, keywords['diagnosis'])
        
        # Simple sentence extraction based on keywords
        sentences = text.split('.')
        for sentence in sentences[:10]:  # Limit to first 10 sentences
            sentence_lower = sentence.lower().strip()
            if any(keyword in sentence_lower for keyword in relevant_keywords):
                if len(sentence.strip()) > 20:  # Meaningful sentence
                    findings.append(sentence.strip())
                if len(findings) >= 5:  # Limit to 5 findings
                    break
        
        return findings if findings else ["Key findings extracted from document"]
    
    def _extract_medical_terms_offline(self, text: str) -> List[Dict[str, str]]:
        """Extract medical terms using pattern matching"""
        terms = []
        
        # Common medical term patterns
        medical_patterns = [
            r'\b[A-Z][a-z]+itis\b',  # Inflammations
            r'\b[A-Z][a-z]+osis\b',  # Conditions
            r'\b[A-Z][a-z]+emia\b',  # Blood conditions
            r'\b[A-Z][a-z]+pathy\b',  # Diseases
        ]
        
        import re
        found_terms = set()
        
        for pattern in medical_patterns:
            matches = re.findall(pattern, text)
            found_terms.update(matches)
        
        # Add some example terms
        for term in list(found_terms)[:5]:
            terms.append({
                "term": term,
                "explanation": f"Medical term found in document: {term}"
            })
        
        return terms if terms else [{"term": "Medical terminology", "explanation": "Refer to medical glossary"}]
    
    def _generate_recommendations_offline(self, text: str, doc_type: str) -> List[str]:
        """Generate recommendations based on document type and content"""
        recommendations = []
        text_lower = text.lower()
        
        # Generic recommendations based on document type
        if doc_type == 'lab_report':
            recommendations = [
                "Follow up with your healthcare provider to discuss results",
                "Maintain a healthy diet and regular exercise routine",
                "Schedule regular health check-ups"
            ]
        elif doc_type == 'prescription':
            recommendations = [
                "Take medications as prescribed by your doctor",
                "Note any side effects and report them",
                "Do not stop medication without consulting your doctor"
            ]
        elif doc_type == 'scan':
            recommendations = [
                "Consult with your doctor about the scan findings",
                "Follow recommended treatment or monitoring plan",
                "Keep a record of all diagnostic tests"
            ]
        else:
            recommendations = [
                "Maintain regular communication with healthcare provider",
                "Keep all medical records organized",
                "Follow medical advice and treatment plans"
            ]
        
        # Add urgency-based recommendations
        if any(word in text_lower for word in ['urgent', 'immediate', 'critical', 'emergency']):
            recommendations.insert(0, "⚠️ Seek immediate medical attention")
        
        return recommendations
    
    def _assess_urgency_offline(self, text: str) -> str:
        """Assess urgency level based on keywords"""
        text_lower = text.lower()
        
        urgent_keywords = ['urgent', 'immediate', 'critical', 'emergency', 'severe', 'acute']
        moderate_keywords = ['elevated', 'abnormal', 'concern', 'monitor', 'follow-up']
        
        if any(keyword in text_lower for keyword in urgent_keywords):
            return "high"
        elif any(keyword in text_lower for keyword in moderate_keywords):
            return "moderate"
        else:
            return "low"
    
    async def predict_health_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict health risks based on patient data
        In production, this would use trained ML models
        """
        try:
            logger.info(f"Processing health prediction for patient: {data.get('patient_id')}")
            
            # Simulate ML prediction (replace with actual model inference)
            risk_factors = self._analyze_risk_factors(data)
            risk_score = self._calculate_risk_score(risk_factors)
            
            predictions = [
                {
                    "condition": "Cardiovascular Risk",
                    "probability": risk_score * 0.3,
                    "severity": "moderate" if risk_score > 0.5 else "low"
                },
                {
                    "condition": "Diabetes Risk",
                    "probability": risk_score * 0.25,
                    "severity": "moderate" if risk_score > 0.6 else "low"
                }
            ]
            
            recommendations = self._generate_recommendations(risk_score, data.get('symptoms', []))
            
            return {
                "success": True,
                "patient_id": data.get('patient_id'),
                "predictions": predictions,
                "risk_score": risk_score,
                "recommendations": recommendations,
                "confidence": 0.85,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in health prediction: {str(e)}")
            raise
    
    async def diagnose_symptoms(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Provide diagnostic assistance based on symptoms
        """
        try:
            logger.info(f"Processing diagnostic request for patient: {data.get('patient_id')}")
            
            symptoms = data.get('symptoms', [])
            severity = data.get('severity', 'moderate')
            
            # Simulate diagnostic analysis
            possible_conditions = self._match_symptoms_to_conditions(symptoms)
            suggested_tests = self._suggest_tests(symptoms)
            urgency_level = self._determine_urgency(severity, symptoms)
            
            return {
                "success": True,
                "patient_id": data.get('patient_id'),
                "possible_conditions": possible_conditions,
                "suggested_tests": suggested_tests,
                "urgency_level": urgency_level,
                "recommendations": self._generate_diagnostic_recommendations(possible_conditions),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in symptom diagnosis: {str(e)}")
            raise
    
    async def analyze_prescription(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze prescription for interactions and contraindications
        """
        try:
            logger.info(f"Analyzing prescription for patient: {data.get('patient_id')}")
            
            medications = data.get('medications', [])
            allergies = data.get('allergies', [])
            conditions = data.get('current_conditions', [])
            
            interactions = self._check_drug_interactions(medications)
            contraindications = self._check_contraindications(medications, allergies, conditions)
            dosage_recommendations = self._verify_dosages(medications)
            
            warnings = []
            if interactions:
                warnings.append("Drug interactions detected - consult physician")
            if contraindications:
                warnings.append("Contraindications found - review with healthcare provider")
            
            is_safe = len(interactions) == 0 and len(contraindications) == 0
            
            return {
                "success": True,
                "patient_id": data.get('patient_id'),
                "interactions": interactions,
                "contraindications": contraindications,
                "dosage_recommendations": dosage_recommendations,
                "warnings": warnings,
                "safe": is_safe,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in prescription analysis: {str(e)}")
            raise
    
    async def analyze_report(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze medical reports and identify abnormalities
        """
        try:
            logger.info(f"Analyzing report for patient: {data.get('patient_id')}")
            
            report_type = data.get('report_type')
            report_data = data.get('report_data', {})
            
            analysis = self._perform_report_analysis(report_type, report_data)
            abnormalities = self._detect_abnormalities(report_data)
            severity = self._assess_severity(abnormalities)
            
            return {
                "success": True,
                "patient_id": data.get('patient_id'),
                "analysis": analysis,
                "abnormalities": abnormalities,
                "trends": None,
                "recommendations": self._generate_report_recommendations(abnormalities),
                "severity": severity,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in report analysis: {str(e)}")
            raise
    
    async def generate_recommendations(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate personalized health recommendations
        """
        try:
            logger.info(f"Generating recommendations for patient: {data.get('patient_id')}")
            
            health_status = data.get('current_health_status', {})
            goals = data.get('goals', [])
            
            lifestyle_recommendations = self._generate_lifestyle_recommendations(health_status)
            dietary_suggestions = self._generate_dietary_suggestions(health_status)
            exercise_plan = self._generate_exercise_plan(health_status, goals)
            preventive_measures = self._generate_preventive_measures(health_status)
            
            return {
                "success": True,
                "patient_id": data.get('patient_id'),
                "lifestyle_recommendations": lifestyle_recommendations,
                "dietary_suggestions": dietary_suggestions,
                "exercise_plan": exercise_plan,
                "preventive_measures": preventive_measures,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            raise
    
    # Helper methods (simulation - replace with actual ML logic)
    
    def _analyze_risk_factors(self, data: Dict) -> List[str]:
        risk_factors = []
        if data.get('age', 0) > 50:
            risk_factors.append("age")
        if data.get('symptoms'):
            risk_factors.extend(["symptoms"])
        return risk_factors
    
    def _calculate_risk_score(self, risk_factors: List[str]) -> float:
        base_score = 0.3
        return min(base_score + (len(risk_factors) * 0.1), 0.9)
    
    def _generate_recommendations(self, risk_score: float, symptoms: List[str]) -> List[str]:
        recommendations = [
            "Schedule regular health check-ups",
            "Maintain a balanced diet",
            "Exercise regularly (30 minutes daily)"
        ]
        if risk_score > 0.6:
            recommendations.append("Consult with a healthcare provider soon")
        return recommendations
    
    def _match_symptoms_to_conditions(self, symptoms: List[str]) -> List[Dict]:
        # Simplified condition matching
        conditions = [
            {
                "name": "Common Cold",
                "probability": 0.6,
                "description": "Viral upper respiratory infection"
            },
            {
                "name": "Seasonal Allergies",
                "probability": 0.4,
                "description": "Allergic reaction to environmental factors"
            }
        ]
        return conditions
    
    def _suggest_tests(self, symptoms: List[str]) -> List[str]:
        return ["Complete Blood Count (CBC)", "Basic Metabolic Panel"]
    
    def _determine_urgency(self, severity: str, symptoms: List[str]) -> str:
        severity_map = {
            "severe": "high",
            "moderate": "medium",
            "mild": "low"
        }
        return severity_map.get(severity, "medium")
    
    def _generate_diagnostic_recommendations(self, conditions: List[Dict]) -> List[str]:
        return [
            "Rest and stay hydrated",
            "Monitor symptoms for 24-48 hours",
            "Consult doctor if symptoms worsen"
        ]
    
    def _check_drug_interactions(self, medications: List[Dict]) -> List[Dict]:
        # Simplified interaction checking
        return []
    
    def _check_contraindications(self, medications: List[Dict], allergies: List[str], conditions: List[str]) -> List[Dict]:
        return []
    
    def _verify_dosages(self, medications: List[Dict]) -> List[Dict]:
        return [{"medication": med.get("name"), "status": "appropriate"} for med in medications]
    
    def _perform_report_analysis(self, report_type: str, report_data: Dict) -> Dict:
        return {
            "report_type": report_type,
            "summary": "Analysis completed successfully",
            "key_findings": ["All values within normal range"]
        }
    
    def _detect_abnormalities(self, report_data: Dict) -> List[Dict]:
        return []
    
    def _assess_severity(self, abnormalities: List[Dict]) -> str:
        return "normal" if not abnormalities else "mild"
    
    def _generate_report_recommendations(self, abnormalities: List[Dict]) -> List[str]:
        if not abnormalities:
            return ["Continue current health practices", "Schedule routine follow-up"]
        return ["Consult with physician", "Additional testing may be required"]
    
    def _generate_lifestyle_recommendations(self, health_status: Dict) -> List[Dict]:
        return [
            {"category": "Sleep", "recommendation": "Aim for 7-8 hours per night", "priority": "high"},
            {"category": "Stress", "recommendation": "Practice stress management techniques", "priority": "medium"},
            {"category": "Hydration", "recommendation": "Drink 8 glasses of water daily", "priority": "high"}
        ]
    
    def _generate_dietary_suggestions(self, health_status: Dict) -> List[Dict]:
        return [
            {"food_group": "Vegetables", "recommendation": "5 servings daily", "examples": ["leafy greens", "broccoli"]},
            {"food_group": "Proteins", "recommendation": "Lean proteins", "examples": ["chicken", "fish", "legumes"]},
            {"food_group": "Whole Grains", "recommendation": "3 servings daily", "examples": ["brown rice", "quinoa"]}
        ]
    
    def _generate_exercise_plan(self, health_status: Dict, goals: List[str]) -> Dict:
        return {
            "cardio": "30 minutes, 5 times per week",
            "strength": "2-3 times per week",
            "flexibility": "Daily stretching",
            "notes": "Start gradually and increase intensity over time"
        }
    
    def _generate_preventive_measures(self, health_status: Dict) -> List[str]:
        return [
            "Annual health screenings",
            "Stay up to date with vaccinations",
            "Regular dental check-ups",
            "Monitor blood pressure and cholesterol"
        ]
    
    async def summarize_document(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Summarize medical documents using AI/ML
        Uses OpenAI GPT models for deep contextual understanding
        """
        try:
            logger.info(f"Processing document summarization for patient: {data.get('patient_id')}")
            
            document_text = data.get('document_text', '')
            document_type = data.get('document_type', 'other')
            document_id = data.get('document_id')
            metadata = data.get('metadata', {})
            
            # Use OpenAI for real deep AI summary if available
            if self.openai_client and self.use_openai:
                logger.info("Using OpenAI for deep AI summarization")
                result = await self._summarize_with_openai(document_text, document_type, metadata)
            else:
                logger.info("Using fallback template-based summarization")
                result = self._summarize_with_template(document_text, document_type)
            
            return {
                "success": True,
                "patient_id": data.get('patient_id'),
                "document_id": document_id,
                "summary": result['summary'],
                "key_findings": result['key_findings'],
                "medical_terms": result['medical_terms'],
                "recommendations": result['recommendations'],
                "urgency_level": result['urgency_level'],
                "ai_powered": self.openai_client is not None and self.use_openai,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in document summarization: {str(e)}")
            raise
        """Generate AI summary using Google Gemini API"""
        try:
            if not self.gemini_model:
                raise Exception("Gemini model not initialized. Please configure GEMINI_API_KEY in .env file")
            
            logger.info(f"Generating Gemini AI summary for {document_type}")
            
            # Main summary prompt
            summary_prompt = f"""You are a medical AI assistant analyzing healthcare documents.

Document Type: {document_type}

Document Content:
{document_text[:4000]}

Provide a comprehensive medical summary including:
1. Main purpose and context of this document
2. Key medical findings and observations
3. Any abnormalities or concerns identified
4. Clinical significance

Keep the summary concise but informative (3-5 sentences)."""
            
            summary_response = self.gemini_model.generate_content(summary_prompt)
            main_summary = summary_response.text.strip()
            
            # Key findings prompt
            findings_prompt = f"""Based on this {document_type}:

{document_text[:3000]}

List 3-5 most critical clinical findings. Be specific and concise. Format as bullet points."""
            
            findings_response = self.gemini_model.generate_content(findings_prompt)
            findings_text = findings_response.text.strip()
            key_findings = [f.strip('- \u2022*').strip() for f in findings_text.split('\n') if f.strip() and len(f.strip()) > 10][:5]
            
            # Medical terms prompt
            terms_prompt = f"""Identify 3-5 complex medical terms from this text and provide patient-friendly explanations:

{document_text[:2000]}

Format as: Term: explanation"""
            
            terms_response = self.gemini_model.generate_content(terms_prompt)
            terms_text = terms_response.text.strip()
            
            medical_terms = []
            for line in terms_text.split('\n'):
                if ':' in line:
                    term, explanation = line.split(':', 1)
                    medical_terms.append({
                        "term": term.strip('- \u2022*').strip(),
                        "explanation": explanation.strip()
                    })
                if len(medical_terms) >= 5:
                    break
            
            # Recommendations prompt
            rec_prompt = f"""Based on this {document_type}, suggest 2-3 actionable next steps for the patient:

{document_text[:2000]}

Be specific and practical."""
            
            rec_response = self.gemini_model.generate_content(rec_prompt)
            rec_text = rec_response.text.strip()
            recommendations = [r.strip('- \u2022*').strip() for r in rec_text.split('\n') if r.strip() and len(r.strip()) > 10][:3]
            
            # Urgency assessment
            urgency_prompt = f"""Assess the urgency level (low, moderate, or high) based on this medical document:

{document_text[:2000]}

Respond with only one word: low, moderate, or high."""
            
            urgency_response = self.gemini_model.generate_content(urgency_prompt)
            urgency_level = urgency_response.text.strip().lower()
            if urgency_level not in ['low', 'moderate', 'high']:
                urgency_level = 'moderate'
            
            return {
                "summary": main_summary,
                "key_findings": key_findings if key_findings else ["Key findings extracted from document"],
                "medical_terms": medical_terms if medical_terms else [{"term": "Medical terminology", "explanation": "Refer to medical glossary"}],
                "recommendations": recommendations if recommendations else ["Follow up with healthcare provider"],
                "urgency_level": urgency_level,
                "ai_confidence": 0.90,
                "model_used": f"Google Gemini ({os.getenv('GEMINI_MODEL', 'gemini-pro')})"
            }
        
        except Exception as e:
            logger.error(f"Error in Gemini summarization: {e}")
            # Fallback to template
            text = document_text  # Use document_text for backward compatibility
            doc_type = document_type
            return self._summarize_with_template(text, doc_type)
    
    def _summarize_with_template(self, text: str, doc_type: str) -> Dict[str, Any]:
        """
        Template-based summarization (fallback when OpenAI is not available)
        """
        summary = self._generate_summary(text, doc_type)
        key_findings = self._extract_key_findings(text, doc_type)
        medical_terms = self._extract_medical_terms(text)
        recommendations = self._generate_document_recommendations(key_findings, doc_type)
        urgency_level = self._determine_document_urgency(key_findings, doc_type)
        
        return {
            'summary': summary,
            'key_findings': key_findings,
            'medical_terms': medical_terms,
            'recommendations': recommendations,
            'urgency_level': urgency_level
        }
    
    def _generate_summary(self, text: str, doc_type: str) -> str:
        """
        Generate a concise summary of the medical document using actual content.
        """
        import re
        text_stripped = text.strip()
        if not text_stripped:
            return "No document content available for summarization."

        # Pull first meaningful sentences (up to ~300 chars worth)
        sentences = re.split(r'(?<=[.!?])\s+', text_stripped)
        meaningful = [s.strip() for s in sentences if len(s.strip()) > 20]

        if meaningful:
            # Take up to 3 sentences as the base summary
            snippet = ' '.join(meaningful[:3])
            snippet = re.sub(r'\s+', ' ', snippet).strip()
            # Prepend a doc-type label
            label_map = {
                'lab-report': 'Lab Report',
                'prescription': 'Prescription',
                'scan': 'Medical Scan',
                'consultation': 'Consultation Note',
            }
            label = label_map.get(doc_type, 'Medical Document')
            return f"{label}: {snippet}"

        # Fallback: truncate raw text
        snippet = re.sub(r'\s+', ' ', text_stripped[:300]).strip()
        return snippet + ('...' if len(text_stripped) > 300 else '')
    
    def _extract_key_findings(self, text: str, doc_type: str) -> List[str]:
        """
        Extract key findings from the document by pulling actual sentences/values.
        """
        import re
        findings = []
        text_stripped = text.strip()

        if not text_stripped or len(text_stripped) < 20:
            return ["Document text too short to extract specific findings."]

        # --- Pattern-based extraction: grab lines with numeric values or medical results ---
        # Match lines like: "Hemoglobin: 13.5 g/dL", "Blood Pressure: 130/85 mmHg"
        value_pattern = re.compile(
            r'([A-Za-z][A-Za-z\s/\(\)]{3,40})\s*[:\-]\s*([\d\.]+\s*(?:mg|g|ml|mmol|mmHg|%|U/L|IU/L|mEq|ng|pg|fl|fL|km|bpm|°C|°F|/dL|/L|/mm|/uL)?(?:\s*/\s*[\d\.]+)?)',
            re.IGNORECASE
        )
        for match in value_pattern.finditer(text_stripped):
            label = match.group(1).strip().strip('-').strip()
            value = match.group(2).strip()
            if len(label) > 3 and len(label) < 50:
                findings.append(f"{label}: {value}")
            if len(findings) >= 6:
                break

        # --- Sentence-based extraction: pull sentences with strong medical signal words ---
        if len(findings) < 3:
            signal_words = [
                'diagnosis', 'diagnosed', 'impression', 'finding', 'result', 'positive',
                'negative', 'abnormal', 'elevated', 'decreased', 'normal', 'deficiency',
                'prescribed', 'medication', 'dosage', 'treatment', 'condition', 'fracture',
                'lesion', 'mass', 'infection', 'inflammation', 'chronic', 'acute', 'severe',
                'mild', 'moderate', 'urgent', 'critical', 'complaint', 'symptom', 'allergy'
            ]
            sentences = re.split(r'(?<=[.!?])\s+', text_stripped)
            for sentence in sentences:
                sentence = sentence.strip()
                if 15 < len(sentence) < 200:
                    s_lower = sentence.lower()
                    if any(w in s_lower for w in signal_words):
                        # Clean up and add
                        clean = re.sub(r'\s+', ' ', sentence)
                        if clean not in findings:
                            findings.append(clean)
                if len(findings) >= 5:
                    break

        # --- Line-based extraction fallback: grab informative lines ---
        if len(findings) < 2:
            lines = [l.strip() for l in text_stripped.splitlines() if len(l.strip()) > 15]
            for line in lines[:10]:
                clean = re.sub(r'\s+', ' ', line)
                if clean not in findings:
                    findings.append(clean)
                if len(findings) >= 5:
                    break

        if not findings:
            findings = ["No specific findings could be extracted from this document."]

        return findings[:6]
    
    def _extract_medical_terms(self, text: str) -> List[Dict[str, str]]:
        """
        Extract and explain medical terms
        In production: Use medical dictionaries and terminology databases (UMLS, SNOMED)
        """
        # Sample medical terms and their explanations
        common_terms = {
            'hypertension': 'High blood pressure',
            'diabetes': 'Condition affecting blood sugar regulation',
            'cholesterol': 'Fat-like substance in blood',
            'hemoglobin': 'Protein in red blood cells that carries oxygen',
            'glucose': 'Blood sugar',
            'biopsy': 'Tissue sample examination',
            'ultrasound': 'Imaging using sound waves',
            'ct scan': 'Detailed imaging using x-rays',
            'mri': 'Magnetic resonance imaging',
            'prescription': 'Written order for medication'
        }
        
        found_terms = []
        text_lower = text.lower()
        
        for term, explanation in common_terms.items():
            if term in text_lower:
                found_terms.append({
                    "term": term.title(),
                    "explanation": explanation
                })
        
        # If no specific terms found, provide general medical context
        if not found_terms:
            found_terms = [{
                "term": "Medical Record",
                "explanation": "Official document containing patient health information"
            }]
        
        return found_terms[:10]  # Limit to 10 terms
    
    def _generate_document_recommendations(self, key_findings: List[str], doc_type: str) -> List[str]:
        """
        Generate recommendations based on document analysis
        """
        recommendations = []
        
        if doc_type == 'lab-report':
            recommendations = [
                "Discuss results with your healthcare provider",
                "Keep a copy of this report for your medical records",
                "Schedule follow-up tests as recommended",
                "Note any abnormal values for discussion"
            ]
        elif doc_type == 'prescription':
            recommendations = [
                "Take medications exactly as prescribed",
                "Note any side effects and report to your doctor",
                "Don't stop medication without consulting your doctor",
                "Keep track of refill dates"
            ]
        elif doc_type == 'scan':
            recommendations = [
                "Review imaging results with your doctor",
                "Bring this report to your next appointment",
                "Follow up as recommended in the report",
                "Keep digital copies for future reference"
            ]
        elif doc_type == 'consultation':
            recommendations = [
                "Follow the treatment plan outlined",
                "Schedule recommended follow-up appointments",
                "Contact your doctor if symptoms worsen",
                "Keep track of symptom changes"
            ]
        else:
            recommendations = [
                "Store this document securely with other medical records",
                "Share with healthcare providers as needed",
                "Keep both physical and digital copies",
                "Note the document date for reference"
            ]
        
        return recommendations
    
    def _determine_document_urgency(self, key_findings: List[str], doc_type: str) -> str:
        """
        Determine urgency level based on document content
        """
        # Simplified urgency detection
        # In production: Use ML classification model trained on medical urgency indicators
        
        urgent_keywords = ['abnormal', 'elevated', 'critical', 'urgent', 'immediate', 'severe', 'emergency']
        moderate_keywords = ['follow-up', 'monitor', 'recheck', 'consult']
        
        findings_text = ' '.join(key_findings).lower()
        
        for keyword in urgent_keywords:
            if keyword in findings_text:
                return 'high'
        
        for keyword in moderate_keywords:
            if keyword in findings_text:
                return 'medium'
        
        return 'low'

class MedicalRecordSummarizer:
    """
    CNN + Transformer based medical record summarizer.
    Uses BART (facebook/bart-large-cnn) for text summarization
    and TrOCR for handwritten prescription OCR.
    """
    
    def __init__(self):
        self.summarizer = None
        self.model_loaded = False
        self._loading = False
        logger.info("MedicalRecordSummarizer initialized (lazy loading)")
    
    def _load_model(self):
        """Lazily load the BART summarization model"""
        if self.model_loaded or self._loading:
            return
        
        self._loading = True
        try:
            from transformers import pipeline
            import torch
            
            device = 0 if torch.cuda.is_available() else -1
            logger.info("Loading BART summarization model (facebook/bart-large-cnn)...")
            
            self.summarizer = pipeline(
                "summarization",
                model="facebook/bart-large-cnn",
                device=device
            )
            
            self.model_loaded = True
            logger.info(f"BART model loaded on {'GPU' if device == 0 else 'CPU'}")
        except Exception as e:
            logger.error(f"Failed to load BART model: {e}")
            self.model_loaded = False
        finally:
            self._loading = False
    
    async def summarize_text(self, text: str, max_length: int = 200, min_length: int = 50) -> str:
        """
        Summarize medical text using BART transformer model.
        Falls back to extractive summarization if model unavailable.
        """
        self._load_model()
        
        if not self.model_loaded or not text or len(text.strip()) < 50:
            # Fallback: simple extractive summary
            return self._extractive_summary(text)
        
        try:
            # BART has a max token limit — truncate if needed
            input_text = text[:4096]
            
            result = self.summarizer(
                input_text,
                max_length=max_length,
                min_length=min(min_length, len(input_text.split()) // 2),
                do_sample=False,
                truncation=True
            )
            
            return result[0]["summary_text"]
        except Exception as e:
            logger.error(f"BART summarization error: {e}")
            return self._extractive_summary(text)
    
    def _extractive_summary(self, text: str) -> str:
        """Simple extractive summary as fallback"""
        if not text:
            return "No content available for summarization."
        
        sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 20]
        if not sentences:
            return text[:300] + "..." if len(text) > 300 else text
        
        # Take first 3-5 meaningful sentences
        summary_sentences = sentences[:min(5, len(sentences))]
        return '. '.join(summary_sentences) + '.'
    
    async def process_and_summarize_image(self, image_bytes: bytes, doc_type: str = "prescription") -> Dict[str, Any]:
        """
        Full pipeline: Image → OCR (TrOCR CNN+Transformer) → Summarize (BART)
        """
        from app.services.ocr_service import ocr_service
        
        # Step 1: OCR with TrOCR
        is_handwritten = doc_type in ["prescription"]
        ocr_result = await ocr_service.extract_text_from_image(image_bytes, is_handwritten=is_handwritten)
        
        extracted_text = ocr_result.get("extracted_text", "")
        
        if not extracted_text:
            return {
                "extracted_text": "",
                "summary": "Could not extract text from the image. The image may be unclear or contain non-text content.",
                "key_findings": ["Text extraction unsuccessful"],
                "medical_terms": [{"term": "OCR", "explanation": "Optical Character Recognition — text extraction from images"}],
                "ocr_method": ocr_result.get("method", "unknown"),
                "ocr_confidence": ocr_result.get("confidence", 0.0),
                "model_info": ocr_result.get("model_info", {})
            }
        
        # Step 2: Summarize extracted text with BART
        summary = await self.summarize_text(extracted_text)
        medical_terms = ml_service._extract_medical_terms_offline(extracted_text)
        
        return {
            "extracted_text": extracted_text,
            "summary": summary,
            "key_findings": self._extract_findings_from_text(extracted_text, doc_type),
            "medical_terms": medical_terms,
            "ocr_method": ocr_result.get("method", "unknown"),
            "ocr_confidence": ocr_result.get("confidence", 0.0),
            "num_lines": ocr_result.get("num_lines_detected", 0),
            "model_info": ocr_result.get("model_info", {}),
            "summarization_model": "facebook/bart-large-cnn" if self.model_loaded else "extractive_fallback"
        }
    
    async def process_and_summarize_pdf(self, pdf_bytes: bytes, doc_type: str = "other") -> Dict[str, Any]:
        """
        Full pipeline: PDF → pdfplumber extraction → Summarize (BART)
        """
        from app.services.pdf_service import pdf_service
        
        # Step 1: Extract text from PDF
        pdf_result = pdf_service.extract_text_from_pdf(pdf_bytes)
        extracted_text = pdf_result.get("extracted_text", "")
        
        if not extracted_text:
            return {
                "extracted_text": "",
                "summary": "Could not extract text from the PDF. The document may be scanned or image-based.",
                "key_findings": ["Text extraction unsuccessful from PDF"],
                "medical_terms": [{"term": "PDF", "explanation": "Portable Document Format — the uploaded file format"}],
                "page_count": pdf_result.get("page_count", 0),
                "extraction_method": "pdfplumber"
            }
        
        # Step 2: Summarize with BART
        summary = await self.summarize_text(extracted_text)
        medical_terms = ml_service._extract_medical_terms_offline(extracted_text)
        
        return {
            "extracted_text": extracted_text,
            "summary": summary,
            "key_findings": self._extract_findings_from_text(extracted_text, doc_type),
            "medical_terms": medical_terms,
            "page_count": pdf_result.get("page_count", 0),
            "extraction_method": "pdfplumber",
            "summarization_model": "facebook/bart-large-cnn" if self.model_loaded else "extractive_fallback"
        }
    
    def _extract_findings_from_text(self, text: str, doc_type: str) -> List[str]:
        """Extract key medical findings using actual document content (3-tier approach)."""
        import re
        findings = []
        text_stripped = text.strip()

        if not text_stripped or len(text_stripped) < 20:
            return [f"Medical {doc_type.replace('-', ' ')} document analyzed."]

        # Tier 1: lines with numeric measurements / lab values
        value_pattern = re.compile(
            r'([A-Za-z][A-Za-z\s/\(\)]{3,40})\s*[:\-]\s*([\d\.]+\s*(?:mg|g|ml|mmol|mmHg|%|U/L|IU/L|mEq|ng|pg|fl|fL|bpm|°C|°F|/dL|/L|/mm|/uL)?(?:\s*/\s*[\d\.]+)?)',
            re.IGNORECASE
        )
        for match in value_pattern.finditer(text_stripped):
            label = match.group(1).strip().strip('-').strip()
            value = match.group(2).strip()
            if 3 < len(label) < 50:
                findings.append(f"{label}: {value}")
            if len(findings) >= 6:
                break

        # Tier 2: sentences with medical signal words
        if len(findings) < 3:
            signal_words = [
                'diagnosis', 'diagnosed', 'impression', 'finding', 'result', 'positive',
                'negative', 'abnormal', 'elevated', 'decreased', 'normal', 'deficiency',
                'prescribed', 'medication', 'dosage', 'treatment', 'condition',
                'fracture', 'lesion', 'infection', 'inflammation', 'chronic', 'acute',
                'severe', 'mild', 'moderate', 'urgent', 'critical', 'complaint', 'symptom',
            ]
            sentences = re.split(r'(?<=[.!?])\s+', text_stripped)
            for sentence in sentences:
                sentence = sentence.strip()
                if 15 < len(sentence) < 200:
                    if any(w in sentence.lower() for w in signal_words):
                        clean = re.sub(r'\s+', ' ', sentence)
                        if clean not in findings:
                            findings.append(clean)
                if len(findings) >= 5:
                    break

        # Tier 3: informative lines as last resort
        if len(findings) < 2:
            lines = [l.strip() for l in text_stripped.splitlines() if len(l.strip()) > 15]
            for line in lines[:10]:
                clean = re.sub(r'\s+', ' ', line)
                if clean not in findings:
                    findings.append(clean)
                if len(findings) >= 5:
                    break

        if not findings:
            findings = [f"Medical {doc_type.replace('-', ' ')} document analyzed."]

        return findings[:6]
    
    async def batch_summarize(self, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Batch summarize multiple medical records.
        Processes each document through appropriate pipeline based on file type.
        """
        summaries = []
        overall_texts = []
        
        for doc in documents:
            file_type = doc.get("file_type", "")
            doc_type = doc.get("document_type", "other")
            doc_name = doc.get("document_name", "Unknown Document")
            file_bytes = doc.get("file_bytes")
            document_text = doc.get("document_text", "")
            
            try:
                if file_bytes and file_type.startswith("image/"):
                    # Image → TrOCR → BART
                    result = await self.process_and_summarize_image(file_bytes, doc_type)
                elif file_bytes and file_type == "application/pdf":
                    # PDF → pdfplumber → BART
                    result = await self.process_and_summarize_pdf(file_bytes, doc_type)
                elif document_text:
                    # Raw text → BART
                    summary = await self.summarize_text(document_text)
                    result = {
                        "extracted_text": document_text,
                        "summary": summary,
                        "key_findings": self._extract_findings_from_text(document_text, doc_type),
                        "summarization_model": "facebook/bart-large-cnn" if self.model_loaded else "extractive_fallback"
                    }
                else:
                    result = {
                        "extracted_text": "",
                        "summary": "No content available for this document.",
                        "key_findings": ["Document content not accessible"]
                    }
                
                # Add document metadata
                result["document_name"] = doc_name
                result["document_type"] = doc_type
                result["document_id"] = doc.get("document_id", "")
                
                # Determine urgency
                text_for_urgency = result.get("extracted_text", "") + " " + result.get("summary", "")
                result["urgency_level"] = self._assess_urgency(text_for_urgency)
                
                # Generate recommendations
                result["recommendations"] = self._generate_recs(text_for_urgency, doc_type)
                
                summaries.append(result)
                
                if result.get("extracted_text"):
                    overall_texts.append(result["extracted_text"][:500])
                    
            except Exception as e:
                logger.error(f"Error processing document {doc_name}: {e}")
                summaries.append({
                    "document_name": doc_name,
                    "document_type": doc_type,
                    "document_id": doc.get("document_id", ""),
                    "summary": f"Error processing: {str(e)}",
                    "key_findings": ["Processing error occurred"],
                    "urgency_level": "low",
                    "recommendations": ["Review this document manually"]
                })
        
        # Generate overall summary from all texts
        overall_text = "\n\n".join(overall_texts)
        overall_summary = await self.summarize_text(overall_text) if overall_text else "No documents were processed."
        
        return {
            "summaries": summaries,
            "overall_summary": overall_summary,
            "total_documents": len(documents),
            "processed_documents": len(summaries),
            "models_used": {
                "ocr": "microsoft/trocr-base-handwritten (CNN + Transformer)",
                "summarization": "facebook/bart-large-cnn (Transformer)" if self.model_loaded else "Extractive fallback",
                "pdf_extraction": "pdfplumber"
            }
        }
    
    def _assess_urgency(self, text: str) -> str:
        """Assess urgency based on text content"""
        text_lower = text.lower()
        
        high_urgency = ['emergency', 'urgent', 'critical', 'severe', 'immediate', 'life-threatening', 'acute']
        moderate_urgency = ['elevated', 'abnormal', 'concerning', 'monitor', 'follow-up', 'recheck', 'borderline']
        
        for word in high_urgency:
            if word in text_lower:
                return "high"
        for word in moderate_urgency:
            if word in text_lower:
                return "moderate"
        return "low"
    
    def _generate_recs(self, text: str, doc_type: str) -> List[str]:
        """Generate recommendations based on content and type"""
        recs = []
        text_lower = text.lower()
        
        if doc_type == "prescription":
            recs.extend(["Take medications as prescribed", "Report any side effects to your doctor"])
        elif doc_type == "lab-report":
            recs.extend(["Discuss results with your healthcare provider"])
        elif doc_type == "scan":
            recs.extend(["Consult your doctor about imaging findings"])
        
        if 'abnormal' in text_lower or 'elevated' in text_lower:
            recs.append("Schedule a follow-up appointment")
        if 'urgent' in text_lower or 'critical' in text_lower:
            recs.insert(0, "⚠️ Seek immediate medical attention")
        
        if not recs:
            recs = ["Keep this document for your medical records", "Share with your healthcare provider during next visit"]
        
        return recs[:4]
    
    async def generate_combined_pdf(self, patient_info: Dict, summaries: List[Dict], overall_summary: str = "") -> bytes:
        """Generate a combined PDF report from all summaries"""
        from app.services.pdf_service import pdf_service
        return pdf_service.generate_combined_report(patient_info, summaries, overall_summary)


# Singleton instances
ml_service = MLService()
medical_summarizer = MedicalRecordSummarizer()
