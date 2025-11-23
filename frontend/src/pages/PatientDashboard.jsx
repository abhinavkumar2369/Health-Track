import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_URL = `${API_BASE_URL}/api/documents`;

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeSection, setActiveSection] = useState('dashboard');
    
    // Medical records state
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
    const [isDragging, setIsDragging] = useState(false);

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

    const handleLogout = () => {
        localStorage.removeItem('user');
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
        <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                            Health Track
                        </h1>
                        <p className="text-xs text-gray-500">Patient Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                    { id: 'appointments', label: 'Appointments', icon: '📅' },
                    { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
                    { id: 'records', label: 'Medical Records', icon: '📄' },
                    { id: 'reports', label: 'Health Reports', icon: '📈' },
                    { id: 'profile', label: 'My Profile', icon: '👤' }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                            activeSection === item.id
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-sm">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* User Profile Section */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user?.fullName?.[0] || user?.email?.[0] || 'P'}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName || user?.email || 'Patient'}</p>
                        <p className="text-xs text-gray-500">Patient</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            
            {/* Main Content Area */}
            <div className="flex-1 ml-64">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {activeSection === 'dashboard' && 'Dashboard'}
                                {activeSection === 'appointments' && 'My Appointments'}
                                {activeSection === 'prescriptions' && 'My Prescriptions'}
                                {activeSection === 'records' && 'Medical Records'}
                                {activeSection === 'reports' && 'Health Reports'}
                                {activeSection === 'profile' && 'My Profile'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-8 overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
                    {activeSection === 'dashboard' && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-4xl">📅</span>
                                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">+2 this week</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">5</h3>
                                    <p className="text-sm text-gray-600">Upcoming Appointments</p>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-4xl">💊</span>
                                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">3 active</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">12</h3>
                                    <p className="text-sm text-gray-600">Total Prescriptions</p>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-4xl">📄</span>
                                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">{medicalRecords.length} files</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">{medicalRecords.length}</h3>
                                    <p className="text-sm text-gray-600">Medical Records</p>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-4xl">📈</span>
                                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Good</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">85%</h3>
                                    <p className="text-sm text-gray-600">Health Score</p>
                                </div>
                            </div>

                            {/* Health Metrics Chart */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Metrics Trend</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center text-2xl">❤️</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-medium text-gray-700">Blood Pressure</span>
                                                    <span className="text-sm font-semibold text-gray-900">120/80 mmHg</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Normal range</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">🩺</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-medium text-gray-700">Heart Rate</span>
                                                    <span className="text-sm font-semibold text-gray-900">72 bpm</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '68%'}}></div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Optimal</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-yellow-50 rounded-lg flex items-center justify-center text-2xl">🌡️</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-medium text-gray-700">Body Temperature</span>
                                                    <span className="text-sm font-semibold text-gray-900">98.6°F</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '85%'}}></div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Normal</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-purple-50 rounded-lg flex items-center justify-center text-2xl">⚖️</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-medium text-gray-700">Weight</span>
                                                    <span className="text-sm font-semibold text-gray-900">70 kg</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '60%'}}></div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Healthy weight</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Upcoming Appointments */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
                                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">👨‍⚕️</div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900">Dr. Sarah Johnson</h4>
                                                <p className="text-xs text-gray-600">General Checkup</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className="text-xs text-blue-600">📅 Dec 20, 2024</span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-blue-600">⏰ 10:00 AM</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">🦷</div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900">Dr. Michael Chen</h4>
                                                <p className="text-xs text-gray-600">Dental Cleaning</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className="text-xs text-green-600">📅 Dec 22, 2024</span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-green-600">⏰ 2:00 PM</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">👁️</div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900">Dr. Emily Davis</h4>
                                                <p className="text-xs text-gray-600">Eye Examination</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className="text-xs text-purple-600">📅 Dec 25, 2024</span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-purple-600">⏰ 11:30 AM</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button className="w-full py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                                            + Book New Appointment
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                                <div className="space-y-4">
                                    {[
                                        { icon: '📄', action: 'Medical record uploaded', detail: 'Blood Test Results.pdf', time: '2 hours ago', color: 'blue' },
                                        { icon: '💊', action: 'Prescription refilled', detail: 'Amoxicillin 500mg', time: '5 hours ago', color: 'green' },
                                        { icon: '📅', action: 'Appointment booked', detail: 'Dr. Sarah Johnson - General Checkup', time: '1 day ago', color: 'purple' },
                                        { icon: '📋', action: 'Lab test completed', detail: 'Complete Blood Count', time: '2 days ago', color: 'orange' }
                                    ].map((activity, index) => (
                                        <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                            <div className={`w-10 h-10 bg-${activity.color}-50 rounded-lg flex items-center justify-center text-xl flex-shrink-0`}>
                                                {activity.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                                <p className="text-xs text-gray-600">{activity.detail}</p>
                                            </div>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                {activeSection === 'appointments' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">My Appointments</h3>
                                    <p className="text-sm text-gray-600 mt-1">Manage and track your medical appointments</p>
                                </div>
                                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2">
                                    <span>+</span>
                                    <span>Book Appointment</span>
                                </button>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="space-y-4">
                                    {/* Sample Appointment Cards */}
                                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">👨‍⚕️</div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Dr. Sarah Johnson</h4>
                                                <p className="text-sm text-gray-600">General Checkup</p>
                                                <div className="flex items-center space-x-3 mt-2">
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">📅 Dec 20, 2024</span>
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">⏰ 10:00 AM</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">View</button>
                                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Reschedule</button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-xl hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center text-2xl">🦷</div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Dr. Michael Chen</h4>
                                                <p className="text-sm text-gray-600">Dental Cleaning</p>
                                                <div className="flex items-center space-x-3 mt-2">
                                                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">📅 Dec 22, 2024</span>
                                                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">⏰ 2:00 PM</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">View</button>
                                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Reschedule</button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-100 rounded-xl hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">👁️</div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Dr. Emily Davis</h4>
                                                <p className="text-sm text-gray-600">Eye Examination</p>
                                                <div className="flex items-center space-x-3 mt-2">
                                                    <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">📅 Dec 25, 2024</span>
                                                    <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">⏰ 11:30 AM</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">View</button>
                                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Reschedule</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Past Appointments */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Appointments</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xl">👨‍⚕️</div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Dr. Robert Smith</h4>
                                                <p className="text-sm text-gray-600">Annual Physical</p>
                                                <span className="text-xs text-gray-500">Dec 10, 2024 - Completed</span>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">View Details</button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xl">🩺</div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Dr. Lisa Wong</h4>
                                                <p className="text-sm text-gray-600">Cardiology Consultation</p>
                                                <span className="text-xs text-gray-500">Nov 28, 2024 - Completed</span>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">View Details</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                {activeSection === 'prescriptions' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">My Prescriptions</h3>
                                    <p className="text-sm text-gray-600 mt-1">View and manage your prescriptions</p>
                                </div>
                                <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                                    Request Refill
                                </button>
                            </div>

                            {/* Active Prescriptions */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Prescriptions</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-xl">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center text-2xl">💊</div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Amoxicillin 500mg</h4>
                                                <p className="text-sm text-gray-600">Take 3 times daily with food</p>
                                                <div className="flex items-center space-x-3 mt-2">
                                                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">15 pills remaining</span>
                                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">Refill in 5 days</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Refill</button>
                                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Details</button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">💊</div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Lisinopril 10mg</h4>
                                                <p className="text-sm text-gray-600">Take once daily in the morning</p>
                                                <div className="flex items-center space-x-3 mt-2">
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">28 pills remaining</span>
                                                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">Good supply</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Refill</button>
                                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Details</button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-100 rounded-xl">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">💊</div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Metformin 850mg</h4>
                                                <p className="text-sm text-gray-600">Take twice daily with meals</p>
                                                <div className="flex items-center space-x-3 mt-2">
                                                    <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">45 pills remaining</span>
                                                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">Good supply</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">Refill</button>
                                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Details</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Past Prescriptions */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Prescriptions</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xl">💊</div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Ibuprofen 400mg</h4>
                                                <p className="text-sm text-gray-600">Completed on Nov 15, 2024</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">View Details</button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xl">💊</div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Azithromycin 250mg</h4>
                                                <p className="text-sm text-gray-600">Completed on Oct 28, 2024</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">View Details</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                {activeSection === 'records' && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Upload New Record Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Upload New Record</h3>
                            </div>
                            <div className="p-6">
                                {uploadMessage.text && (
                                    <div className={`mb-4 p-4 rounded-lg ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                        {uploadMessage.text}
                                    </div>
                                )}
                                
                                <div 
                                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                                        isDragging ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                                    }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('file-upload').click()}
                                >
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        onChange={handleFileSelect}
                                    />
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                                        {selectedFile ? selectedFile.name : 'Upload Your Medical Record'}
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {selectedFile ? `Size: ${formatFileSize(selectedFile.size)}` : 'Drag and drop your medical record here, or click to browse'}
                                    </p>
                                    <p className="text-xs text-gray-500">Supports: PDF, JPG, PNG, DOC (Max: 25MB)</p>
                                </div>
                                
                                {selectedFile && (
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={handleFileUpload}
                                            disabled={uploading}
                                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2"
                                        >
                                            {uploading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    <span>Upload Record</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Uploaded Records Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900">My Medical Records</h3>
                            </div>
                            <div className="p-6">
                                {medicalRecords.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-2">No medical records yet</h4>
                                        <p className="text-sm text-gray-500">Upload your first medical record to get started</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {medicalRecords.map((record) => {
                                            const getStatusColor = (status) => {
                                                switch(status) {
                                                    case 'verified': return 'bg-green-100 text-green-800';
                                                    case 'under-review': return 'bg-yellow-100 text-yellow-800';
                                                    default: return 'bg-gray-100 text-gray-800';
                                                }
                                            };
                                            
                                            const getIconColor = (category) => {
                                                switch(category) {
                                                    case 'lab-report': return 'bg-blue-100 text-blue-600';
                                                    case 'prescription': return 'bg-purple-100 text-purple-600';
                                                    case 'scan': return 'bg-pink-100 text-pink-600';
                                                    case 'consultation': return 'bg-green-100 text-green-600';
                                                    default: return 'bg-gray-100 text-gray-600';
                                                }
                                            };
                                            
                                            return (
                                                <div key={record._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                                                    <div className="flex items-center space-x-4">
                                                        <div className={`w-12 h-12 ${getIconColor(record.category)} rounded-lg flex items-center justify-center`}>
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{record.title || record.originalName}</h4>
                                                            <p className="text-sm text-gray-500">
                                                                Uploaded on {formatDate(record.createdAt)} • {formatFileSize(record.fileSize)}
                                                            </p>
                                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(record.status)}`}>
                                                                {record.status === 'under-review' ? 'Under Review' : record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button 
                                                            onClick={() => handleViewDocument(record._id)}
                                                            className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                                        >
                                                            View
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDownloadDocument(record._id)}
                                                            className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
                                                        >
                                                            Download
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteDocument(record._id)}
                                                            className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                                        >
                                                            Delete
                                                        </button>
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
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">Health Reports</h3>
                                    <p className="text-sm text-gray-600 mt-1">Generate and view comprehensive health reports</p>
                                </div>
                                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2">
                                    <span>📊</span>
                                    <span>Generate Report</span>
                                </button>
                            </div>

                            {/* Report Generation Card */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-8 text-center">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                                    📊
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Health Summary</h3>
                                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                                    Generate a comprehensive report including medical records, test results, appointments, prescriptions, and health metrics.
                                </p>
                                <div className="flex justify-center space-x-3">
                                    <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-lg">
                                        Generate Full Report
                                    </button>
                                    <button className="px-8 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all">
                                        Customize Report
                                    </button>
                                </div>
                            </div>

                            {/* Generated Reports */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Health Reports</h3>
                                <div className="space-y-3">
                                    {[
                                        { title: 'December 2024 Health Summary', type: 'Monthly', date: 'Jan 1, 2025', pages: '12', color: 'blue' },
                                        { title: '2024 Annual Health Report', type: 'Annual', date: 'Dec 31, 2024', pages: '45', color: 'green' },
                                        { title: 'Cardiology Focus Report', type: 'Custom', date: 'Dec 28, 2024', pages: '8', color: 'purple' },
                                        { title: 'November 2024 Health Summary', type: 'Monthly', date: 'Dec 1, 2024', pages: '10', color: 'blue' }
                                    ].map((report, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-14 h-14 bg-${report.color}-100 rounded-xl flex items-center justify-center text-2xl`}>
                                                    📄
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{report.title}</h4>
                                                    <p className="text-sm text-gray-600">{report.type} Report • Generated on {report.date} • {report.pages} pages</p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className={`text-xs bg-${report.color}-100 text-${report.color}-700 px-2 py-1 rounded-full`}>{report.type}</span>
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Complete</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm">View</button>
                                                <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm">Download</button>
                                                <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm">Share</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'profile' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                                            {user?.fullName?.[0] || user?.email?.[0] || 'P'}
                                        </div>
                                        <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium">
                                            Change Photo
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                value={user?.fullName || ''}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                readOnly
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                readOnly
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                            <input
                                                type="tel"
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                            <input
                                                type="date"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                            <textarea
                                                rows="3"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter your address"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                                            Cancel
                                        </button>
                                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter emergency contact name"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                                        <input
                                            type="tel"
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Spouse, Parent, Sibling"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                                        Save Emergency Contact
                                    </button>
                                </div>
                            </div>

                            {/* Security Settings */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Change Password</h4>
                                            <p className="text-sm text-gray-600">Update your password regularly for security</p>
                                        </div>
                                        <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium">
                                            Change
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                                            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                                        </div>
                                        <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm font-medium">
                                            Enable
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;