import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import authService from '../services/authService';
import { LayoutDashboard, Stethoscope, Users, Pill, BarChart3, Settings, LogOut, User, Lock, Plus, Menu, X, FileText, Download, Trash2, Network, AlertCircle, Search, Phone, Mail, Calendar, Activity } from 'lucide-react';

const initialFormState = {
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    specialization: '',
};

const formatDisplayDate = (isoString) => {
    if (!isoString) return '—';
    const parsed = new Date(isoString);
    return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString();
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [pharmacists, setPharmacists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formData, setFormData] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stats, setStats] = useState({
        totalDoctors: 0,
        totalPharmacists: 0,
        totalPatients: 0,
        totalRevenue: 0
    });
    const [inventoryData, setInventoryData] = useState({
        stats: {
            totalItems: 0,
            totalQuantity: 0,
            lowStock: 0,
            outOfStock: 0
        },
        chartData: []
    });
    const [diseaseData, setDiseaseData] = useState({
        diseases: [],
        totalCases: 0,
        trend: 0
    });
    const [activityData, setActivityData] = useState({
        chartData: [],
        stats: {
            totalActivity: 0,
            avgPerDay: 0,
            totalDocuments: 0,
            totalPatients: 0
        }
    });
    const [profileForm, setProfileForm] = useState({
        fullname: '',
        gender: '',
        phone: ''
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [profileErrors, setProfileErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});
    
    // Reports state
    const [reports, setReports] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportForm, setReportForm] = useState({
        reportType: 'summary',
        title: '',
        description: '',
        dateFrom: '',
        dateTo: ''
    });
    
    // Interoperability state
    const [interopConfig, setInteropConfig] = useState({
        token: '',
        address: '',
        expiryDate: null,
        isExpired: false
    });
    const [interopErrors, setInteropErrors] = useState({});
    const [isInteropSaving, setIsInteropSaving] = useState(false);
    const [interopSuccess, setInteropSuccess] = useState('');
    const [isGeneratingToken, setIsGeneratingToken] = useState(false);

    // Emergency Access state
    const [emergencySearch, setEmergencySearch] = useState('');
    const [emergencyPatient, setEmergencyPatient] = useState(null);
    const [emergencyLoading, setEmergencyLoading] = useState(false);
    const [emergencyError, setEmergencyError] = useState('');

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/sign-in');
            return;
        }
        setUser(currentUser);
        loadData();
        loadProfile();
        loadReports();
        loadApiToken();
    }, [navigate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [doctorsRes, pharmacistsRes, patientsRes, inventoryRes, diseasesRes, activityRes] = await Promise.all([
                adminAPI.getUsers('doctor'),
                adminAPI.getUsers('pharmacist'),
                adminAPI.getPatients(),
                adminAPI.getPharmacyInventory(),
                adminAPI.getCriticalDiseases(),
                adminAPI.getWeeklyActivity()
            ]);

            if (doctorsRes.success) setDoctors(doctorsRes.data || []);
            if (pharmacistsRes.success) setPharmacists(pharmacistsRes.data || []);

            setStats({
                totalDoctors: doctorsRes.data?.length || 0,
                totalPharmacists: pharmacistsRes.data?.length || 0,
                totalPatients: patientsRes.data?.length || 0,
                totalRevenue: 45287
            });

            if (inventoryRes.success) {
                setInventoryData({
                    stats: inventoryRes.stats || {
                        totalItems: 0,
                        totalQuantity: 0,
                        lowStock: 0,
                        outOfStock: 0
                    },
                    chartData: inventoryRes.chartData || []
                });
            }

            if (diseasesRes.success) {
                setDiseaseData({
                    diseases: diseasesRes.diseases || [],
                    totalCases: diseasesRes.totalCases || 0,
                    trend: diseasesRes.trend || 0
                });
            }

            if (activityRes.success) {
                setActivityData({
                    chartData: activityRes.chartData || [],
                    stats: activityRes.stats || {
                        totalActivity: 0,
                        avgPerDay: 0,
                        totalDocuments: 0,
                        totalPatients: 0
                    }
                });
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setError(error.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const loadProfile = async () => {
        try {
            const response = await adminAPI.getProfile();
            if (response.success && response.profile) {
                setProfileForm({
                    fullname: response.profile.fullname || '',
                    gender: response.profile.gender || '',
                    phone: response.profile.phone || ''
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const loadReports = () => {
        const savedReports = localStorage.getItem('adminReports');
        if (savedReports) {
            setReports(JSON.parse(savedReports));
        }
    };

    const loadApiToken = async () => {
        try {
            const response = await adminAPI.getApiToken();
            if (response.success && response.apiToken) {
                setInteropConfig({
                    ...interopConfig,
                    token: response.apiToken,
                    expiryDate: response.expiryDate,
                    isExpired: response.isExpired
                });
            }
        } catch (error) {
            console.error('Error loading API token:', error);
        }
    };

    const handleGenerateApiToken = async () => {
        setIsGeneratingToken(true);
        setInteropErrors({});
        setInteropSuccess('');
        try {
            const response = await adminAPI.generateApiToken(365);
            if (response.success) {
                setInteropConfig({
                    ...interopConfig,
                    token: response.apiToken,
                    expiryDate: response.expiryDate,
                    isExpired: false
                });
                setInteropSuccess('API token generated successfully!');
            }
        } catch (error) {
            setInteropErrors({ general: error.message || 'Failed to generate token' });
        } finally {
            setIsGeneratingToken(false);
        }
    };

    const handleRevokeApiToken = async () => {
        if (!confirm('Are you sure you want to revoke the API token? This will invalidate all external access.')) {
            return;
        }
        try {
            const response = await adminAPI.revokeApiToken();
            if (response.success) {
                setInteropConfig({
                    ...interopConfig,
                    token: '',
                    expiryDate: null,
                    isExpired: false
                });
                setInteropSuccess('API token revoked successfully');
            }
        } catch (error) {
            setInteropErrors({ general: error.message || 'Failed to revoke token' });
        }
    };

    // Emergency Access Handlers
    const handleEmergencySearch = async (e) => {
        e.preventDefault();
        if (!emergencySearch.trim()) {
            setEmergencyError('Please enter a Patient ID');
            return;
        }

        setEmergencyLoading(true);
        setEmergencyError('');
        setEmergencyPatient(null);

        try {
            const response = await adminAPI.getPatientEmergencyData(emergencySearch.trim());
            if (response.success && response.patient) {
                setEmergencyPatient(response.patient);
            } else {
                setEmergencyError(response.message || 'Patient not found');
            }
        } catch (error) {
            setEmergencyError(error.message || 'Failed to fetch patient data');
        } finally {
            setEmergencyLoading(false);
        }
    };

    const clearEmergencyData = () => {
        setEmergencySearch('');
        setEmergencyPatient(null);
        setEmergencyError('');
    };

    const handleGenerateReport = (e) => {
        e.preventDefault();
        const newReport = {
            id: Date.now(),
            ...reportForm,
            title: reportForm.title || `${reportForm.reportType.charAt(0).toUpperCase() + reportForm.reportType.slice(1)} Report`,
            status: 'completed',
            generatedAt: new Date().toISOString(),
            fileSize: Math.floor(Math.random() * 500000) + 100000
        };
        const updatedReports = [newReport, ...reports];
        setReports(updatedReports);
        localStorage.setItem('adminReports', JSON.stringify(updatedReports));
        setShowReportModal(false);
        setReportForm({
            reportType: 'summary',
            title: '',
            description: '',
            dateFrom: '',
            dateTo: ''
        });
        setSuccessMessage('Report generated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleDeleteReport = (reportId) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            const updatedReports = reports.filter(r => r.id !== reportId);
            setReports(updatedReports);
            localStorage.setItem('adminReports', JSON.stringify(updatedReports));
            setSuccessMessage('Report deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const handleDownloadReport = (report) => {
        // Create a JSON blob with report data
        const reportData = {
            title: report.title || `${report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)} Report`,
            type: report.reportType,
            description: report.description,
            generatedAt: report.generatedAt,
            dateRange: {
                from: report.dateFrom || 'N/A',
                to: report.dateTo || 'N/A'
            },
            status: report.status,
            // Add actual data based on report type
            data: {
                message: 'Report data would be generated here based on the report type'
            }
        };
        
        // Convert to JSON string
        const dataStr = JSON.stringify(reportData, null, 2);
        
        // Create blob and download
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.title || report.reportType}_${new Date(report.generatedAt).toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setSuccessMessage('Report downloaded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/sign-in');
    };

    const openAddUserModal = (type) => {
        setModalType(type);
        setFormData(initialFormState);
        setFormErrors({});
        setError('');
        setSuccessMessage('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType('');
        setFormData(initialFormState);
        setFormErrors({});
        setError('');
        setSuccessMessage('');
        setIsSubmitting(false);
    };

    const handleInputChange = ({ target: { name, value } }) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errors.email = 'Enter a valid email address';
        }
        if (!formData.password.trim() || formData.password.trim().length < 6) {
            errors.password = 'Temporary password must be at least 6 characters';
        }
        if (modalType === 'doctor' && !formData.specialization.trim()) {
            errors.specialization = 'Specialization is required for doctors';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        const payload = {
            fullname: `${formData.firstName.trim()} ${formData.lastName.trim()}`.replace(/\s+/g, ' ').trim(),
            email: formData.email.trim(),
            password: formData.password.trim(),
            specialization: formData.specialization.trim(),
        };

        try {
            if (modalType === 'doctor') {
                await adminAPI.addDoctor(payload);
                setSuccessMessage('Doctor added successfully!');
            } else if (modalType === 'pharmacist') {
                await adminAPI.addPharmacist(payload);
                setSuccessMessage('Pharmacist added successfully!');
            }

            setFormData(initialFormState);
            await loadData();

            setTimeout(() => {
                closeModal();
            }, 1500);
        } catch (submissionError) {
            console.error('Error adding user:', submissionError);
            setError(submissionError.message || 'Failed to add user. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveUser = async (userId, role) => {
        if (!window.confirm(`Are you sure you want to remove this ${role}?`)) {
            return;
        }

        setError('');
        setSuccessMessage('');
        setLoading(true);
        try {
            await adminAPI.removeUser(userId, role);
            
            await loadData();
            setSuccessMessage(`${role.charAt(0).toUpperCase() + role.slice(1)} removed successfully!`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (removeError) {
            console.error('Error removing user:', removeError);
            setError(removeError.message || 'Failed to remove user');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileInputChange = ({ target: { name, value } }) => {
        setProfileForm((prev) => ({ ...prev, [name]: value }));
        if (profileErrors[name]) {
            setProfileErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handlePasswordInputChange = ({ target: { name, value } }) => {
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
        if (passwordErrors[name]) {
            setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const errors = {};
        
        if (!profileForm.fullname.trim()) {
            errors.fullname = 'Full name is required';
        }

        setProfileErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await adminAPI.updateProfile(profileForm);
            if (response.success) {
                setSuccessMessage('Profile updated successfully!');
                await loadProfile();
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setError(error.message || 'Failed to update profile');
            setTimeout(() => setError(''), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        const errors = {};
        
        if (!passwordForm.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }
        if (!passwordForm.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordForm.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setPasswordErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await adminAPI.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            
            if (response.success) {
                setSuccessMessage('Password changed successfully!');
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Password change error:', error);
            setError(error.message || 'Failed to change password');
            setTimeout(() => setError(''), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const sidebarItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'doctors', icon: Stethoscope, label: 'Doctors' },
        { id: 'pharmacists', icon: Pill, label: 'Pharmacists' },
        { id: 'reports', icon: BarChart3, label: 'Reports' },
        { id: 'emergency', icon: AlertCircle, label: 'Emergency' },
        { id: 'interoperability', icon: Network, label: 'Interoperability' },
        { id: 'settings', icon: Settings, label: 'Settings' }
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <img src="/favicon.svg" alt="Health Track" className="w-8 h-8" />
                        <span className="text-lg font-bold text-gray-900">Health Track</span>
                    </div>
                    <button 
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveSection(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                    activeSection === item.id
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <IconComponent className="w-5 h-5" />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile */}
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8">
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                    <div className="text-sm text-gray-500 ml-auto">
                        <span className="hidden sm:inline">{new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</span>
                        <span className="sm:hidden">{new Date().toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                        })}</span>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {activeSection === 'dashboard' && (
                        <div className="space-y-6">
                            {/* Section Header */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <LayoutDashboard className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h2>
                                    <p className="text-sm text-gray-500">Overview of your health system</p>
                                </div>
                            </div>

                            {/* Stat Summary Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                    <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center mb-4">
                                        <Stethoscope className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
                                    <p className="text-sm text-gray-500 mt-1">Doctors</p>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                    <div className="w-10 h-10 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center mb-4">
                                        <Users className="w-5 h-5 text-green-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
                                    <p className="text-sm text-gray-500 mt-1">Patients</p>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                    <div className="w-10 h-10 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center mb-4">
                                        <Pill className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalPharmacists}</p>
                                    <p className="text-sm text-gray-500 mt-1">Pharmacists</p>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                    <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center mb-4">
                                        <BarChart3 className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
                                    <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
                                </div>
                            </div>

                            {/* User Statistics & Pharmacy Inventory */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* User Statistics - Donut Chart */}
                                <div className="bg-white rounded-2xl border border-gray-200">
                                    <div className="px-6 py-5 border-b border-gray-100">
                                        <h3 className="text-base font-semibold text-gray-900">User Statistics</h3>
                                        <p className="text-sm text-gray-500 mt-0.5">Distribution across roles</p>
                                    </div>
                                    <div className="px-6 py-6">
                                    {/* Donut Chart */}
                                    <div className="flex items-center justify-center">
                                        <div className="relative w-44 h-44">
                                            <svg viewBox="0 0 200 200" className="transform -rotate-90">
                                                {(() => {
                                                    const total = stats.totalDoctors + stats.totalPharmacists + stats.totalPatients;
                                                    
                                                    if (total === 0) {
                                                        const radius = 80;
                                                        const circumference = 2 * Math.PI * radius;
                                                        return (
                                                            <>
                                                                <circle cx="100" cy="100" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="36" strokeDasharray={`${circumference / 3} ${circumference}`} strokeDashoffset={0} className="transition-all duration-500" />
                                                                <circle cx="100" cy="100" r={radius} fill="none" stroke="#f3e8ff" strokeWidth="36" strokeDasharray={`${circumference / 3} ${circumference}`} strokeDashoffset={`-${circumference / 3}`} className="transition-all duration-500" />
                                                                <circle cx="100" cy="100" r={radius} fill="none" stroke="#dcfce7" strokeWidth="36" strokeDasharray={`${circumference / 3} ${circumference}`} strokeDashoffset={`-${(circumference / 3) * 2}`} className="transition-all duration-500" />
                                                            </>
                                                        );
                                                    }
                                                    
                                                    const doctorsPercent = (stats.totalDoctors / total) * 100;
                                                    const pharmacistsPercent = (stats.totalPharmacists / total) * 100;
                                                    const patientsPercent = (stats.totalPatients / total) * 100;
                                                    
                                                    const radius = 80;
                                                    const circumference = 2 * Math.PI * radius;
                                                    
                                                    let currentOffset = 0;
                                                    
                                                    return (
                                                        <>
                                                            <circle cx="100" cy="100" r={radius} fill="none" stroke="#3b82f6" strokeWidth="36" strokeDasharray={`${(doctorsPercent / 100) * circumference} ${circumference}`} strokeDashoffset={-currentOffset} className="transition-all duration-500" />
                                                            {(() => { currentOffset += (doctorsPercent / 100) * circumference; return null; })()}
                                                            <circle cx="100" cy="100" r={radius} fill="none" stroke="#a855f7" strokeWidth="36" strokeDasharray={`${(pharmacistsPercent / 100) * circumference} ${circumference}`} strokeDashoffset={-currentOffset} className="transition-all duration-500" />
                                                            {(() => { currentOffset += (pharmacistsPercent / 100) * circumference; return null; })()}
                                                            <circle cx="100" cy="100" r={radius} fill="none" stroke="#22c55e" strokeWidth="36" strokeDasharray={`${(patientsPercent / 100) * circumference} ${circumference}`} strokeDashoffset={-currentOffset} className="transition-all duration-500" />
                                                        </>
                                                    );
                                                })()}
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {stats.totalDoctors + stats.totalPharmacists + stats.totalPatients}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Total Users</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Legend */}
                                    <div className="mt-5 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                                <span className="text-sm text-gray-600">Doctors</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">{stats.totalDoctors}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                                                <span className="text-sm text-gray-600">Pharmacists</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">{stats.totalPharmacists}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                                <span className="text-sm text-gray-600">Patients</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">{stats.totalPatients}</span>
                                        </div>
                                    </div>
                                    </div>
                                </div>

                                {/* Pharmacy Inventory Line Chart */}
                                <div className="bg-white rounded-2xl border border-gray-200">
                                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900">Pharmacy Inventory</h3>
                                            <p className="text-sm text-gray-500 mt-0.5">Stock levels over time</p>
                                        </div>
                                        <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50">
                                            <option>Last 7 Days</option>
                                            <option>Last 30 Days</option>
                                            <option>Last 3 Months</option>
                                        </select>
                                    </div>
                                    <div className="px-6 py-6">
                                    
                                    {/* Line Chart using SVG */}
                                    <div className="relative h-48">
                                        {inventoryData.chartData.length === 0 ? (
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-gray-400 text-sm">No inventory data available</p>
                                            </div>
                                        ) : (
                                            <>
                                        {/* Y-axis labels */}
                                        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400 w-8">
                                            {(() => {
                                                const maxValue = Math.max(...inventoryData.chartData.map(d => d.value), 1);
                                                const step = Math.ceil(maxValue / 4);
                                                return [4, 3, 2, 1, 0].map(i => (
                                                    <span key={i}>{step * i}</span>
                                                ));
                                            })()}
                                        </div>
                                        
                                        {/* Chart area */}
                                        <div className="ml-10 h-full">
                                            <svg className="w-full h-[calc(100%-24px)]" viewBox="0 0 350 120" preserveAspectRatio="none">
                                                <line x1="0" y1="0" x2="350" y2="0" stroke="#f3f4f6" strokeWidth="1" />
                                                <line x1="0" y1="30" x2="350" y2="30" stroke="#f3f4f6" strokeWidth="1" />
                                                <line x1="0" y1="60" x2="350" y2="60" stroke="#f3f4f6" strokeWidth="1" />
                                                <line x1="0" y1="90" x2="350" y2="90" stroke="#f3f4f6" strokeWidth="1" />
                                                <line x1="0" y1="120" x2="350" y2="120" stroke="#f3f4f6" strokeWidth="1" />
                                                {(() => {
                                                    const maxValue = Math.max(...inventoryData.chartData.map(d => d.value), 1);
                                                    const points = inventoryData.chartData.map((data, index) => {
                                                        const x = (index / (inventoryData.chartData.length - 1)) * 350;
                                                        const y = 120 - ((data.value / maxValue) * 100);
                                                        return { x, y, value: data.value };
                                                    });
                                                    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                                    const areaD = `${pathD} L 350 120 L 0 120 Z`;
                                                    return (
                                                        <>
                                                            <path d={areaD} fill="url(#purpleGradient)" opacity="0.2" />
                                                            <path d={pathD} fill="none" stroke="#9333ea" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                            {points.map((point, index) => (
                                                                <circle key={index} cx={point.x} cy={point.y} r="4" fill="#9333ea" stroke="white" strokeWidth="2" />
                                                            ))}
                                                        </>
                                                    );
                                                })()}
                                                <defs>
                                                    <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor="#9333ea" />
                                                        <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                                {inventoryData.chartData.map((data, index) => (
                                                    <span key={index}>{data.day}</span>
                                                ))}
                                            </div>
                                        </div>
                                        </>
                                        )}
                                    </div>
                                    
                                    {/* Stats summary */}
                                    <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Items</p>
                                            <p className="text-xl font-bold text-gray-900 mt-1">{inventoryData.stats.totalItems}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Low Stock</p>
                                            <p className="text-xl font-bold text-orange-600 mt-1">{inventoryData.stats.lowStock}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Out of Stock</p>
                                            <p className="text-xl font-bold text-red-600 mt-1">{inventoryData.stats.outOfStock}</p>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                            </div>

                            {/* Weekly Activity & Critical Diseases */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Activity Line Chart */}
                                <div className="bg-white rounded-2xl border border-gray-200">
                                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900">Weekly Activity</h3>
                                            <p className="text-sm text-gray-500 mt-0.5">Last 7 days</p>
                                        </div>
                                        <span className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">Live</span>
                                    </div>
                                    <div className="px-6 py-6">
                                    
                                    {/* Line Chart using SVG */}
                                    <div className="relative h-40">
                                        {activityData.chartData.length === 0 ? (
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-gray-400 text-sm">No activity data available</p>
                                            </div>
                                        ) : (
                                            <>
                                        {/* Y-axis labels */}
                                        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400 w-6">
                                            {(() => {
                                                const maxValue = Math.max(...activityData.chartData.map(d => d.value), 1);
                                                const step = Math.ceil(maxValue / 2);
                                                return [2, 1, 0].map(i => (
                                                    <span key={i}>{step * i}</span>
                                                ));
                                            })()}
                                        </div>
                                        
                                        {/* Chart area */}
                                        <div className="ml-8 h-full">
                                            <svg className="w-full h-[calc(100%-24px)]" viewBox="0 0 300 100" preserveAspectRatio="none">
                                                <line x1="0" y1="0" x2="300" y2="0" stroke="#f3f4f6" strokeWidth="1" />
                                                <line x1="0" y1="50" x2="300" y2="50" stroke="#f3f4f6" strokeWidth="1" />
                                                <line x1="0" y1="100" x2="300" y2="100" stroke="#f3f4f6" strokeWidth="1" />
                                                {(() => {
                                                    const maxValue = Math.max(...activityData.chartData.map(d => d.value), 1);
                                                    const points = activityData.chartData.map((data, index) => {
                                                        const x = (index / (activityData.chartData.length - 1)) * 300;
                                                        const y = 100 - ((data.value / maxValue) * 90);
                                                        return { x, y, value: data.value };
                                                    });
                                                    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                                    const areaD = `${pathD} L 300 100 L 0 100 Z`;
                                                    return (
                                                        <>
                                                            <path d={areaD} fill="url(#blueGradient)" opacity="0.3" />
                                                            <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            {points.map((point, index) => (
                                                                <circle key={index} cx={point.x} cy={point.y} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />
                                                            ))}
                                                        </>
                                                    );
                                                })()}
                                                <defs>
                                                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor="#3b82f6" />
                                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                                {activityData.chartData.map((data, index) => (
                                                    <span key={index}>{data.day}</span>
                                                ))}
                                            </div>
                                        </div>
                                        </>
                                        )}
                                    </div>
                                    
                                    {/* Stats summary */}
                                    <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total</p>
                                            <p className="text-xl font-bold text-gray-900 mt-1">{activityData.stats.totalActivity}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Avg/Day</p>
                                            <p className="text-xl font-bold text-gray-900 mt-1">{activityData.stats.avgPerDay}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Docs</p>
                                            <p className="text-xl font-bold text-blue-600 mt-1">{activityData.stats.totalDocuments}</p>
                                        </div>
                                    </div>
                                    </div>
                                </div>

                                {/* Critical Diseases Chart */}
                                <div className="bg-white rounded-2xl border border-gray-200">
                                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900">Critical Diseases</h3>
                                            <p className="text-sm text-gray-500 mt-0.5">Top cases this month</p>
                                        </div>
                                        <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg font-medium">This Month</span>
                                    </div>
                                    <div className="px-6 py-6">
                                    
                                    {diseaseData.diseases.length > 0 ? (
                                        <div className="space-y-4">
                                            {diseaseData.diseases.map((disease, index) => {
                                                const colors = ['bg-red-500', 'bg-orange-500', 'bg-pink-500', 'bg-yellow-500', 'bg-purple-500'];
                                                const trackColors = ['bg-red-100', 'bg-orange-100', 'bg-pink-100', 'bg-yellow-100', 'bg-purple-100'];
                                                return (
                                                    <div key={index}>
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <span className="text-sm font-medium text-gray-700">{disease.name}</span>
                                                            <span className="text-xs font-semibold text-gray-500">{disease.cases} cases</span>
                                                        </div>
                                                        <div className={`w-full ${trackColors[index % trackColors.length]} rounded-full h-2 overflow-hidden`}>
                                                            <div
                                                                className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-700`}
                                                                style={{ width: `${disease.percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-40 text-gray-400">
                                            <p className="text-sm">No disease data available</p>
                                        </div>
                                    )}
                                    
                                    {/* Summary */}
                                    <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Cases</p>
                                            <p className="text-xl font-bold text-gray-900 mt-1">{diseaseData.totalCases}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">vs Last Month</p>
                                            <p className={`text-xl font-bold mt-1 ${diseaseData.trend >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                {diseaseData.trend >= 0 ? '+' : ''}{diseaseData.trend}%
                                            </p>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Doctors Section */}
                    {activeSection === 'doctors' && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Table Card */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                    <h3 className="text-lg font-semibold text-gray-900">Doctors</h3>
                                    <button
                                        onClick={() => openAddUserModal('doctor')}
                                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto"
                                    >
                                        Add Doctor
                                    </button>
                                </div>
                                
                                {loading ? (
                                    <div className="p-8 sm:p-16 text-center">
                                        <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        <p className="text-gray-500 mt-4 text-sm">Loading doctors...</p>
                                    </div>
                                ) : doctors.length === 0 ? (
                                    <div className="p-8 sm:p-16 text-center">
                                        <Stethoscope className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No Doctors Found</h3>
                                        <p className="text-gray-500 mb-6 text-sm">Add your first doctor to get started</p>
                                        <button
                                            onClick={() => openAddUserModal('doctor')}
                                            className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                                        >
                                            Add First Doctor
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Mobile Card View */}
                                        <div className="sm:hidden divide-y divide-gray-100">
                                            {doctors.map((doctor) => (
                                                <div key={doctor.id} className="p-4 space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-gray-900 text-sm truncate">{doctor.name || '—'}</p>
                                                            <p className="text-xs text-gray-500 truncate">{doctor.email || '—'}</p>
                                                        </div>
                                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full ml-2">
                                                            {doctor.specialization || 'General'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-400">ID: {doctor.userId || doctor.uniqueId || doctor.id?.slice(-6)}</span>
                                                        <button
                                                            onClick={() => handleRemoveUser(doctor.id, 'doctor')}
                                                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Desktop Table View */}
                                        <div className="hidden sm:block overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-200">
                                                        <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                                                        <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                                        <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Email</th>
                                                        <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Specialization</th>
                                                        <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Created</th>
                                                        <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {doctors.map((doctor) => (
                                                        <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 lg:px-6 py-4 text-sm font-mono text-gray-600">{doctor.userId || doctor.uniqueId || doctor.id?.slice(-6)}</td>
                                                            <td className="px-4 lg:px-6 py-4 text-sm font-medium text-gray-900">{doctor.name || '—'}</td>
                                                            <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{doctor.email || '—'}</td>
                                                            <td className="px-4 lg:px-6 py-4">
                                                                <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                                                                    {doctor.specialization || 'General'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 lg:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">{formatDisplayDate(doctor.createdAt)}</td>
                                                            <td className="px-4 lg:px-6 py-4">
                                                                <button
                                                                    onClick={() => handleRemoveUser(doctor.id, 'doctor')}
                                                                    className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Pharmacists Section */}
                    {activeSection === 'pharmacists' && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Table Card */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                    <h3 className="text-lg font-semibold text-gray-900">Pharmacists</h3>
                                    <button
                                        onClick={() => openAddUserModal('pharmacist')}
                                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto"
                                    >
                                        Add Pharmacist
                                    </button>
                                </div>
                                
                                {loading ? (
                                    <div className="p-8 sm:p-16 text-center">
                                        <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        <p className="text-gray-500 mt-4 text-sm">Loading pharmacists...</p>
                                    </div>
                                ) : pharmacists.length === 0 ? (
                                    <div className="p-8 sm:p-16 text-center">
                                        <Pill className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No Pharmacists Found</h3>
                                        <p className="text-gray-500 mb-6 text-sm">Add your first pharmacist to get started</p>
                                        <button
                                            onClick={() => openAddUserModal('pharmacist')}
                                            className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                                        >
                                            Add First Pharmacist
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Mobile Card View */}
                                        <div className="sm:hidden divide-y divide-gray-100">
                                            {pharmacists.map((pharmacist) => (
                                                <div key={pharmacist.id} className="p-4 space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-gray-900 text-sm truncate">{pharmacist.name || '—'}</p>
                                                            <p className="text-xs text-gray-500 truncate">{pharmacist.email || '—'}</p>
                                                        </div>
                                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full ml-2">
                                                            Active
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-400">ID: {pharmacist.userId || pharmacist.uniqueId || pharmacist.id?.slice(-6)}</span>
                                                        <button
                                                            onClick={() => handleRemoveUser(pharmacist.id, 'pharmacist')}
                                                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Desktop Table View */}
                                        <div className="hidden sm:block overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-200">
                                                        <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                                                        <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                                        <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Email</th>
                                                        <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                                        <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Created</th>
                                                        <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {pharmacists.map((pharmacist) => (
                                                        <tr key={pharmacist.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 lg:px-6 py-4 text-sm font-mono text-gray-600">{pharmacist.userId || pharmacist.uniqueId || pharmacist.id?.slice(-6)}</td>
                                                            <td className="px-4 lg:px-6 py-4 text-sm font-medium text-gray-900">{pharmacist.name || '—'}</td>
                                                            <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{pharmacist.email || '—'}</td>
                                                            <td className="px-4 lg:px-6 py-4">
                                                                <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full">
                                                                    Active
                                                                </span>
                                                            </td>
                                                            <td className="px-4 lg:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">{formatDisplayDate(pharmacist.createdAt)}</td>
                                                            <td className="px-4 lg:px-6 py-4">
                                                                <button
                                                                    onClick={() => handleRemoveUser(pharmacist.id, 'pharmacist')}
                                                                    className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Settings Section */}
                    {activeSection === 'settings' && (
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Settings className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h2>
                                    <p className="text-sm text-gray-500">Manage your account and security</p>
                                </div>
                            </div>

                            {/* Alerts */}
                            {error && (
                                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}
                            {successMessage && (
                                <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                                    <p className="text-green-700 text-sm">{successMessage}</p>
                                </div>
                            )}

                            {/* Profile card */}
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="px-6 py-6">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-4">Profile Information</p>
                                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
                                                    <input
                                                        type="text"
                                                        name="fullname"
                                                        value={profileForm.fullname}
                                                        onChange={handleProfileInputChange}
                                                        className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors ${
                                                            profileErrors.fullname ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                        placeholder="Enter your full name"
                                                    />
                                                    {profileErrors.fullname && <p className="text-red-500 text-xs mt-1">{profileErrors.fullname}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Gender</label>
                                                    <select
                                                        name="gender"
                                                        value={profileForm.gender}
                                                        onChange={handleProfileInputChange}
                                                        className="w-full px-4 py-2.5 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                                                    >
                                                        <option value="">Select gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone</label>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={profileForm.phone}
                                                        onChange={handleProfileInputChange}
                                                        className="w-full px-4 py-2.5 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                                                        placeholder="Enter phone number"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end pt-1">
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSubmitting ? 'Saving…' : 'Save Changes'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {/* Password card */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                                    <div className="w-9 h-9 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center">
                                        <Lock className="w-4.5 h-4.5 text-amber-600 w-[1.1rem] h-[1.1rem]" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">Change Password</p>
                                        <p className="text-xs text-gray-500">Keep your account secure</p>
                                    </div>
                                </div>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Current Password</label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={passwordForm.currentPassword}
                                                onChange={handlePasswordInputChange}
                                                className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors ${
                                                    passwordErrors.currentPassword ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                placeholder="Current password"
                                            />
                                            {passwordErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">New Password</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwordForm.newPassword}
                                                onChange={handlePasswordInputChange}
                                                className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors ${
                                                    passwordErrors.newPassword ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                placeholder="New password"
                                            />
                                            {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Confirm Password</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordForm.confirmPassword}
                                                onChange={handlePasswordInputChange}
                                                className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors ${
                                                    passwordErrors.confirmPassword ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                placeholder="Confirm new password"
                                            />
                                            {passwordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>}
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-1">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Updating…' : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Emergency Access Section */}
                    {activeSection === 'emergency' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-rose-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Emergency Access</h2>
                                    <p className="text-sm text-gray-500">Quick access to patient data in emergency situations</p>
                                </div>
                            </div>

                            {/* Search Card */}
                            <div className="bg-white rounded-2xl border border-gray-200">
                                <div className="px-6 py-5 border-b border-gray-100">
                                    <h3 className="text-base font-semibold text-gray-900">Search Patient</h3>
                                </div>
                                <div className="px-6 py-6">
                                <form onSubmit={handleEmergencySearch} className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                                Patient ID
                                            </label>
                                            <input
                                                type="text"
                                                value={emergencySearch}
                                                onChange={(e) => setEmergencySearch(e.target.value)}
                                                placeholder="Enter Patient ID or MongoDB ID"
                                                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm"
                                            />
                                        </div>
                                    </div>

                                    {emergencyError && (
                                        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                            <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                                            <p className="text-red-700 text-sm">{emergencyError}</p>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="submit"
                                            disabled={emergencyLoading}
                                            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Search className="w-4 h-4" />
                                            <span>{emergencyLoading ? 'Searching...' : 'Search Patient'}</span>
                                        </button>
                                        {emergencyPatient && (
                                            <button
                                                type="button"
                                                onClick={clearEmergencyData}
                                                className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                                <span>Clear</span>
                                            </button>
                                        )}
                                    </div>
                                </form>
                                </div>
                            </div>

                            {/* Patient Data Display */}
                            {emergencyPatient && (
                                <div className="space-y-4">
                                    {/* Patient Basic Info */}
                                    <div className="bg-white rounded-2xl border border-gray-200">
                                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                            <h3 className="text-base font-semibold text-gray-900">Patient Information</h3>
                                            <span className="bg-rose-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                                EMERGENCY ACCESS
                                            </span>
                                        </div>
                                        <div className="px-6 py-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient Name</label>
                                                <p className="text-base font-semibold text-gray-900 mt-1">{emergencyPatient.name}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient ID</label>
                                                <p className="text-base font-semibold text-gray-900 mt-1">{emergencyPatient._id}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <p className="text-gray-900 text-sm">{emergencyPatient.email}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <p className="text-gray-900 text-sm">{emergencyPatient.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned Doctor</label>
                                                <p className="text-gray-900 text-sm mt-1">
                                                    {emergencyPatient.doctor_id?.name || 'Not Assigned'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Registration Date</label>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <p className="text-gray-900 text-sm">
                                                        {formatDisplayDate(emergencyPatient.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        </div>
                                    </div>

                                    {/* Medical Documents */}
                                    {emergencyPatient.documents && emergencyPatient.documents.length > 0 && (
                                        <div className="bg-white rounded-2xl border border-gray-200">
                                            <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-100">
                                                <FileText className="w-5 h-5 text-gray-500" />
                                                <h3 className="text-base font-semibold text-gray-900">Medical Documents ({emergencyPatient.documents.length})</h3>
                                            </div>
                                            <div className="px-6 py-6 space-y-3">
                                                {emergencyPatient.documents.map((doc) => (
                                                    <div key={doc._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">{doc.title}</p>
                                                            <p className="text-sm text-gray-600">{doc.description || 'No description'}</p>
                                                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                                    {doc.category || 'general'}
                                                                </span>
                                                                <span>{formatDisplayDate(doc.createdAt)}</span>
                                                                {doc.fileSize && (
                                                                    <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Health Reports */}
                                    {emergencyPatient.healthReports && emergencyPatient.healthReports.length > 0 && (
                                        <div className="bg-white rounded-2xl border border-gray-200">
                                            <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-100">
                                                <Activity className="w-5 h-5 text-gray-500" />
                                                <h3 className="text-base font-semibold text-gray-900">Health Reports ({emergencyPatient.healthReports.length})</h3>
                                            </div>
                                            <div className="px-6 py-6 space-y-3">
                                                {emergencyPatient.healthReports.map((report) => (
                                                    <div key={report._id} className="p-4 bg-gray-50 rounded-xl">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">{report.reportType || 'General Health Report'}</p>
                                                                {report.diagnosis && (
                                                                    <p className="text-sm text-gray-600 mt-1"><strong>Diagnosis:</strong> {report.diagnosis}</p>
                                                                )}
                                                                {report.symptoms && report.symptoms.length > 0 && (
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        <strong>Symptoms:</strong> {report.symptoms.join(', ')}
                                                                    </p>
                                                                )}
                                                                {report.notes && (
                                                                    <p className="text-sm text-gray-600 mt-1"><strong>Notes:</strong> {report.notes}</p>
                                                                )}
                                                                <p className="text-xs text-gray-500 mt-2">
                                                                    {formatDisplayDate(report.createdAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Prescriptions / Medicines */}
                                    {emergencyPatient.medicines && emergencyPatient.medicines.length > 0 && (
                                        <div className="bg-white rounded-2xl border border-gray-200">
                                            <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-100">
                                                <Pill className="w-5 h-5 text-gray-500" />
                                                <h3 className="text-base font-semibold text-gray-900">Prescribed Medicines ({emergencyPatient.medicines.length})</h3>
                                            </div>
                                            <div className="px-6 py-6 space-y-3">
                                                {emergencyPatient.medicines.map((medicine) => (
                                                    <div key={medicine._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{medicine.name}</p>
                                                            <p className="text-sm text-gray-600">{medicine.description || 'No description'}</p>
                                                            <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                                                                {medicine.category && (
                                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                                                        {medicine.category}
                                                                    </span>
                                                                )}
                                                                {medicine.expiryDate && (
                                                                    <span>Exp: {formatDisplayDate(medicine.expiryDate)}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {medicine.quantity !== undefined && (
                                                            <div className="text-right">
                                                                <p className="text-sm font-medium text-gray-700">Qty: {medicine.quantity}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* No Data Message */}
                                    {(!emergencyPatient.documents || emergencyPatient.documents.length === 0) &&
                                     (!emergencyPatient.healthReports || emergencyPatient.healthReports.length === 0) &&
                                     (!emergencyPatient.medicines || emergencyPatient.medicines.length === 0) && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
                                            <p className="text-yellow-800 text-sm font-medium">No medical history available for this patient.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Warning Notice */}
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <AlertCircle className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-amber-900">Emergency Access Notice</p>
                                        <p className="text-sm text-amber-700 mt-1">
                                            This feature is intended for emergency situations only. All accesses are logged and audited. 
                                            Misuse of this feature may result in disciplinary action.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Interoperability Section */}
                    {activeSection === 'interoperability' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Network className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Interoperability</h2>
                                    <p className="text-sm text-gray-500">Configure external API access and integration settings</p>
                                </div>
                            </div>
                            
                            {interopSuccess && (
                                <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                                    <p className="text-green-700 text-sm">{interopSuccess}</p>
                                </div>
                            )}

                            {interopErrors.general && (
                                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                                    <p className="text-red-700 text-sm">{interopErrors.general}</p>
                                </div>
                            )}

                            {/* API Token Generation */}
                            <div className="bg-white rounded-2xl border border-gray-200">
                                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center">
                                            <Lock className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900">API Access Token</h3>
                                            <p className="text-sm text-gray-500">Generate token for external system access</p>
                                        </div>
                                    </div>
                                    {interopConfig.token && (
                                        <button
                                            onClick={handleRevokeApiToken}
                                            className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors"
                                        >
                                            Revoke Token
                                        </button>
                                    )}
                                </div>

                                {interopConfig.token ? (
                                    <div className="px-6 py-6 space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                                Your API Token
                                            </label>
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={interopConfig.token}
                                                    readOnly
                                                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50 font-mono text-sm"
                                                />
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(interopConfig.token);
                                                        setInteropSuccess('Token copied to clipboard!');
                                                        setTimeout(() => setInteropSuccess(''), 2000);
                                                    }}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        </div>

                                        {interopConfig.expiryDate && (
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                <span className="text-sm text-gray-500">Expires on:</span>
                                                <span className={`text-sm font-semibold ${interopConfig.isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {new Date(interopConfig.expiryDate).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    })}
                                                    {interopConfig.isExpired && ' (Expired)'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="px-6 py-8 text-center">
                                        <Lock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm mb-4">No API token generated yet</p>
                                        <button
                                            onClick={handleGenerateApiToken}
                                            disabled={isGeneratingToken}
                                            className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:bg-gray-400 text-sm font-semibold"
                                        >
                                            {isGeneratingToken ? 'Generating...' : 'Generate API Token'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* API Routes Documentation */}
                            <div className="bg-white rounded-2xl border border-gray-200">
                                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                                    <div className="w-9 h-9 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900">API Routes</h3>
                                        <p className="text-sm text-gray-500">Available endpoints for external access</p>
                                    </div>
                                </div>
                                <div className="px-6 py-6">

                                <div className="space-y-3">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-md">GET</span>
                                                <span className="font-mono text-sm text-gray-900">/admin/validate-token/:apiToken</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">Validate the API token and get admin information</p>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200 font-mono text-xs text-gray-700 overflow-x-auto">
                                            <div className="text-green-600">// Example:</div>
                                            <div>GET {window.location.origin}/admin/validate-token/YOUR_TOKEN_HERE</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></div>
                                        <p className="text-xs text-blue-800">
                                            <strong>Note:</strong> Use the generated API token in the route to authenticate external requests.
                                            The server address you configure will be where external systems can access this API.
                                        </p>
                                    </div>
                                </div>
                                </div>
                            </div>

                            {/* Configuration Setup */}
                            <div className="bg-white rounded-2xl border border-gray-200">
                                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                                    <div className="w-9 h-9 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-center">
                                        <Settings className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900">Server Configuration</h3>
                                        <p className="text-sm text-gray-500">Set your server address for external access</p>
                                    </div>
                                </div>

                                <div className="px-6 py-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                            Server Address / Base URL
                                        </label>
                                        <input
                                            type="text"
                                            value={interopConfig.address}
                                            onChange={(e) => {
                                                setInteropConfig({ ...interopConfig, address: e.target.value });
                                            }}
                                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-orange-500 transition-colors text-sm"
                                            placeholder="https://your-server.com"
                                        />
                                        <p className="text-xs text-gray-500 mt-1.5">The base URL where your Health Track server is accessible</p>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => {
                                                localStorage.setItem('interopServerAddress', interopConfig.address);
                                                setInteropSuccess('Server address saved!');
                                                setTimeout(() => setInteropSuccess(''), 2000);
                                            }}
                                            className="px-6 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors text-sm font-semibold"
                                        >
                                            Save Server Address
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Connection Status */}
                            <div className="bg-white rounded-2xl border border-gray-200">
                                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                                    <div className="w-9 h-9 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center">
                                        <Network className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900">Integration Status</h3>
                                        <p className="text-sm text-gray-500">Current configuration status</p>
                                    </div>
                                </div>
                                
                                <div className="px-6 py-6 space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <span className="text-sm font-medium text-gray-700">API Token</span>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                            interopConfig.token && !interopConfig.isExpired
                                                ? 'bg-green-100 text-green-700' 
                                                : interopConfig.token && interopConfig.isExpired
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {interopConfig.token ? (interopConfig.isExpired ? 'Expired' : 'Active') : 'Not Generated'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <span className="text-sm font-medium text-gray-700">Server Address</span>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                            interopConfig.address 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {interopConfig.address ? 'Configured' : 'Not Set'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reports Section */}
                    {activeSection === 'reports' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                    <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
                                    <button
                                        onClick={() => setShowReportModal(true)}
                                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Generate Report</span>
                                    </button>
                                </div>
                                
                                {reports.length === 0 ? (
                                    <div className="p-8 sm:p-16 text-center">
                                        <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No Reports Found</h3>
                                        <p className="text-gray-500 mb-6 text-sm">Generate your first report to get started</p>
                                        <button
                                            onClick={() => setShowReportModal(true)}
                                            className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                                        >
                                            Generate First Report
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Mobile Card View */}
                                        <div className="lg:hidden divide-y divide-gray-100">
                                            {reports.map((report) => (
                                                <div key={report.id} className="p-4 space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <FileText className="w-5 h-5 text-gray-400" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{report.title}</p>
                                                                {report.description && (
                                                                    <p className="text-xs text-gray-500 mt-0.5">{report.description}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-50 text-green-700">
                                                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                                        <div>
                                                            <p className="text-xs text-gray-500">Type</p>
                                                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                                                report.reportType === 'summary' ? 'bg-blue-50 text-blue-700' :
                                                                report.reportType === 'patients' ? 'bg-green-50 text-green-700' :
                                                                report.reportType === 'doctors' ? 'bg-indigo-50 text-indigo-700' :
                                                                report.reportType === 'pharmacists' ? 'bg-orange-50 text-orange-700' :
                                                                report.reportType === 'inventory' ? 'bg-yellow-50 text-yellow-700' :
                                                                report.reportType === 'transactions' ? 'bg-pink-50 text-pink-700' :
                                                                'bg-purple-50 text-purple-700'
                                                            }`}>
                                                                {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Size</p>
                                                            <p className="text-gray-600">{formatFileSize(report.fileSize)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Generated</p>
                                                            <p className="text-gray-600">{new Date(report.generatedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4 pt-2 border-t border-gray-100">
                                                        <button 
                                                            onClick={() => handleDownloadReport(report)}
                                                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            <span>Download</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteReport(report.id)}
                                                            className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center space-x-1"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Desktop Table View */}
                                        <div className="hidden lg:block overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-200">
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Report</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Generated</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Size</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {reports.map((report) => (
                                                        <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center space-x-3">
                                                                    <FileText className="w-5 h-5 text-gray-400" />
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-900">{report.title}</p>
                                                                        {report.description && (
                                                                            <p className="text-xs text-gray-500 mt-0.5">{report.description}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                                                                    report.reportType === 'summary' ? 'bg-blue-50 text-blue-700' :
                                                                    report.reportType === 'patients' ? 'bg-green-50 text-green-700' :
                                                                    report.reportType === 'doctors' ? 'bg-indigo-50 text-indigo-700' :
                                                                    report.reportType === 'pharmacists' ? 'bg-orange-50 text-orange-700' :
                                                                    report.reportType === 'inventory' ? 'bg-yellow-50 text-yellow-700' :
                                                                    report.reportType === 'transactions' ? 'bg-pink-50 text-pink-700' :
                                                                    'bg-purple-50 text-purple-700'
                                                                }`}>
                                                                    {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                                {new Date(report.generatedAt).toLocaleString('en-IN', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                                {formatFileSize(report.fileSize)}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700">
                                                                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center space-x-3">
                                                                    <button 
                                                                        onClick={() => handleDownloadReport(report)}
                                                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline flex items-center space-x-1"
                                                                    >
                                                                        <Download className="w-4 h-4" />
                                                                        <span>Download</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteReport(report.id)}
                                                                        className="text-red-600 hover:text-red-700 font-medium text-sm hover:underline flex items-center space-x-1"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                        <span>Delete</span>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                                    Add New {modalType}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            {successMessage && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-green-700 text-sm">{successMessage}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors ${
                                            formErrors.firstName ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        placeholder="Enter first name"
                                    />
                                    {formErrors.firstName && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors ${
                                            formErrors.lastName ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        placeholder="Enter last name"
                                    />
                                    {formErrors.lastName && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors ${
                                        formErrors.email ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder="Enter email address"
                                />
                                {formErrors.email && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Temporary Password *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors ${
                                        formErrors.password ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder="Enter temporary password"
                                />
                                {formErrors.password && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                                )}
                            </div>

                            {modalType === 'doctor' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Specialization *
                                    </label>
                                    <input
                                        type="text"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors ${
                                            formErrors.specialization ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        placeholder="Enter specialization"
                                    />
                                    {formErrors.specialization && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.specialization}</p>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Adding...</span>
                                        </>
                                    ) : (
                                        <span>Add {modalType}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Generate Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Generate Report</h3>
                            <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleGenerateReport} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type *</label>
                                <select
                                    required
                                    value={reportForm.reportType}
                                    onChange={(e) => setReportForm({...reportForm, reportType: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="summary">Summary Report</option>
                                    <option value="patients">Patients Data Report</option>
                                    <option value="doctors">Doctors Data Report</option>
                                    <option value="pharmacists">Pharmacists Data Report</option>
                                    <option value="inventory">Inventory Report</option>
                                    <option value="transactions">Transactions Report</option>
                                    <option value="activity">Activity Report</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Report Title</label>
                                <input
                                    type="text"
                                    value={reportForm.title}
                                    onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Monthly Summary Report"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={reportForm.description}
                                    onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Brief description of the report"
                                    rows="2"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                    <input
                                        type="date"
                                        value={reportForm.dateFrom}
                                        onChange={(e) => setReportForm({...reportForm, dateFrom: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                    <input
                                        type="date"
                                        value={reportForm.dateTo}
                                        onChange={(e) => setReportForm({...reportForm, dateTo: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-700">
                                    <strong>Note:</strong> The report will be generated and stored locally. You can download or delete it anytime from the reports list.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800"
                                >
                                    Generate Report
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReportModal(false)}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
