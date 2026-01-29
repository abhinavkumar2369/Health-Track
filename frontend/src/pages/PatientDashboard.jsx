import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { documentAPI } from '../services/api';
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
    AlertCircle
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
    
    // Document summary state
    const [summarizing, setSummarizing] = useState({});
    const [summaries, setSummaries] = useState({});
    const [viewingSummary, setViewingSummary] = useState(null);

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
            // Find the report in the state
            const report = healthReports.find(r => r.id === reportId);
            if (report && report.downloadUrl) {
                window.open(report.downloadUrl, '_blank');
            } else {
                setUploadMessage({ type: 'error', text: 'Report not available' });
            }
        } catch (error) {
            console.error('View report error:', error);
            setUploadMessage({ type: 'error', text: 'Failed to view report' });
        }
    };

    const handleDownloadReport = async (reportId) => {
        try {
            // Find the report in the state
            const report = healthReports.find(r => r.id === reportId);
            if (report && report.downloadUrl) {
                // Create a temporary link to download
                const link = document.createElement('a');
                link.href = report.downloadUrl;
                link.download = report.fileName || 'health_report.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                setUploadMessage({ type: 'error', text: 'Report not available' });
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
                            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 text-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Appointments Yet</h3>
                                <p className="text-sm text-gray-600 mb-6">You haven't booked any appointments yet.</p>
                                <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                                    Book Appointment
                                </button>
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
                                                        {record.isSummarized ? (
                                                            <button 
                                                                onClick={() => handleViewSummary(record._id)}
                                                                className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                                                                title="View AI Summary"
                                                            >
                                                                <Brain className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => handleSummarizeDocument(record._id)}
                                                                disabled={summarizing[record._id]}
                                                                className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                                                                title="Generate AI Summary"
                                                            >
                                                                {summarizing[record._id] ? (
                                                                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                                                ) : (
                                                                    <Sparkles className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        )}
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
                                            <div key={report.id || report._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow gap-3">
                                                <div className="flex items-center space-x-3 sm:space-x-4">
                                                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <FileBarChart className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                                            {report.title || 'Health Summary Report'}
                                                        </h4>
                                                        <p className="text-xs sm:text-sm text-gray-600">
                                                            {new Date(report.generatedAt || report.createdAt).toLocaleString()}
                                                            {report.fileSize && ` • ${(report.fileSize / 1024).toFixed(2)} KB`}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                                                            {report.totalDocuments !== undefined && (
                                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                                    {report.totalDocuments} Docs
                                                                </span>
                                                            )}
                                                            {report.summarizedDocuments !== undefined && (
                                                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                                                    {report.summarizedDocuments} AI
                                                                </span>
                                                            )}
                                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center">
                                                                <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                                                                AWS S3
                                                            </span>
                                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">PDF</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2 justify-end">
                                                    <button 
                                                        onClick={() => handleViewReport(report.id || report._id)}
                                                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                        title="View Report"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDownloadReport(report.id || report._id)}
                                                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
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
                        <div className="space-y-6">
                            {/* Page Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                                    <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
                                </div>
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                                    {user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'P'}
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                                            <p className="text-sm text-gray-500">Update your personal details and information</p>
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
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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
        </div>
    );
};

export default PatientDashboard;
