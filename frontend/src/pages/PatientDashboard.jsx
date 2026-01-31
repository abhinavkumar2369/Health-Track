import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { documentAPI, patientAPI } from '../services/api';
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
    const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
    const [isDragging, setIsDragging] = useState(false);
    
    // Health reports state
    const [generatingReport, setGeneratingReport] = useState(false);
    const [healthReports, setHealthReports] = useState([]);
    
    // Document summary state
    const [summarizing, setSummarizing] = useState({});
    const [summaries, setSummaries] = useState({});
    const [viewingSummary, setViewingSummary] = useState(null);
    
    // Appointment state
    const [appointments, setAppointments] = useState([]);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [aiSuggestedSlots, setAiSuggestedSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [bookingAppointment, setBookingAppointment] = useState(false);
    const [appointmentMessage, setAppointmentMessage] = useState({ type: '', text: '' });
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [rescheduleData, setRescheduleData] = useState(null);
    
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
    }, [navigate]);

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
            setUploadMessage({ type: '', text: '' });
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            setUploadMessage({ type: 'error', text: 'Please select a file first' });
            return;
        }

        setUploading(true);
        setUploadMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            
            const formData = new FormData();
            formData.append('document', selectedFile);
            formData.append('token', token);
            formData.append('category', 'other');
            formData.append('description', `Uploaded ${selectedFile.name}`);

            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setUploadMessage({ type: 'success', text: 'Document uploaded successfully!' });
                setSelectedFile(null);
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
        
        // If date is already selected, fetch slots
        if (selectedDate) {
            await fetchAvailableSlots(doctor._id, selectedDate);
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
            });

            if (response.data.success) {
                const report = response.data.report;
                
                setUploadMessage({ 
                    type: 'success', 
                    text: `Health report generated successfully! ${report.totalDocuments} documents analyzed, ${report.summarizedDocuments} with AI summaries.`
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
                                    <p className="text-sm text-gray-600 mt-1">Manage your appointments with AI assistance</p>
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
                    <div className="space-y-6">
                        {/* Upload Message */}
                        {uploadMessage.text && (
                            <div className={`p-3 rounded-lg text-sm ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                {uploadMessage.text}
                            </div>
                        )}

                        {/* Medical Records with Upload Button */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">My Medical Records</h3>
                                        <p className="text-sm text-gray-600">
                                            {medicalRecords.length} {medicalRecords.length === 1 ? 'Record' : 'Records'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => document.getElementById('file-upload').click()}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-medium"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>Upload Document</span>
                                </button>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    onChange={handleFileSelect}
                                />
                            </div>

                            {/* Selected File Info & Upload */}
                            {selectedFile && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                                                <p className="text-sm text-gray-600">Size: {formatFileSize(selectedFile.size)}</p>
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

                            <div>
                                {medicalRecords.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <FileText className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">No medical records yet</h4>
                                        <p className="text-sm text-gray-500">Upload your first medical record to get started</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {medicalRecords.map((record) => {
                                            const getStatusColor = (status) => {
                                                switch(status) {
                                                    case 'verified': return 'bg-green-100 text-green-700 border-green-200';
                                                    case 'under-review': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
                                                    default: return 'bg-gray-100 text-gray-700 border-gray-200';
                                                }
                                            };
                                            
                                            const getIconColor = (category) => {
                                                switch(category) {
                                                    case 'lab-report': return 'bg-gradient-to-br from-blue-500 to-blue-600';
                                                    case 'prescription': return 'bg-gradient-to-br from-purple-500 to-purple-600';
                                                    case 'scan': return 'bg-gradient-to-br from-pink-500 to-pink-600';
                                                    case 'consultation': return 'bg-gradient-to-br from-green-500 to-green-600';
                                                    default: return 'bg-gradient-to-br from-gray-500 to-gray-600';
                                                }
                                            };
                                            
                                            return (
                                                <div key={record._id} className="group bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-gray-300 transition-all">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                                            <div className={`w-12 h-12 ${getIconColor(record.category)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                                                                <FileText className="w-6 h-6 text-white" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                                    <h4 className="font-semibold text-gray-900 text-base truncate">{record.title || record.originalName}</h4>
                                                                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(record.status)} flex-shrink-0`}>
                                                                        {record.status === 'under-review' ? 'Pending' : record.status === 'verified' ? 'Verified' : record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mb-3">
                                                                    {formatDate(record.createdAt)} • {formatFileSize(record.fileSize)}
                                                                </p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    <button 
                                                                        onClick={() => handleViewDocument(record._id)}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                                                    >
                                                                        <Eye className="w-3.5 h-3.5" />
                                                                        <span>View</span>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDownloadDocument(record._id)}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                                                    >
                                                                        <Download className="w-3.5 h-3.5" />
                                                                        <span>Download</span>
                                                                    </button>
                                                                    {record.isSummarized ? (
                                                                        <button 
                                                                            onClick={() => handleViewSummary(record._id)}
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                                                                        >
                                                                            <Brain className="w-3.5 h-3.5" />
                                                                            <span>Summary</span>
                                                                        </button>
                                                                    ) : (
                                                                        <button 
                                                                            onClick={() => handleSummarizeDocument(record._id)}
                                                                            disabled={summarizing[record._id]}
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        >
                                                                            {summarizing[record._id] ? (
                                                                                <>
                                                                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                                    <span>Generating...</span>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Sparkles className="w-3.5 h-3.5" />
                                                                                    <span>Summarize</span>
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                    )}
                                                                    <button 
                                                                        onClick={() => handleDeleteDocument(record._id)}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                        <span>Delete</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'reports' && (
                    <div className="space-y-6">
                        {/* Page Header - Only Button */}
                        <div className="flex justify-end">
                            <button 
                                onClick={handleGenerateReport}
                                disabled={generatingReport}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {generatingReport ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <FileBarChart className="w-5 h-5" />
                                        <span>Generate New Report</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Alert Messages */}
                        {uploadMessage.text && uploadMessage.type && (
                            <div className={`p-4 rounded-lg border text-sm flex items-start space-x-3 ${
                                uploadMessage.type === 'success' 
                                    ? 'bg-green-50 border-green-300 text-green-800' 
                                    : 'bg-red-50 border-red-300 text-red-800'
                            }`}>
                                {uploadMessage.type === 'success' ? (
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">{uploadMessage.text}</div>
                            </div>
                        )}

                        {/* Generated Reports List */}
                        {healthReports.length > 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <FileBarChart className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">My Health Reports</h3>
                                            <p className="text-sm text-gray-600">
                                                {healthReports.length} {healthReports.length === 1 ? 'Report' : 'Reports'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {healthReports.map((report, index) => (
                                        <div 
                                            key={report.id || report._id} 
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                                        <span className="text-xl font-bold text-white">{healthReports.length - index}</span>
                                                    </div>
                                                </div>
                                                <div className="border-l border-gray-300 pl-4">
                                                    <p className="font-semibold text-gray-900">
                                                        {report.title || 'Health Summary Report'}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {new Date(report.generatedAt || report.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                    {report.fileSize && (
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            • {(report.fileSize / 1024).toFixed(1)} KB
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleViewReport(report.id || report._id)}
                                                    className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    title="View Report"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDownloadReport(report.id || report._id)}
                                                    className="p-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    title="Download Report"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileBarChart className="w-10 h-10 text-gray-400" />
                                </div>
                                <h4 className="text-xl font-semibold text-gray-800 mb-2">No Reports Generated Yet</h4>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    Generate your first comprehensive health report to get AI-powered insights from your medical records
                                </p>
                                <button 
                                    onClick={handleGenerateReport}
                                    disabled={generatingReport || medicalRecords.length === 0}
                                    className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed inline-flex items-center space-x-2"
                                >
                                    <FileBarChart className="w-5 h-5" />
                                    <span>{medicalRecords.length === 0 ? 'Upload Documents First' : 'Generate Your First Report'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Health Tracker Section */}
                {activeSection === 'vitals' && (
                    <div className="space-y-6">
                        {/* Page Header */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Health Tracker</h2>
                            <p className="text-gray-600 mt-1">Track your vital signs and monitor your health metrics</p>
                        </div>

                        {/* BMI Calculator */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">BMI Calculator</h3>
                                    <p className="text-sm text-gray-600">Calculate and track your Body Mass Index</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div className="space-y-6">
                            {/* Page Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                                    <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
                                </div>
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                    {user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'P'}
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="bg-white rounded-xl border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                                            <p className="text-gray-600">Update your personal details and information</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={user?.fullName || ''}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-gray-50"
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={user?.email || ''}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-gray-50"
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Date of Birth
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="date"
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Gender
                                            </label>
                                            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
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
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                    placeholder="City, State, Country"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
                                        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                            Save Changes
                                        </button>
                                        <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Security Management */}
                            <div className="bg-white rounded-xl border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Lock className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Security Management</h3>
                                            <p className="text-sm text-gray-500">Manage your password and account security</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="password"
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="password"
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="password"
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                                    placeholder="••••••••"
                                                />
                                            </div>
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
                                        <button className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                                            Update Password
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Management */}
                            <div className="bg-white rounded-xl border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Emergency Management</h3>
                                            <p className="text-sm text-gray-500">Add emergency contact information</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Contact Name
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                                    placeholder="Full name"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Contact Phone
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Relationship
                                            </label>
                                            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all">
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
                                        <button className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium">
                                            Save Emergency Contact
                                        </button>
                                    </div>
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
                                        viewingSummary.data.urgencyLevel === 'medium' ? 'text-yellow-500' :
                                        'text-green-500'
                                    }`} />
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        viewingSummary.data.urgencyLevel === 'high' ? 'bg-red-100 text-red-700' :
                                        viewingSummary.data.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                        {viewingSummary.data.urgencyLevel.charAt(0).toUpperCase() + viewingSummary.data.urgencyLevel.slice(1)} Priority
                                    </span>
                                </div>
                            )}
                            
                            {/* Summary Section */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                                    Summary
                                </h3>
                                <p className="text-gray-700 leading-relaxed">{viewingSummary.data.summary}</p>
                            </div>
                            
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
                                            <p className="font-semibold text-gray-900">{doctor.name}</p>
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
        </div>
    );
};

export default PatientDashboard;
