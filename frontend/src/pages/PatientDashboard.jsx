import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    X
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
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

    const handleGenerateReport = async () => {
        setGeneratingReport(true);
        setUploadMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.post(`${API_BASE_URL}/api/reports/generate`, { 
                token,
                includeRecords: true,
                includeAppointments: true,
                includePrescriptions: true,
                includeHealthMetrics: true
            });

            if (response.data.success) {
                setUploadMessage({ 
                    type: 'success', 
                    text: 'Health report generated successfully! The report has been saved to your account.' 
                });
                // Refresh the reports list
                const report = response.data.report;
                setHealthReports(prev => [report, ...prev]);
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
            
            if (response.data.success) {
                window.open(response.data.url, '_blank');
            }
        } catch (error) {
            console.error('View report error:', error);
            setUploadMessage({ type: 'error', text: 'Failed to view report' });
        }
    };

    const handleDownloadReport = async (reportId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/api/reports/download/${reportId}`, { token });
            
            if (response.data.success) {
                window.open(response.data.url, '_blank');
            }
        } catch (error) {
            console.error('Download report error:', error);
            setUploadMessage({ type: 'error', text: 'Failed to download report' });
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
                        { id: 'prescriptions', label: 'Prescriptions', Icon: Pill },
                        { id: 'records', label: 'Medical Records', Icon: FileText },
                        { id: 'reports', label: 'Health Reports', Icon: TrendingUp },
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
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
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
                                    {activeSection === 'prescriptions' && 'My Prescriptions'}
                                    {activeSection === 'records' && 'Medical Records'}
                                    {activeSection === 'reports' && 'Health Reports'}
                                    {activeSection === 'profile' && 'My Profile'}
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
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

                            {/* Quick Actions */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-4 sm:p-8">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-4">Welcome to Your Health Dashboard</h3>
                                <p className="text-sm text-gray-600 mb-4 sm:mb-6">Manage your health records, track appointments, and generate comprehensive health reports.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                    <button 
                                        onClick={() => setActiveSection('records')}
                                        className="flex items-center space-x-3 p-3 sm:p-4 bg-white rounded-lg hover:shadow-md transition-all border border-gray-200"
                                    >
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Upload className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900 text-sm sm:text-base">Upload Records</p>
                                            <p className="text-xs text-gray-500 hidden sm:block">Add medical documents</p>
                                        </div>
                                    </button>
                                    
                                    <button 
                                        onClick={() => setActiveSection('appointments')}
                                        className="flex items-center space-x-3 p-3 sm:p-4 bg-white rounded-lg hover:shadow-md transition-all border border-gray-200"
                                    >
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900 text-sm sm:text-base">Book Appointment</p>
                                            <p className="text-xs text-gray-500 hidden sm:block">Schedule with doctors</p>
                                        </div>
                                    </button>
                                    
                                    <button 
                                        onClick={() => setActiveSection('reports')}
                                        className="flex items-center space-x-3 p-3 sm:p-4 bg-white rounded-lg hover:shadow-md transition-all border border-gray-200"
                                    >
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileBarChart className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900 text-sm sm:text-base">Generate Report</p>
                                            <p className="text-xs text-gray-500 hidden sm:block">Health summary</p>
                                        </div>
                                    </button>
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
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">My Appointments</h3>
                                    <p className="text-sm text-gray-600 mt-1">Manage and track your medical appointments</p>
                                </div>
                                <button className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Book Appointment</span>
                                </button>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 text-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Appointments Yet</h3>
                                <p className="text-sm text-gray-600 mb-6">You haven't booked any appointments. Book your first appointment with a healthcare provider.</p>
                                <button className="px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-lg">
                                    Book Your First Appointment
                                </button>
                            </div>
                        </div>
                    )}

                {activeSection === 'prescriptions' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">My Prescriptions</h3>
                                <p className="text-sm text-gray-600 mt-1">View and manage your prescriptions</p>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 text-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Pill className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Prescriptions Yet</h3>
                                <p className="text-sm text-gray-600 mb-6">You don't have any prescriptions yet. Your prescriptions will appear here after your doctor appointments.</p>
                            </div>
                        </div>
                    )}

                {activeSection === 'records' && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Upload New Record Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Upload New Record</h3>
                            </div>
                            <div className="p-4 sm:p-6">
                                {uploadMessage.text && (
                                    <div className={`mb-4 p-3 sm:p-4 rounded-lg text-sm ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                        {uploadMessage.text}
                                    </div>
                                )}
                                
                                <div 
                                    className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors cursor-pointer ${
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
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                                    </div>
                                    <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                                        {selectedFile ? selectedFile.name : 'Upload Your Medical Record'}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                                        {selectedFile ? `Size: ${formatFileSize(selectedFile.size)}` : 'Drag and drop or click to browse'}
                                    </p>
                                    <p className="text-xs text-gray-500">Supports: PDF, JPG, PNG, DOC (Max: 25MB)</p>
                                </div>
                                
                                {selectedFile && (
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={handleFileUpload}
                                            disabled={uploading}
                                            className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2 text-sm sm:text-base"
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
                            <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">My Medical Records</h3>
                            </div>
                            <div className="p-4 sm:p-6">
                                {medicalRecords.length === 0 ? (
                                    <div className="text-center py-8 sm:py-12">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                        </div>
                                        <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No medical records yet</h4>
                                        <p className="text-xs sm:text-sm text-gray-500">Upload your first medical record to get started</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 sm:space-y-4">
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
                                                <div key={record._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow gap-3">
                                                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${getIconColor(record.category)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{record.title || record.originalName}</h4>
                                                            <p className="text-xs sm:text-sm text-gray-500">
                                                                {formatDate(record.createdAt)} • {formatFileSize(record.fileSize)}
                                                            </p>
                                                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(record.status)}`}>
                                                                {record.status === 'under-review' ? 'Under Review' : record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2 justify-end">
                                                        <button 
                                                            onClick={() => handleViewDocument(record._id)}
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                            title="View Document"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDownloadDocument(record._id)}
                                                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                            title="Download Document"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteDocument(record._id)}
                                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                            title="Delete Document"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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
                        <div className="space-y-4 sm:space-y-6">
                            {uploadMessage.text && uploadMessage.type && (
                                <div className={`p-3 sm:p-4 rounded-lg text-sm ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    {uploadMessage.text}
                                </div>
                            )}

                            {/* Report Generation Card */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-4 sm:p-8 text-center">
                                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <FileBarChart className="w-7 h-7 sm:w-10 sm:h-10 text-blue-600" />
                                </div>
                                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">Generate Health Report</h3>
                                <p className="text-sm text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto">
                                    Create a detailed health summary including all your medical records, test results, and health metrics.
                                </p>
                                <div className="bg-white rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 max-w-2xl mx-auto">
                                    <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Report Includes:</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-left">
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm text-gray-700">Medical Records ({medicalRecords.length})</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm text-gray-700">Appointment History</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm text-gray-700">Prescription Records</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm text-gray-700">Health Metrics</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm text-gray-700">Patient Profile</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm text-gray-700">Timeline Summary</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleGenerateReport}
                                    disabled={generatingReport}
                                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto text-sm sm:text-base"
                                >
                                    {generatingReport ? (
                                        <>
                                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FileBarChart className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span>Generate Full Report</span>
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-gray-500 mt-3 sm:mt-4">
                                    <Shield className="w-3 h-3 inline mr-1" />
                                    All reports are securely stored and encrypted
                                </p>
                            </div>

                            {/* Generated Reports */}
                            {healthReports.length > 0 ? (
                                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">My Health Reports</h3>
                                    <div className="space-y-3">
                                        {healthReports.map((report) => (
                                            <div key={report._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow gap-3">
                                                <div className="flex items-center space-x-3 sm:space-x-4">
                                                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <FileBarChart className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{report.title || 'Health Summary Report'}</h4>
                                                        <p className="text-xs sm:text-sm text-gray-600">
                                                            {formatDate(report.createdAt)} • {report.recordCount || 0} records
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center">
                                                                <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                                                                AWS
                                                            </span>
                                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">PDF</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2 justify-end">
                                                    <button 
                                                        onClick={() => handleViewReport(report._id)}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                        title="View Report"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDownloadReport(report._id)}
                                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
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
                                <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 text-center">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <FileBarChart className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                    </div>
                                    <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Reports Generated Yet</h4>
                                    <p className="text-xs sm:text-sm text-gray-500">Click the button above to generate your first health report</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'profile' && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Profile Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                                            {user?.fullName?.[0] || user?.email?.[0] || 'P'}
                                        </div>
                                        <button className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                                            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{user?.fullName || 'Patient Name'}</h3>
                                        <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1 text-sm">
                                            <Mail className="w-4 h-4 mr-2" />
                                            <span className="truncate max-w-48 sm:max-w-full">{user?.email}</span>
                                        </p>
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                                            <span className="text-xs bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full flex items-center">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Verified
                                            </span>
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full">Patient</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                                        <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                                        Personal Information
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={user?.fullName || ''}
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors bg-gray-50 text-sm"
                                            readOnly
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors bg-gray-50 text-sm"
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                        <select className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors text-sm">
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                            <option value="prefer-not-to-say">Prefer not to say</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                                        <select className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors text-sm">
                                            <option value="">Select Blood Type</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                            <textarea
                                                rows="2"
                                                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors text-sm"
                                                placeholder="Enter your complete address"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Medical Allergies</label>
                                        <textarea
                                            rows="2"
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors text-sm"
                                            placeholder="List any known allergies"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200 mt-4 sm:mt-6">
                                    <button className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm">
                                        Cancel
                                    </button>
                                    <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center space-x-2 text-sm">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Save Changes</span>
                                    </button>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600" />
                                    Emergency Contact
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                                        <input
                                            type="text"
                                            placeholder="Full name"
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                                        <input
                                            type="tel"
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Spouse, Parent"
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors text-sm">
                                        Save Emergency Contact
                                    </button>
                                </div>
                            </div>

                            {/* Security Settings */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600" />
                                    Security & Privacy
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 gap-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 text-sm sm:text-base">Change Password</h4>
                                                <p className="text-xs sm:text-sm text-gray-600">Update your password regularly</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto">
                                            Change
                                        </button>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 gap-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 text-sm sm:text-base">Two-Factor Authentication</h4>
                                                <p className="text-xs sm:text-sm text-gray-600">Add extra security to your account</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto">
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
