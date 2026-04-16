import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { documentAPI, patientAPI } from '../services/api';
import aiService from '../services/aiService';
import { 
    LayoutDashboard, 
    Calendar, 
    Pill, 
    FileText, 
    TrendingUp, 
    User, 
    LogOut, 
    Upload, 
    Download, 
    Eye, 
    Trash2, 
    FileBarChart,
    Heart,
    Activity,
    Thermometer,
    Weight,
    Shield,
    Phone,
    Mail,
    MapPin,
    Camera,
    Lock,
    CheckCircle,
    Menu,
    X,
    Sparkles,
    Brain,
    AlertCircle,
    Clock,
    Plus
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
    .replace(/\/$/, '')
    .replace(/\/api$/, '');
const API_URL = `${API_BASE_URL}/api/documents`;

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Medical records state
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadCategory, setUploadCategory] = useState('lab-report');
    const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
    const [isDragging, setIsDragging] = useState(false);
    
    // Health reports state
    const [generatingReport, setGeneratingReport] = useState(false);
    const [healthReports, setHealthReports] = useState([]);
    const [deletingReports, setDeletingReports] = useState({});
    
    // Document summary state
    const [summarizing, setSummarizing] = useState({});
    const [summaries, setSummaries] = useState({});
    const [viewingSummary, setViewingSummary] = useState(null);
    
    // Batch summarization & summary history modal state
    const [batchSummarizing, setBatchSummarizing] = useState(false);
    const [batchSummaryResult, setBatchSummaryResult] = useState(null);
    const [showSummaryHistoryModal, setShowSummaryHistoryModal] = useState(false);
    const [generatingPdfReport, setGeneratingPdfReport] = useState(false);

    // Medical-Summarizer file analysis state
    const [medicalFileSummarizing, setMedicalFileSummarizing] = useState(false);
    const [medicalFileSummaryResult, setMedicalFileSummaryResult] = useState(null);
    const [showMedicalFileSummaryModal, setShowMedicalFileSummaryModal] = useState(false);
    
    // Appointment state
    const [appointments, setAppointments] = useState([]);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [aiSuggestedSlots, setAiSuggestedSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [bookingAppointment, setBookingAppointment] = useState(false);
    const [appointmentMessage, setAppointmentMessage] = useState({ type: '', text: '' });
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [rescheduleData, setRescheduleData] = useState(null);

    // Profile form state
    const [profileForm, setProfileForm] = useState({ phone: '', dateOfBirth: '', gender: '', address: '' });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    
    // Doctor selection state
    const [doctors, setDoctors] = useState([]);
    const [groupedDoctors, setGroupedDoctors] = useState({});
    const [specialties, setSpecialties] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    
    // Health Tracker state
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bmi, setBmi] = useState(null);
    const [bmiHistory, setBmiHistory] = useState([]);
    const [bloodPressure, setBloodPressure] = useState({ systolic: '', diastolic: '' });
    const [heartRate, setHeartRate] = useState('');
    const [temperature, setTemperature] = useState('');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/sign-in');
            return;
        }
        
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'patient') {
            navigate('/sign-in');
            return;
        }
        
        setUser(parsedUser);
        fetchMedicalRecords();
        fetchHealthReports(); // Fetch existing reports
        fetchAppointments(); // Fetch appointments
        fetchPatientProfile(); // Fetch profile extra fields
    }, [navigate]);

    const fetchPatientProfile = async () => {
        try {
            const response = await patientAPI.getProfile();
            if (response.success && response.profile) {
                const p = response.profile;
                setProfileForm({
                    phone: p.phone || '',
                    dateOfBirth: p.dateOfBirth || '',
                    gender: p.gender || '',
                    address: p.address || '',
                });
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setProfileSaving(true);
        setProfileMessage({ type: '', text: '' });
        try {
            await patientAPI.updateProfile(profileForm);
            setProfileMessage({ type: 'success', text: 'Profile saved successfully!' });
        } catch (err) {
            setProfileMessage({ type: 'error', text: err.message || 'Failed to save profile' });
        } finally {
            setProfileSaving(false);
            setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
        }
    };

    const fetchMedicalRecords = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await axios.post(`${API_URL}/list`, { token });
            
            if (response.data.success) {
                setMedicalRecords(response.data.documents);
            }
        } catch (error) {
            console.error('Error fetching medical records:', error);
        }
    };

    const fetchHealthReports = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await axios.post(`${API_BASE_URL}/api/reports/list`, { token });
            
            if (response.data.success) {
                setHealthReports(response.data.reports);
            }
        } catch (error) {
            console.error('Error fetching health reports:', error);
        }
    };

    const isImageFile = (file) => Boolean(file?.type?.startsWith('image/'));

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 25 * 1024 * 1024) {
                setUploadMessage({ type: 'error', text: 'File size must be less than 25MB' });
                return;
            }
            
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                setUploadMessage({ type: 'error', text: 'Only PDF, JPG, PNG, and DOC files are allowed' });
                return;
            }
            
            setSelectedFile(file);
            setUploadCategory(isImageFile(file) ? 'lab-report' : 'other');
            setUploadMessage({ type: '', text: '' });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (file.size > 25 * 1024 * 1024) {
                setUploadMessage({ type: 'error', text: 'File size must be less than 25MB' });
                return;
            }
            
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                setUploadMessage({ type: 'error', text: 'Only PDF, JPG, PNG, and DOC files are allowed' });
                return;
            }
            
            setSelectedFile(file);
            setUploadCategory(isImageFile(file) ? 'lab-report' : 'other');
            setUploadMessage({ type: '', text: '' });
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            setUploadMessage({ type: 'error', text: 'Please select a file first' });
            return;
        }

        const imageUpload = isImageFile(selectedFile);
        const selectedCategory = imageUpload ? uploadCategory : 'other';

        if (imageUpload && !['lab-report', 'prescription'].includes(selectedCategory)) {
            setUploadMessage({ type: 'error', text: 'Please choose Report or Prescription for image uploads' });
            return;
        }

        setUploading(true);
        setUploadMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            
            const formData = new FormData();
            formData.append('document', selectedFile);
            formData.append('token', token);
            formData.append('category', selectedCategory);
            formData.append('description', `Uploaded ${selectedFile.name}`);

            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setUploadMessage({ type: 'success', text: 'Document uploaded successfully!' });
                setSelectedFile(null);
                setUploadCategory('lab-report');
                const fileInput = document.getElementById('file-upload');
                if (fileInput) fileInput.value = '';
                await fetchMedicalRecords();
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to upload document' 
            });
        } finally {
            setUploading(false);
        }
    };

    const handleViewDocument = async (documentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/view/${documentId}`, { token });
            
            if (response.data.success) {
                window.open(response.data.url, '_blank');
            }
        } catch (error) {
            console.error('View error:', error);
            setUploadMessage({ type: 'error', text: 'Failed to view document' });
        }
    };

    const handleDownloadDocument = async (documentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/download/${documentId}`, { token });
            
            if (response.data.success) {
                window.open(response.data.url, '_blank');
            }
        } catch (error) {
            console.error('Download error:', error);
            setUploadMessage({ type: 'error', text: 'Failed to download document' });
        }
    };

    const handleDeleteDocument = async (documentId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_URL}/${documentId}`, {
                data: { token }
            });
            
            if (response.data.success) {
                setUploadMessage({ type: 'success', text: 'Document deleted successfully' });
                await fetchMedicalRecords();
            }
        } catch (error) {
            console.error('Delete error:', error);
            setUploadMessage({ type: 'error', text: 'Failed to delete document' });
        }
    };

    const handleSummarizeDocument = async (documentId) => {
        setSummarizing(prev => ({ ...prev, [documentId]: true }));
        setUploadMessage({ type: '', text: '' });

        try {
            const response = await documentAPI.summarizeDocument(documentId);
            
            if (response.success) {
                setSummaries(prev => ({ ...prev, [documentId]: response.summary }));
                setUploadMessage({ 
                    type: 'success', 
                    text: 'Document summarized successfully! Click "View Summary" to see the details.' 
                });
                // Refresh records to get updated summary status
                await fetchMedicalRecords();
            }
        } catch (error) {
            console.error('Summarize error:', error);
            setUploadMessage({ 
                type: 'error', 
                text: error.message || 'Failed to summarize document' 
            });
        } finally {
            setSummarizing(prev => ({ ...prev, [documentId]: false }));
        }
    };

    const handleViewSummary = async (documentId) => {
        try {
            // Check if we already have the summary
            if (summaries[documentId]) {
                setViewingSummary({ id: documentId, data: summaries[documentId] });
                return;
            }

            // Fetch the summary
            const response = await documentAPI.getDocumentSummary(documentId);
            
            if (response.success) {
                setSummaries(prev => ({ ...prev, [documentId]: response.document.summary }));
                setViewingSummary({ id: documentId, data: response.document.summary });
            }
        } catch (error) {
            console.error('View summary error:', error);
            setUploadMessage({ 
                type: 'error', 
                text: 'Summary not available yet. Please generate it first.' 
            });
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Appointment functions
    const fetchAppointments = async () => {
        try {
            const response = await patientAPI.getMyAppointments();
            if (response.success) {
                setAppointments(response.appointments || []);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const fetchDoctors = async () => {
        setLoadingDoctors(true);
        try {
            const response = await patientAPI.getAllDoctors();
            if (response.success) {
                setDoctors(response.doctors || []);
                setGroupedDoctors(response.groupedBySpecialty || {});
                setSpecialties(['All', ...(response.specialties || [])]);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            setAppointmentMessage({ 
                type: 'error', 
                text: 'Failed to load doctors' 
            });
        } finally {
            setLoadingDoctors(false);
        }
    };

    const handleOpenAppointmentModal = async () => {
        setShowAppointmentModal(true);
        setAppointmentMessage({ type: '', text: '' });
        setSelectedDoctor(null);
        setSelectedSpecialty('All');
        setSelectedDate('');
        setAvailableSlots([]);
        await fetchDoctors();
    };

    const handleDoctorSelect = async (doctor) => {
        setSelectedDoctor(doctor);
        setAvailableSlots([]);
        setAppointmentMessage({ type: '', text: '' });
        setAiSuggestedSlots([]);
        
        // Fetch AI-suggested slots for this doctor
        fetchAISuggestedSlots(doctor._id);
        
        // If date is already selected, fetch slots
        if (selectedDate) {
            await fetchAvailableSlots(doctor._id, selectedDate);
        }
    };

    const fetchAISuggestedSlots = async (doctorId) => {
        try {
            setLoadingSlots(true);
            // Generate next 7 days as preferred dates
            const preferredDates = [];
            for (let i = 1; i <= 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                preferredDates.push(date.toISOString().split('T')[0]);
            }
            
            const response = await patientAPI.getAISuggestedSlots(
                doctorId,
                preferredDates,
                ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] // Preferred times
            );
            
            if (response.success && response.recommendedSlots) {
                setAiSuggestedSlots(response.recommendedSlots);
            }
        } catch (error) {
            console.error('Error fetching AI suggestions:', error);
            // Silent fail - AI suggestions are optional
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleDateSelect = async (date) => {
        setSelectedDate(date);
        setAvailableSlots([]);
        
        // If doctor is selected, fetch slots
        if (selectedDoctor) {
            await fetchAvailableSlots(selectedDoctor._id, date);
        }
    };

    const fetchAvailableSlots = async (doctorId, date) => {
        setLoadingSlots(true);
        setAppointmentMessage({ type: '', text: '' });
        
        try {
            const response = await patientAPI.getAvailableSlots(doctorId, [date]);
            if (response.success) {
                const slots = response.slotsPerDate[date] || [];
                setAvailableSlots(slots);
                
                if (slots.length === 0) {
                    setAppointmentMessage({ 
                        type: 'info', 
                        text: 'No available slots for this date. Please try another date.' 
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
            setAppointmentMessage({ 
                type: 'error', 
                text: error.message || 'Failed to fetch available slots' 
            });
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleBookTimeSlot = async (timeSlot) => {
        if (!selectedDoctor || !selectedDate) return;
        
        setBookingAppointment(true);
        setAppointmentMessage({ type: '', text: '' });
        
        try {
            const response = await patientAPI.requestAppointment(
                selectedDoctor._id,
                selectedDate,
                timeSlot,
                ''
            );
            
            if (response.success) {
                setAppointmentMessage({ 
                    type: 'success', 
                    text: 'Appointment booked successfully!' 
                });
                fetchAppointments();
                setTimeout(() => {
                    setShowAppointmentModal(false);
                    setAppointmentMessage({ type: '', text: '' });
                }, 2000);
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            setAppointmentMessage({ 
                type: 'error', 
                text: error.message || 'Failed to book appointment' 
            });
        } finally {
            setBookingAppointment(false);
        }
    };

    const handleBookAISlot = async (slot) => {
        if (!selectedDoctor) return;
        
        setBookingAppointment(true);
        setAppointmentMessage({ type: '', text: '' });
        
        try {
            const response = await patientAPI.requestAppointment(
                selectedDoctor._id,
                slot.date,
                slot.time,
                `AI-recommended slot (${Math.round(slot.score * 10)}% match) - ${slot.reason}`
            );
            
            if (response.success) {
                setAppointmentMessage({ 
                    type: 'success', 
                    text: '🎉 Appointment booked successfully with AI-recommended slot!' 
                });
                fetchAppointments();
                setTimeout(() => {
                    setShowAppointmentModal(false);
                    setAppointmentMessage({ type: '', text: '' });
                    setAiSuggestedSlots([]);
                }, 2000);
            }
        } catch (error) {
            console.error('Error booking AI slot:', error);
            setAppointmentMessage({ 
                type: 'error', 
                text: error.message || 'Failed to book appointment' 
            });
        } finally {
            setBookingAppointment(false);
        }
    };

    const handleBookAppointment = async (slot) => {
        setBookingAppointment(true);
        setAppointmentMessage({ type: '', text: '' });
        
        try {
            const doctorId = user?.doctor_id || "";
            const response = await patientAPI.requestAppointment(
                doctorId,
                slot.date,
                slot.time,
                `AI-suggested slot (Score: ${slot.score.toFixed(1)})`
            );
            
            if (response.success) {
                setAppointmentMessage({ 
                    type: 'success', 
                    text: 'Appointment booked successfully!' 
                });
                fetchAppointments();
                setTimeout(() => {
                    setShowAppointmentModal(false);
                    setAppointmentMessage({ type: '', text: '' });
                }, 2000);
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            setAppointmentMessage({ 
                type: 'error', 
                text: error.message || 'Failed to book appointment' 
            });
        } finally {
            setBookingAppointment(false);
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }
        
        try {
            const response = await patientAPI.cancelAppointment(appointmentId);
            if (response.success) {
                setAppointmentMessage({ 
                    type: 'success', 
                    text: 'Appointment cancelled successfully!' 
                });
                fetchAppointments();
                setTimeout(() => {
                    setAppointmentMessage({ type: '', text: '' });
                }, 3000);
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            setAppointmentMessage({ 
                type: 'error', 
                text: error.message || 'Failed to cancel appointment' 
            });
        }
    };

    const handleOpenRescheduleModal = async (appointment) => {
        setRescheduleData({ appointment, suggestedSlots: [] });
        setShowRescheduleModal(true);
        setLoadingSlots(true);
        
        try {
            const response = await patientAPI.getRescheduleSuggestions(appointment._id);
            if (response.success) {
                setRescheduleData({
                    appointment: response.currentAppointment,
                    suggestedSlots: response.recommendedSlots || []
                });
            }
        } catch (error) {
            console.error('Error getting reschedule suggestions:', error);
            setAppointmentMessage({ 
                type: 'error', 
                text: error.message || 'Failed to get reschedule suggestions' 
            });
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleRescheduleAppointment = async (slot) => {
        setBookingAppointment(true);
        setAppointmentMessage({ type: '', text: '' });
        
        try {
            const response = await patientAPI.rescheduleAppointment(
                rescheduleData.appointment._id,
                slot.date,
                slot.time,
                'Rescheduled by patient'
            );
            
            if (response.success) {
                setAppointmentMessage({ 
                    type: 'success', 
                    text: 'Appointment rescheduled successfully!' 
                });
                fetchAppointments();
                setTimeout(() => {
                    setShowRescheduleModal(false);
                    setAppointmentMessage({ type: '', text: '' });
                }, 2000);
            }
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            setAppointmentMessage({ 
                type: 'error', 
                text: error.message || 'Failed to reschedule appointment' 
            });
        } finally {
            setBookingAppointment(false);
        }
    };


    // Auto-dismiss uploadMessage after 3 seconds
    useEffect(() => {
        if (uploadMessage.text) {
            const timer = setTimeout(() => {
                setUploadMessage({ type: '', text: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [uploadMessage.text]);

    // === Medical-Summarizer: Analyze an existing medical record file ===
    const handleAnalyzeRecord = async (record) => {
        const recordId = record._id;
        setMedicalFileSummarizing(true);
        setMedicalFileSummaryResult(null);
        setUploadMessage({ type: '', text: '' });
        try {
            // Step 1: get the signed S3 URL for the file
            const token = localStorage.getItem('token');
            const viewRes = await axios.post(`${API_URL}/view/${recordId}`, { token });
            if (!viewRes.data.success) throw new Error('Could not retrieve file URL');
            const signedUrl = viewRes.data.url;

            // Step 2: download the file as a blob
            const blobRes = await axios.get(signedUrl, { responseType: 'blob' });
            const mimeType = blobRes.data.type || 'application/octet-stream';

            // Determine extension from originalName or fileType
            const originalName = record.originalName || record.fileName || 'document';
            const ext = originalName.includes('.')
                ? originalName.slice(originalName.lastIndexOf('.')).toLowerCase()
                : '.pdf';

            const allowedExts = ['.txt', '.pdf', '.docx', '.json'];
            if (!allowedExts.includes(ext)) {
                throw new Error(`File type "${ext}" is not supported for analysis. Supported: .txt, .pdf, .docx, .json`);
            }

            const file = new File([blobRes.data], originalName, { type: mimeType });

            // Step 3: send to Medical-Summarizer endpoint
            const patientId = user?.id || user?._id || 'unknown';
            const result = await aiService.summarizeMedicalFile(file, patientId, recordId);

            if (result.success) {
                setMedicalFileSummaryResult(result);
                setShowMedicalFileSummaryModal(true);
            }
        } catch (error) {
            console.error('Analyze record error:', error);
            setUploadMessage({
                type: 'error',
                text: error.message || 'Failed to analyze record. Ensure the ML service is running.',
            });
        } finally {
            setMedicalFileSummarizing(false);
        }
    };

    // === Batch AI Summarization (CNN + Transformer) ===
    const handleSummarizeAllRecords = async () => {
        if (medicalRecords.length === 0) {
            setUploadMessage({ type: 'error', text: 'No medical records to summarize.' });
            return;
        }

        setBatchSummarizing(true);
        setUploadMessage({ type: '', text: '' });

        try {
            const documents = medicalRecords.map(record => ({
                document_id: record._id,
                document_name: record.title || record.originalName,
                document_type: record.category || 'other',
                document_text: record.description || `Medical ${record.category || 'document'}: ${record.title || record.originalName}`,
                file_type: record.fileType || ''
            }));

            const result = await aiService.summarizeAllRecords({
                patient_id: user?.id || user?._id || 'unknown',
                documents
            });

            if (result.success) {
                setBatchSummaryResult(result);
                setShowSummaryHistoryModal(true);
                setUploadMessage({ 
                    type: 'success', 
                    text: `Successfully summarized ${result.processed_documents} records using AI (CNN + Transformer)!`
                });
            }
        } catch (error) {
            console.error('Batch summarization error:', error);
            setUploadMessage({ 
                type: 'error', 
                text: error.message || 'Failed to summarize records. Please ensure the ML service is running.' 
            });
        } finally {
            setBatchSummarizing(false);
        }
    };

    const handleDownloadSummaryPDF = async () => {
        if (!batchSummaryResult) return;

        setGeneratingPdfReport(true);
        try {
            const result = await aiService.generateSummaryReport({
                patient_id: user?.id || user?._id || 'unknown',
                patient_name: user?.fullname || user?.name || 'Patient',
                summaries: batchSummaryResult.summaries,
                overall_summary: batchSummaryResult.overall_summary || ''
            });

            if (result.success && result.pdf_base64) {
                // Convert base64 to blob and download
                const byteCharacters = atob(result.pdf_base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = result.file_name || 'health_summary_report.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                setUploadMessage({ type: 'success', text: 'PDF report downloaded successfully!' });
            }
        } catch (error) {
            console.error('PDF report generation error:', error);
            setUploadMessage({ 
                type: 'error', 
                text: error.message || 'Failed to generate PDF report.' 
            });
        } finally {
            setGeneratingPdfReport(false);
        }
    };

    const handleGenerateReport = async () => {
        setGeneratingReport(true);
        setUploadMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            
            // Prepare health tracker data
            const healthTrackerData = {
                currentBmi: bmi,
                bmiHistory: bmiHistory,
                currentHeight: height,
                currentWeight: weight,
                bloodPressure: bloodPressure,
                heartRate: heartRate,
                temperature: temperature
            };
            
            const response = await axios.post(`${API_BASE_URL}/api/reports/generate`, { 
                token,
                includeRecords: true,
                includeAppointments: true,
                includePrescriptions: true,
                includeHealthMetrics: true,
                healthTrackerData: healthTrackerData
            }, {
                timeout: 600000 // 10 minutes – AI summarises each document sequentially
            });

            if (response.data.success) {
                const report = response.data.report;
                
                const urgencyParts = [];
                if (report.urgencyHigh > 0)   urgencyParts.push(`${report.urgencyHigh} critical`);
                if (report.urgencyMedium > 0) urgencyParts.push(`${report.urgencyMedium} medium`);
                if (report.urgencyLow > 0)    urgencyParts.push(`${report.urgencyLow} normal`);
                const urgencyText = urgencyParts.length > 0 ? ` Urgency: ${urgencyParts.join(', ')}.` : '';

                setUploadMessage({ 
                    type: 'success', 
                    text: `Health report generated! ${report.totalDocuments} documents analyzed, ${report.summarizedDocuments} with AI summaries.${urgencyText}`
                });
                
                // Add to reports list
                setHealthReports(prev => [report, ...prev]);
                
                // Automatically download the PDF
                if (report.downloadUrl) {
                    window.open(report.downloadUrl, '_blank');
                }
            }
        } catch (error) {
            console.error('Report generation error:', error);
            setUploadMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to generate health report' 
            });
        } finally {
            setGeneratingReport(false);
        }
    };

    const handleViewReport = async (reportId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/api/reports/view/${reportId}`, { token });
            
            if (response.data.success && response.data.downloadUrl) {
                window.open(response.data.downloadUrl, '_blank');
            } else {
                setUploadMessage({ type: 'error', text: 'Report not available' });
            }
        } catch (error) {
            console.error('View report error:', error);
            setUploadMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to view report' 
            });
        }
    };

    const handleDownloadReport = async (reportId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/api/reports/download/${reportId}`, { token });
            
            if (response.data.success && response.data.downloadUrl) {
                // Create a temporary link to download
                const link = document.createElement('a');
                link.href = response.data.downloadUrl;
                link.download = response.data.fileName || 'health_report.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                setUploadMessage({ type: 'success', text: 'Report download started' });
            } else {
                setUploadMessage({ type: 'error', text: 'Report not available' });
            }
        } catch (error) {
            console.error('Download report error:', error);
            setUploadMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to download report' 
            });
        }
    };

    const handleDeleteReport = async (reportId) => {
        if (!reportId) {
            return;
        }

        if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
            return;
        }

        setDeletingReports(prev => ({ ...prev, [reportId]: true }));

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_BASE_URL}/api/reports/${reportId}`, {
                data: { token }
            });

            if (response.data.success) {
                setHealthReports(prev => prev.filter((report) => (report.id || report._id) !== reportId));
                setUploadMessage({ type: 'success', text: 'Report deleted successfully' });
            }
        } catch (error) {
            console.error('Delete report error:', error);
            setUploadMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to delete report'
            });
        } finally {
            setDeletingReports(prev => {
                const next = { ...prev };
                delete next[reportId];
                return next;
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Sidebar Component
    const Sidebar = () => (
        <>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            <div className={`w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo Section */}
                <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <img src="/favicon.svg" alt="Health Track" className="w-8 h-8 sm:w-10 sm:h-10" />
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                Health Track
                            </h1>
                            <p className="text-xs text-gray-500">Patient Portal</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {[
                        { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
                        { id: 'appointments', label: 'Appointments', Icon: Calendar },
                        { id: 'records', label: 'Medical Records', Icon: FileText },
                        { id: 'reports', label: 'Health Reports', Icon: TrendingUp },
                        { id: 'vitals', label: 'Health Tracker', Icon: Activity },
                        { id: 'profile', label: 'My Profile', Icon: User }
                    ].map((item) => {
                        const IconComponent = item.Icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveSection(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                    activeSection === item.id
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <IconComponent className="w-5 h-5" />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile Section */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 rounded-lg hover:text-red-700 transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            
            {/* Main Content Area */}
            <div className="flex-1 lg:ml-64">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 sticky top-0 z-30">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                            >
                                <Menu className="w-6 h-6 text-gray-600" />
                            </button>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {activeSection === 'dashboard' && 'Dashboard'}
                                    {activeSection === 'appointments' && 'My Appointments'}
                                    {activeSection === 'records' && 'Medical Records'}
                                    {activeSection === 'reports' && 'Health Reports'}
                                    {activeSection === 'vitals' && 'Health Tracker'}
                                    {activeSection === 'profile' && 'Settings'}
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
                    {activeSection === 'dashboard' && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">0</h3>
                                    <p className="text-xs sm:text-sm text-gray-600">Appointments</p>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">0</h3>
                                    <p className="text-xs sm:text-sm text-gray-600">Prescriptions</p>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{medicalRecords.length}</h3>
                                    <p className="text-xs sm:text-sm text-gray-600">Records</p>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{healthReports.length}</h3>
                                    <p className="text-xs sm:text-sm text-gray-600">Reports</p>
                                </div>
                            </div>

                            {/* Recent Medical Records */}
                            {medicalRecords.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Records</h3>
                                        <button 
                                            onClick={() => setActiveSection('records')}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            View All
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {medicalRecords.slice(0, 3).map((record) => (
                                            <div key={record._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <div className="flex items-center space-x-3 min-w-0">
                                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <FileText className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-medium text-gray-900 text-sm truncate">{record.title || record.originalName}</h4>
                                                        <p className="text-xs text-gray-500">{formatDate(record.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleViewDocument(record._id)}
                                                    className="text-sm text-blue-600 hover:text-blue-700 flex-shrink-0 ml-2"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                {activeSection === 'appointments' && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Header with Book Button */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">My Appointments</h2>
                                </div>
                                <button 
                                    onClick={handleOpenAppointmentModal}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Book Appointment</span>
                                    <span className="sm:hidden">Book</span>
                                </button>
                            </div>

                            {/* Message Display */}
                            {appointmentMessage.text && (
                                <div className={`p-4 rounded-lg ${
                                    appointmentMessage.type === 'success' 
                                        ? 'bg-green-50 text-green-800 border border-green-200' 
                                        : 'bg-red-50 text-red-800 border border-red-200'
                                }`}>
                                    {appointmentMessage.text}
                                </div>
                            )}

                            {/* Appointments List */}
                            {appointments.length === 0 ? (
                                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="w-10 h-10 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appointments Yet</h3>
                                    <p className="text-sm text-gray-600">Book your first appointment with AI-suggested time slots</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {appointments.map((appointment) => {
                                        const appointmentDateTime = new Date(appointment.appointmentDate);
                                        const timeString = appointmentDateTime.toLocaleTimeString('en-US', { 
                                            hour: '2-digit', 
                                            minute: '2-digit',
                                            hour12: true
                                        });
                                        
                                        return (
                                        <div key={appointment._id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-start gap-3">
                                                        <Clock className="w-5 h-5 text-gray-400 mt-1" />
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-900 mb-2">
                                                                {appointmentDateTime.toLocaleDateString('en-US', { 
                                                                    weekday: 'long', 
                                                                    year: 'numeric', 
                                                                    month: 'long', 
                                                                    day: 'numeric' 
                                                                })}
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                                                                <span className="font-medium text-blue-600">{timeString}</span>
                                                                <span className="text-gray-400">•</span>
                                                                <span className="text-gray-700">Dr. {appointment.doctor_id?.name || 'Unknown'}</span>
                                                                {appointment.doctor_id?.specialization && (
                                                                    <>
                                                                        <span className="text-gray-400">•</span>
                                                                        <span className="text-gray-600">{appointment.doctor_id.specialization}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {appointment.notes && (
                                                                <p className="text-sm text-gray-600 mb-2">
                                                                    <span className="font-medium">Notes:</span> {appointment.notes}
                                                                </p>
                                                            )}
                                                            <div>
                                                                <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                                                                    appointment.status === 'scheduled' 
                                                                        ? 'bg-green-100 text-green-800' 
                                                                        : appointment.status === 'cancelled'
                                                                        ? 'bg-red-100 text-red-800'
                                                                        : appointment.status === 'completed'
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {appointment.status === 'scheduled' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleOpenRescheduleModal(appointment)}
                                                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                                        >
                                                            Reschedule
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelAppointment(appointment._id)}
                                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                {activeSection === 'records' && (
                    <div className="space-y-5">
                        {/* Page Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Medical Records</h2>
                            </div>
                            <button
                                onClick={() => document.getElementById('file-upload').click()}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Upload className="w-4 h-4" />
                                <span>Upload</span>
                            </button>
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={handleFileSelect}
                            />
                        </div>

                        {/* Upload Message */}
                        {uploadMessage.text && (
                            <div className={`p-3 rounded-lg text-sm ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                                {uploadMessage.text}
                            </div>
                        )}

                        {/* Selected File Info & Upload */}
                        {selectedFile && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900">{selectedFile.name}</p>
                                            <p className="text-sm text-gray-600">Size: {formatFileSize(selectedFile.size)}</p>
                                            {isImageFile(selectedFile) && (
                                                <div className="mt-3">
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                        Document Type
                                                    </label>
                                                    <select
                                                        value={uploadCategory}
                                                        onChange={(e) => setUploadCategory(e.target.value)}
                                                        disabled={uploading}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                                                    >
                                                        <option value="lab-report">Report</option>
                                                        <option value="prescription">Prescription</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleFileUpload}
                                        disabled={uploading}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2 font-medium transition-colors"
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                <span>Confirm Upload</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Medical Records Table */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            {/* Table header */}
                            <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                <div className="col-span-1">#</div>
                                <div className="col-span-5">Record</div>
                                <div className="col-span-3 hidden sm:block">Details</div>
                                <div className="col-span-3 sm:col-span-3 text-right">Actions</div>
                            </div>

                            {medicalRecords.length === 0 ? (
                                <div className="px-5 py-12 text-center">
                                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-sm text-gray-500">No medical records yet. Upload your first record to get started.</p>
                                </div>
                            ) : (
                                medicalRecords.map((record, index) => (
                                    <div
                                        key={record._id}
                                        className="grid grid-cols-12 gap-2 px-5 py-4 items-center border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                                    >
                                        {/* Index */}
                                        <div className="col-span-1">
                                            <span className="text-sm font-medium text-gray-400">{medicalRecords.length - index}</span>
                                        </div>

                                        {/* Title & date */}
                                        <div className="col-span-7 sm:col-span-5 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {record.title || record.originalName}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {formatDate(record.createdAt)} • {formatFileSize(record.fileSize)}
                                            </p>
                                        </div>

                                        {/* Details */}
                                        <div className="col-span-3 hidden sm:flex flex-wrap gap-1">
                                            {record.category && (
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                    {record.category.replace('-', ' ')}
                                                </span>
                                            )}
                                            {record.isSummarized && (
                                                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                                                    Summarized
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-3 flex gap-1.5 justify-end">
                                            <button
                                                onClick={() => handleViewDocument(record._id)}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="View"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDownloadDocument(record._id)}
                                                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            {record.isSummarized && (
                                                <button
                                                    onClick={() => handleViewSummary(record._id)}
                                                    className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                                    title="View Summary"
                                                >
                                                    <Brain className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteDocument(record._id)}
                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeSection === 'reports' && (
                    <div className="space-y-5">
                        {/* Page Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Health Reports</h2>
                            </div>
                            <button
                                onClick={handleGenerateReport}
                                disabled={generatingReport || medicalRecords.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {generatingReport ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <FileBarChart className="w-4 h-4" />
                                        <span>Generate Report</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Stats Row */}
                        {(() => {
                            const totalHigh   = healthReports.reduce((s, r) => s + (r.urgencyHigh   || 0), 0);
                            const totalMedium = healthReports.reduce((s, r) => s + (r.urgencyMedium || 0), 0);
                            const totalLow    = healthReports.reduce((s, r) => s + (r.urgencyLow    || 0), 0);
                            const statsItems = [
                                { label: 'Total Reports',  value: healthReports.length,  className: '' },
                                { label: 'Critical / High', value: totalHigh,   className: totalHigh > 0   ? 'text-red-600'   : '' },
                                { label: 'Medium', value: totalMedium, className: totalMedium > 0 ? 'text-amber-600' : '' },
                                { label: 'Normal', value: totalLow,    className: totalLow > 0    ? 'text-green-600' : '' },
                            ];
                            return (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {statsItems.map(({ label, value, className }) => (
                                        <div key={label} className="bg-white border border-gray-200 rounded-lg p-4">
                                            <p className={`text-2xl font-bold text-gray-900 ${className}`}>{value}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* Info note */}
                        {medicalRecords.length > 0 && !generatingReport && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-start gap-3">
                                <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Your PDF will include AI summaries for all {medicalRecords.length} document{medicalRecords.length !== 1 ? 's' : ''}, key findings, vitals, and recommendations. Generation may take a few minutes.
                                </p>
                            </div>
                        )}

                        {/* Generation progress */}
                        {generatingReport && (
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">Generating health report…</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            AI is analysing {medicalRecords.length} document{medicalRecords.length !== 1 ? 's' : ''} sequentially. This may take several minutes.
                                        </p>
                                        <div className="mt-3 space-y-2">
                                            {[
                                                'Fetching medical records from storage',
                                                'Running AI summarisation on each file',
                                                'Compiling findings & recommendations',
                                                'Building and uploading PDF',
                                            ].map((step, i) => (
                                                <div key={step} className="flex items-center gap-2.5">
                                                    <div className="w-4 h-4 rounded-full border border-gray-300 bg-white flex items-center justify-center flex-shrink-0">
                                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 150}ms` }}></div>
                                                    </div>
                                                    <span className="text-xs text-gray-600">{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Alert Messages */}
                        {uploadMessage.text && uploadMessage.type && (
                            <div className={`px-4 py-3 rounded-lg border text-sm flex items-start gap-3 ${
                                uploadMessage.type === 'success'
                                    ? 'bg-green-50 border-green-200 text-green-800'
                                    : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                                {uploadMessage.type === 'success' ? (
                                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                )}
                                <span>{uploadMessage.text}</span>
                            </div>
                        )}

                        {/* Reports Table */}
                        {healthReports.length > 0 ? (
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                {/* Table header */}
                                <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    <div className="col-span-1">#</div>
                                    <div className="col-span-5">Report</div>
                                    <div className="col-span-3 hidden sm:block">Details</div>
                                    <div className="col-span-3 sm:col-span-3 text-right">Actions</div>
                                </div>

                                {healthReports.map((report, index) => {
                                    const reportId = report.id || report._id;
                                    const isDeletingReport = Boolean(deletingReports[reportId]);
                                    const totalDocs = report.totalDocuments || 0;
                                    const aiSummarized = report.summarizedDocuments || 0;
                                    const urgHigh   = report.urgencyHigh   || 0;
                                    const urgMedium = report.urgencyMedium || 0;
                                    const urgLow    = report.urgencyLow    || 0;

                                    return (
                                        <div
                                            key={reportId}
                                            className={`grid grid-cols-12 gap-2 px-5 py-4 items-center border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${isDeletingReport ? 'opacity-50' : ''}`}
                                        >
                                            {/* Index */}
                                            <div className="col-span-1">
                                                <span className="text-sm font-medium text-gray-400">{healthReports.length - index}</span>
                                            </div>

                                            {/* Title & date */}
                                            <div className="col-span-8 sm:col-span-5 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {report.title || 'Health Summary Report'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {new Date(report.generatedAt || report.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short', day: 'numeric', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>

                                            {/* Details */}
                                            <div className="col-span-3 hidden sm:flex flex-wrap gap-1 items-center">
                                                {totalDocs > 0 && (
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                        {totalDocs} docs
                                                    </span>
                                                )}
                                                {aiSummarized > 0 && (
                                                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                        {aiSummarized} AI
                                                    </span>
                                                )}
                                                {urgHigh > 0 && (
                                                    <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200" title="High urgency documents">
                                                        {urgHigh} critical
                                                    </span>
                                                )}
                                                {urgMedium > 0 && (
                                                    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200" title="Medium urgency documents">
                                                        {urgMedium} medium
                                                    </span>
                                                )}
                                                {urgLow > 0 && (
                                                    <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200" title="Low urgency / normal documents">
                                                        {urgLow} normal
                                                    </span>
                                                )}
                                                {report.fileSize && (
                                                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                        {(report.fileSize / 1024).toFixed(1)} KB
                                                    </span>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="col-span-3 flex gap-1.5 justify-end">
                                                <button
                                                    onClick={() => handleViewReport(reportId)}
                                                    disabled={isDeletingReport}
                                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadReport(reportId)}
                                                    disabled={isDeletingReport}
                                                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                    title="Download PDF"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReport(reportId)}
                                                    disabled={isDeletingReport}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                    title="Delete"
                                                >
                                                    {isDeletingReport ? (
                                                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            !generatingReport && (
                                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <FileBarChart className="w-7 h-7 text-gray-400" />
                                    </div>
                                    <h4 className="text-base font-semibold text-gray-800 mb-1">No reports yet</h4>
                                    <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
                                        Generate a report and AI will summarise every document you've uploaded into a single PDF.
                                    </p>
                                    <button
                                        onClick={handleGenerateReport}
                                        disabled={generatingReport || medicalRecords.length === 0}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        <FileBarChart className="w-4 h-4" />
                                        <span>{medicalRecords.length === 0 ? 'Upload documents first' : 'Generate first report'}</span>
                                    </button>
                                    {medicalRecords.length === 0 && (
                                        <p className="text-xs text-gray-400 mt-3">
                                            Visit{' '}
                                            <button onClick={() => setActiveSection('records')} className="text-blue-500 hover:underline">
                                                Medical Records
                                            </button>{' '}
                                            to upload files.
                                        </p>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* Health Tracker Section */}
                {activeSection === 'vitals' && (
                    <div className="space-y-5">
                        {/* Page Header */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Health Tracker</h2>
                        </div>

                        {/* BMI Calculator */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-5">BMI Calculator</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Input Section */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Height (cm)
                                        </label>
                                        <input
                                            type="number"
                                            value={height}
                                            onChange={(e) => setHeight(e.target.value)}
                                            placeholder="Enter height in cm"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Weight (kg)
                                        </label>
                                        <input
                                            type="number"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            placeholder="Enter weight in kg"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (height && weight) {
                                                const heightInM = parseFloat(height) / 100;
                                                const weightNum = parseFloat(weight);
                                                const bmiValue = (weightNum / (heightInM * heightInM)).toFixed(1);
                                                setBmi(bmiValue);
                                                
                                                // Add to history
                                                const newEntry = {
                                                    date: new Date().toISOString(),
                                                    bmi: parseFloat(bmiValue),
                                                    weight: weightNum,
                                                    height: parseFloat(height)
                                                };
                                                setBmiHistory([newEntry, ...bmiHistory].slice(0, 10));
                                            }
                                        }}
                                        className="w-full bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        Calculate BMI
                                    </button>
                                </div>

                                {/* Result Section */}
                                <div className="flex flex-col justify-center">
                                    {bmi ? (
                                        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                                            <p className="text-sm text-gray-600 mb-2">Your BMI</p>
                                            <p className="text-5xl font-bold text-gray-900 mb-3">{bmi}</p>
                                            <p className={`text-lg font-semibold ${
                                                bmi < 18.5 ? 'text-yellow-600' :
                                                bmi < 25 ? 'text-green-600' :
                                                bmi < 30 ? 'text-orange-600' :
                                                'text-red-600'
                                            }`}>
                                                {bmi < 18.5 ? 'Underweight' :
                                                 bmi < 25 ? 'Normal Weight' :
                                                 bmi < 30 ? 'Overweight' :
                                                 'Obese'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                                            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600">Enter your height and weight to calculate BMI</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* BMI Reference */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm font-medium text-gray-700 mb-3">BMI Categories:</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <span className="text-gray-700">Underweight: &lt; 18.5</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="text-gray-700">Normal: 18.5 - 24.9</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                        <span className="text-gray-700">Overweight: 25 - 29.9</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <span className="text-gray-700">Obese: ≥ 30</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BMI History */}
                        {bmiHistory.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">BMI History</h3>
                                            <p className="text-sm text-gray-600">Track your BMI changes over time</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setBmiHistory([])}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Clear History
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {bmiHistory.map((entry, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-gray-900">{entry.bmi}</p>
                                                    <p className={`text-xs font-medium ${
                                                        entry.bmi < 18.5 ? 'text-yellow-600' :
                                                        entry.bmi < 25 ? 'text-green-600' :
                                                        entry.bmi < 30 ? 'text-orange-600' :
                                                        'text-red-600'
                                                    }`}>
                                                        {entry.bmi < 18.5 ? 'Underweight' :
                                                         entry.bmi < 25 ? 'Normal' :
                                                         entry.bmi < 30 ? 'Overweight' :
                                                         'Obese'}
                                                    </p>
                                                </div>
                                                <div className="border-l border-gray-300 pl-4">
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-medium">Height:</span> {entry.height} cm
                                                    </p>
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-medium">Weight:</span> {entry.weight} kg
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right text-sm text-gray-500">
                                                {new Date(entry.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Other Vital Signs */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Other Vital Signs</h3>
                                    <p className="text-sm text-gray-600">Record additional health metrics</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Blood Pressure (mmHg)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Systolic"
                                            value={bloodPressure.systolic}
                                            onChange={(e) => setBloodPressure({...bloodPressure, systolic: e.target.value})}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                        />
                                        <span className="flex items-center text-gray-500">/</span>
                                        <input
                                            type="number"
                                            placeholder="Diastolic"
                                            value={bloodPressure.diastolic}
                                            onChange={(e) => setBloodPressure({...bloodPressure, diastolic: e.target.value})}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Heart Rate (bpm)
                                    </label>
                                    <input
                                        type="number"
                                        value={heartRate}
                                        onChange={(e) => setHeartRate(e.target.value)}
                                        placeholder="Enter heart rate"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Temperature (°F)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={temperature}
                                        onChange={(e) => setTemperature(e.target.value)}
                                        placeholder="Enter temperature"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800">
                                    <span className="font-medium">Note:</span> These measurements are for tracking purposes only. 
                                    Consult with your healthcare provider for medical advice.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                    {activeSection === 'profile' && (
                        <div className="space-y-5">
                            {/* Page Header */}
                            <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>

                            {/* Identity Card */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600 flex-shrink-0">
                                        {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'P'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xl font-semibold text-gray-900 truncate">{user?.name || 'Patient'}</p>
                                        <p className="text-sm text-gray-500 mt-0.5">{user?.email || ''}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Patient ID</p>
                                        <p className="text-base font-semibold text-gray-900 mt-0.5 font-mono">{user?.userId || '—'}</p>
                                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">Patient</span>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-5">Personal Information</h3>
                                <form onSubmit={handleSaveProfile}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={user?.name || ''}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500 cursor-not-allowed"
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500 cursor-not-allowed"
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={profileForm.phone}
                                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            placeholder="+91 00000 00000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            value={profileForm.dateOfBirth}
                                            onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Gender
                                        </label>
                                        <select
                                            value={profileForm.gender}
                                            onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                            <option value="prefer-not">Prefer not to say</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.address}
                                            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            placeholder="City, State, Country"
                                        />
                                    </div>
                                </div>
                                {profileMessage.text && (
                                    <p className={`mt-4 text-sm font-medium ${profileMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {profileMessage.text}
                                    </p>
                                )}
                                <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={profileSaving}
                                        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                                    >
                                        {profileSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={fetchPatientProfile}
                                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                                </form>
                            </div>

                            {/* Security Management */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-5">Security Management</h3>
                                <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            name="current-password"
                                            autoComplete="current-password"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="new-password"
                                            autoComplete="new-password"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirm-password"
                                            autoComplete="new-password"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                                    <ul className="text-sm text-gray-600 space-y-1 pl-5 list-disc">
                                        <li>At least 8 characters long</li>
                                        <li>Contains uppercase and lowercase letters</li>
                                        <li>Includes at least one number</li>
                                        <li>Contains at least one special character</li>
                                    </ul>
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                        Update Password
                                    </button>
                                </div>
                                </form>
                            </div>

                            {/* Emergency Contact */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-5">Emergency Contact</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Name
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue=""
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            placeholder="Full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Phone
                                        </label>
                                        <input
                                            type="tel"
                                            defaultValue=""
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Relationship
                                        </label>
                                        <select defaultValue="" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                            <option value="">Select relationship</option>
                                            <option value="spouse">Spouse</option>
                                            <option value="parent">Parent</option>
                                            <option value="sibling">Sibling</option>
                                            <option value="child">Child</option>
                                            <option value="friend">Friend</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                        Save Emergency Contact
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* AI Summary Modal */}
            {viewingSummary && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-4xl w-full my-8 shadow-2xl">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        <Brain className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">AI Document Summary</h2>
                                        <p className="text-purple-100 text-sm">Generated by Health Track AI</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setViewingSummary(null)}
                                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Urgency Badge */}
                            {viewingSummary.data.urgencyLevel && (
                                <div className="flex items-center space-x-2">
                                    <AlertCircle className={`w-5 h-5 ${
                                        viewingSummary.data.urgencyLevel === 'high' ? 'text-red-500' :
                                        viewingSummary.data.urgencyLevel === 'medium' || viewingSummary.data.urgencyLevel === 'moderate' ? 'text-yellow-500' :
                                        'text-green-500'
                                    }`} />
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        viewingSummary.data.urgencyLevel === 'high' ? 'bg-red-100 text-red-700' :
                                        viewingSummary.data.urgencyLevel === 'medium' || viewingSummary.data.urgencyLevel === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                        {viewingSummary.data.urgencyLevel.charAt(0).toUpperCase() + viewingSummary.data.urgencyLevel.slice(1)} Priority
                                    </span>
                                </div>
                            )}

                            {/* Red Flags / Clinical Alerts */}
                            {viewingSummary.data.redFlags && viewingSummary.data.redFlags.length > 0 && (
                                <div className="rounded-xl border border-red-200 overflow-hidden">
                                    <div className="bg-red-50 px-5 py-3 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                        <h3 className="text-base font-semibold text-red-800">Clinical Alerts — {viewingSummary.data.redFlags.length} found</h3>
                                    </div>
                                    <ul className="divide-y divide-red-100">
                                        {viewingSummary.data.redFlags.map((flag, i) => (
                                            <li key={i} className={`flex items-center gap-3 px-5 py-3 ${flag.severity === 'error' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                                                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${flag.severity === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                                                <span className={`text-sm font-medium ${flag.severity === 'error' ? 'text-red-700' : 'text-yellow-700'}`}>
                                                    {flag.severity === 'error' ? '⛔ ALERT' : '⚠ NOTICE'}: {flag.description}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Patient Info Card */}
                            {viewingSummary.data.patientInfo && Object.keys(viewingSummary.data.patientInfo).length > 0 && (
                                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                                    <h3 className="text-base font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4 text-blue-600" />
                                        Patient Information
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {Object.entries(viewingSummary.data.patientInfo).map(([k, v]) => (
                                            <div key={k} className="bg-white rounded-lg p-3 border border-blue-100">
                                                <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">{k}</p>
                                                <p className="text-sm text-gray-800 font-semibold mt-0.5">{v}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Summary Section */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                                    Summary
                                </h3>
                                <p className="text-gray-700 leading-relaxed">{viewingSummary.data.summary}</p>
                                {(viewingSummary.data.wordCount || viewingSummary.data.sentenceCount) && (
                                    <div className="flex gap-4 mt-3 pt-3 border-t border-blue-200">
                                        {viewingSummary.data.wordCount && <span className="text-xs text-gray-500">{viewingSummary.data.wordCount.toLocaleString()} words</span>}
                                        {viewingSummary.data.sentenceCount && <span className="text-xs text-gray-500">{viewingSummary.data.sentenceCount} sentences</span>}
                                    </div>
                                )}
                            </div>

                            {/* Section Highlights */}
                            {viewingSummary.data.highlights && Object.keys(viewingSummary.data.highlights).length > 0 && (
                                <div className="bg-white rounded-xl p-5 border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
                                        Section Highlights
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(viewingSummary.data.highlights).map(([section, items]) => (
                                            <div key={section} className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                                                <h4 className="text-sm font-semibold text-indigo-800 mb-2">{section}</h4>
                                                <ul className="space-y-1">
                                                    {items.map((item, i) => (
                                                        <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Extracted Document Text */}
                            {viewingSummary.data.extractedText && (
                                <div className="bg-white rounded-xl p-5 border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                                        Document Text
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 max-h-60 overflow-y-auto">
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{viewingSummary.data.extractedText}</p>
                                    </div>
                                </div>
                            )}

                            {/* Key Findings */}
                            {viewingSummary.data.keyFindings && viewingSummary.data.keyFindings.length > 0 && (
                                <div className="bg-white rounded-xl p-5 border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                                        Key Findings
                                    </h3>
                                    <ul className="space-y-2">
                                        {viewingSummary.data.keyFindings.map((finding, index) => (
                                            <li key={index} className="flex items-start space-x-3">
                                                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                                                <span className="text-gray-700">{finding}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {/* Medical Terms */}
                            {viewingSummary.data.medicalTerms && viewingSummary.data.medicalTerms.length > 0 && (
                                <div className="bg-white rounded-xl p-5 border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Brain className="w-5 h-5 mr-2 text-purple-600" />
                                        Medical Terms Explained
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {viewingSummary.data.medicalTerms.map((term, index) => (
                                            <div key={index} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                                <h4 className="font-semibold text-purple-900 mb-1">{term.term}</h4>
                                                <p className="text-sm text-gray-700">{term.explanation}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Recommendations */}
                            {viewingSummary.data.recommendations && viewingSummary.data.recommendations.length > 0 && (
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-5 border border-green-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Sparkles className="w-5 h-5 mr-2 text-green-600" />
                                        Recommendations
                                    </h3>
                                    <ul className="space-y-3">
                                        {viewingSummary.data.recommendations.map((recommendation, index) => (
                                            <li key={index} className="flex items-start space-x-3 bg-white p-3 rounded-lg">
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">{recommendation}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {/* Timestamp */}
                            {viewingSummary.data.summarizedAt && (
                                <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                                    Summary generated on {new Date(viewingSummary.data.summarizedAt).toLocaleString()}
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Note:</span> This summary is generated by AI and should be reviewed by healthcare professionals.
                                </p>
                                <button
                                    onClick={() => setViewingSummary(null)}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Medical-Summarizer File Analysis Modal */}
            {showMedicalFileSummaryModal && medicalFileSummaryResult && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-4xl w-full my-8 shadow-2xl">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center">
                                        <Brain className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Medical Record Analysis</h2>
                                        <p className="text-violet-200 text-xs mt-0.5 truncate max-w-xs">
                                            {medicalFileSummaryResult.filename} &nbsp;·&nbsp; {medicalFileSummaryResult.word_count?.toLocaleString()} words &nbsp;·&nbsp; {medicalFileSummaryResult.sentence_count} sentences
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowMedicalFileSummaryModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
                            {/* Urgency */}
                            <div className="flex items-center gap-3">
                                <AlertCircle className={`w-5 h-5 ${medicalFileSummaryResult.urgency_level === 'high' ? 'text-red-500' : medicalFileSummaryResult.urgency_level === 'moderate' ? 'text-yellow-500' : 'text-green-500'}`} />
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${medicalFileSummaryResult.urgency_level === 'high' ? 'bg-red-100 text-red-700' : medicalFileSummaryResult.urgency_level === 'moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                    {medicalFileSummaryResult.urgency_level?.charAt(0).toUpperCase() + medicalFileSummaryResult.urgency_level?.slice(1)} Priority
                                </span>
                                <span className="ml-auto text-xs text-gray-400">{new Date(medicalFileSummaryResult.timestamp).toLocaleString()}</span>
                            </div>

                            {/* Red Flags */}
                            {medicalFileSummaryResult.red_flags?.length > 0 && (
                                <div className="rounded-xl border border-red-200 overflow-hidden">
                                    <div className="bg-red-50 px-5 py-3 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-600" />
                                        <span className="text-sm font-semibold text-red-800">Clinical Alerts &mdash; {medicalFileSummaryResult.red_flags.length} found</span>
                                    </div>
                                    <ul className="divide-y divide-red-100">
                                        {medicalFileSummaryResult.red_flags.map((f, i) => (
                                            <li key={i} className={`flex items-center gap-3 px-5 py-2.5 ${f.severity === 'error' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${f.severity === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                                                <span className={`text-sm ${f.severity === 'error' ? 'text-red-700 font-medium' : 'text-yellow-700'}`}>
                                                    {f.severity === 'error' ? '⛔ ALERT' : '⚠ NOTICE'}: {f.description}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Patient Info */}
                            {medicalFileSummaryResult.patient_info && Object.keys(medicalFileSummaryResult.patient_info).length > 0 && (
                                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                                    <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4 text-blue-600" /> Patient Information
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {Object.entries(medicalFileSummaryResult.patient_info).map(([k, v]) => (
                                            <div key={k} className="bg-white rounded-lg p-3 border border-blue-100">
                                                <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">{k}</p>
                                                <p className="text-sm text-gray-800 font-semibold mt-0.5">{v}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-200">
                                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-violet-600" /> Clinical Summary
                                </h3>
                                <p className="text-gray-700 text-sm leading-relaxed">{medicalFileSummaryResult.summary}</p>
                            </div>

                            {/* Section Highlights */}
                            {medicalFileSummaryResult.highlights && Object.keys(medicalFileSummaryResult.highlights).length > 0 && (
                                <div className="bg-white rounded-xl p-5 border border-gray-200">
                                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-indigo-600" /> Section Highlights
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(medicalFileSummaryResult.highlights).map(([section, items]) => (
                                            <div key={section} className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                                                <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wide mb-2">{section}</h4>
                                                <ul className="space-y-1">
                                                    {items.map((item, i) => (
                                                        <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Parsed Sections */}
                            {medicalFileSummaryResult.sections && Object.keys(medicalFileSummaryResult.sections).filter(k => k !== 'General').length > 0 && (
                                <div className="bg-white rounded-xl p-5 border border-gray-200">
                                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileBarChart className="w-4 h-4 text-teal-600" /> Parsed Clinical Sections
                                    </h3>
                                    <div className="space-y-3">
                                        {Object.entries(medicalFileSummaryResult.sections)
                                            .filter(([k]) => k !== 'General')
                                            .map(([section, content]) => (
                                                <details key={section} className="bg-teal-50 rounded-lg border border-teal-100">
                                                    <summary className="px-4 py-2.5 text-sm font-medium text-teal-800 cursor-pointer select-none">{section}</summary>
                                                    <div className="px-4 pb-3 pt-1">
                                                        <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
                                                    </div>
                                                </details>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-5 bg-gray-50 rounded-b-xl border-t border-gray-200 flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                <span className="font-medium">Note:</span> Extractive AI analysis. Always review with a qualified clinician.
                            </p>
                            <button
                                onClick={() => setShowMedicalFileSummaryModal(false)}
                                className="bg-violet-600 text-white px-5 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Book Appointment Modal */}
            {showAppointmentModal && (
                <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
                                    <p className="text-sm text-gray-600 mt-1">Select doctor, date, and time slot</p>
                                </div>
                                <button
                                    onClick={() => setShowAppointmentModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Message Display */}
                            {appointmentMessage.text && (
                                <div className={`p-4 rounded-lg ${
                                    appointmentMessage.type === 'success' 
                                        ? 'bg-green-50 text-green-800 border border-green-200' 
                                        : appointmentMessage.type === 'info'
                                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                        : 'bg-red-50 text-red-800 border border-red-200'
                                }`}>
                                    {appointmentMessage.text}
                                </div>
                            )}

                            {/* Step 1: Select Specialty */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-3">
                                    1. Select Specialty
                                </label>
                                {loadingDoctors ? (
                                    <div className="flex items-center justify-center py-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-3 text-gray-600">Loading doctors...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {specialties.map((specialty) => (
                                            <button
                                                key={specialty}
                                                onClick={() => setSelectedSpecialty(specialty)}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                    selectedSpecialty === specialty
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {specialty}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Step 2: Select Doctor */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-3">
                                    2. Select Doctor
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(selectedSpecialty === 'All' 
                                        ? doctors 
                                        : groupedDoctors[selectedSpecialty] || []
                                    ).map((doctor) => (
                                        <button
                                            key={doctor._id}
                                            onClick={() => handleDoctorSelect(doctor)}
                                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                                                selectedDoctor?._id === doctor._id
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300 bg-white'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold text-gray-900">{doctor.name}</p>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                                                    #{doctor.userId || doctor._id?.slice(-6)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {doctor.specialization || 'General'}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                                {selectedSpecialty !== 'All' && 
                                    (!groupedDoctors[selectedSpecialty] || groupedDoctors[selectedSpecialty].length === 0) && (
                                    <p className="text-gray-500 text-center py-4">No doctors available for this specialty</p>
                                )}
                            </div>

                            {/* AI-Suggested Slots Section */}
                            {selectedDoctor && aiSuggestedSlots.length > 0 && (
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Brain className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">AI-Recommended Slots</h3>
                                            <p className="text-xs text-gray-600">Based on your history and doctor's availability</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {aiSuggestedSlots.slice(0, 6).map((slot, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleBookAISlot(slot)}
                                                disabled={bookingAppointment}
                                                className="p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all text-left disabled:opacity-50"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-gray-900">
                                                        {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                                        {Math.round(slot.score * 10)}% match
                                                    </span>
                                                </div>
                                                <p className="text-blue-600 font-semibold">{slot.time}</p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{slot.reason}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            {selectedDoctor && aiSuggestedSlots.length > 0 && (
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-px bg-gray-200"></div>
                                    <span className="text-sm text-gray-500">Or select manually</span>
                                    <div className="flex-1 h-px bg-gray-200"></div>
                                </div>
                            )}

                            {/* Step 3: Select Date */}
                            {selectedDoctor && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-3">
                                        3. Select Date
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => handleDateSelect(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            )}

                            {/* Step 4: Select Time Slot */}
                            {selectedDoctor && selectedDate && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-3">
                                        4. Select Time Slot (9:00 AM - 5:00 PM)
                                    </label>
                                    {loadingSlots ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="ml-3 text-gray-600">Loading available slots...</span>
                                        </div>
                                    ) : availableSlots.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-600">No available slots for this date</p>
                                            <p className="text-sm text-gray-500 mt-1">Please try another date</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                            {availableSlots.map((slot) => (
                                                <button
                                                    key={slot}
                                                    onClick={() => handleBookTimeSlot(slot)}
                                                    disabled={bookingAppointment}
                                                    className="px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Booking Status */}
                            {bookingAppointment && (
                                <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <span className="ml-3 text-gray-600">Booking appointment...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Appointment Modal */}
            {showRescheduleModal && (
                <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Reschedule Appointment</h2>
                                <button
                                    onClick={() => setShowRescheduleModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            {rescheduleData.appointment && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">Current Appointment:</span>{' '}
                                        {new Date(rescheduleData.appointment.date).toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })} at {rescheduleData.appointment.timeSlot}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            {appointmentMessage.text && (
                                <div className={`mb-4 p-4 rounded-lg ${
                                    appointmentMessage.type === 'success' 
                                        ? 'bg-green-50 text-green-800 border border-green-200' 
                                        : 'bg-red-50 text-red-800 border border-red-200'
                                }`}>
                                    {appointmentMessage.text}
                                </div>
                            )}

                            {loadingSlots ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    <span className="ml-4 text-gray-600">Finding alternative time slots...</span>
                                </div>
                            ) : rescheduleData.suggestedSlots.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">No alternative slots found. Please try again later.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-blue-800 flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            AI-recommended alternative slots close to your original appointment time
                                        </p>
                                    </div>
                                    {rescheduleData.suggestedSlots.map((slot, index) => (
                                        <div 
                                            key={index} 
                                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Calendar className="w-5 h-5 text-blue-600" />
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                {new Date(slot.date).toLocaleDateString('en-US', { 
                                                                    weekday: 'long', 
                                                                    year: 'numeric', 
                                                                    month: 'long', 
                                                                    day: 'numeric' 
                                                                })}
                                                            </p>
                                                            <p className="text-sm text-gray-600">{slot.time}</p>
                                                        </div>
                                                    </div>
                                                    <div className="ml-8">
                                                        <p className="text-sm text-gray-700 mb-2">
                                                            <span className="font-medium">AI Score:</span>{' '}
                                                            <span className={`font-semibold ${
                                                                slot.score >= 8 ? 'text-green-600' :
                                                                slot.score >= 6 ? 'text-blue-600' :
                                                                'text-yellow-600'
                                                            }`}>
                                                                {slot.score.toFixed(1)}/10
                                                            </span>
                                                        </p>
                                                        <p className="text-sm text-gray-600">{slot.reason}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRescheduleAppointment(slot)}
                                                    disabled={bookingAppointment}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                                                >
                                                    {bookingAppointment ? 'Updating...' : 'Reschedule'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* === AI Summary History Modal === */}
            {showSummaryHistoryModal && batchSummaryResult && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Brain className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">AI Medical Summary</h2>
                                        <p className="text-sm text-gray-500">
                                            {batchSummaryResult.processed_documents} of {batchSummaryResult.total_documents} records analyzed
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleDownloadSummaryPDF}
                                        disabled={generatingPdfReport}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50"
                                    >
                                        {generatingPdfReport ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Generating PDF...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4" />
                                                <span>Download PDF</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowSummaryHistoryModal(false)}
                                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Individual Document Summaries */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    Document Summaries
                                </h3>
                                <div className="space-y-4">
                                    {batchSummaryResult.summaries?.map((doc, index) => {
                                        const urgencyColors = {
                                            high: 'bg-red-100 text-red-700 border-red-200',
                                            moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                                            low: 'bg-green-100 text-green-700 border-green-200'
                                        };
                                        const urgencyLevel = (doc.urgency_level || 'low').toLowerCase();
                                        const typeColors = {
                                            'lab-report': 'from-blue-500 to-blue-600',
                                            'prescription': 'from-purple-500 to-purple-600',
                                            'scan': 'from-pink-500 to-pink-600',
                                            'consultation': 'from-green-500 to-green-600',
                                            'other': 'from-gray-500 to-gray-600'
                                        };
                                        const typeColor = typeColors[doc.document_type] || typeColors.other;

                                        return (
                                            <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                                {/* Document Header */}
                                                <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-100">
                                                    <div className={`w-10 h-10 bg-gradient-to-br ${typeColor} rounded-lg flex items-center justify-center shadow-md flex-shrink-0`}>
                                                        <FileText className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                                                            {doc.document_name || `Document ${index + 1}`}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs text-gray-500 capitalize">
                                                                {(doc.document_type || 'other').replace('-', ' ')}
                                                            </span>
                                                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${urgencyColors[urgencyLevel] || urgencyColors.low}`}>
                                                                {urgencyLevel === 'high' ? '🔴' : urgencyLevel === 'moderate' ? '🟡' : '🟢'} {urgencyLevel}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Document Content */}
                                                <div className="p-4 space-y-3">
                                                    {/* Summary */}
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Summary</p>
                                                        <p className="text-sm text-gray-700 leading-relaxed">
                                                            {doc.summary || 'No summary available.'}
                                                        </p>
                                                    </div>

                                                    {/* Key Findings */}
                                                    {doc.key_findings && doc.key_findings.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Key Findings</p>
                                                            <ul className="space-y-1">
                                                                {doc.key_findings.slice(0, 5).map((finding, fi) => (
                                                                    <li key={fi} className="flex items-start gap-2 text-sm text-gray-600">
                                                                        <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                                                                        <span>{finding}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Recommendations */}
                                                    {doc.recommendations && doc.recommendations.length > 0 && (
                                                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Recommendations</p>
                                                            <ul className="space-y-1">
                                                                {doc.recommendations.slice(0, 3).map((rec, ri) => (
                                                                    <li key={ri} className="flex items-start gap-2 text-sm text-blue-700">
                                                                        <span className="text-blue-400 mt-0.5 flex-shrink-0">→</span>
                                                                        <span>{rec}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                                ⚠️ AI-generated summaries are for reference only. Consult your healthcare provider for medical advice.
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownloadSummaryPDF}
                                    disabled={generatingPdfReport}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>{generatingPdfReport ? 'Generating...' : 'Download PDF Report'}</span>
                                </button>
                                <button
                                    onClick={() => setShowSummaryHistoryModal(false)}
                                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;
