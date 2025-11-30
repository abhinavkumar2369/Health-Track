import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import authService from '../services/authService';
import { LayoutDashboard, Users, FileText, Pill, BarChart3, Settings, LogOut, Plus, Menu, X, Calendar, Clock, Download, Trash2 } from 'lucide-react';

const initialFormState = {
    fullname: '',
    email: '',
    password: '',
};

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Profile form states
    const [profileForm, setProfileForm] = useState({
        fullname: '',
        gender: '',
        phone: '',
        specialization: ''
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

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'doctor') {
            navigate('/sign-in');
            return;
        }
        setUser(currentUser);
        loadPatients();
        loadProfile();
        loadReports();
    }, [navigate]);

    const loadPatients = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await doctorAPI.getMyPatients();
            setPatients(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error('Error loading patients:', err);
            setError(err.message || 'Failed to load patients');
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const loadProfile = async () => {
        try {
            const response = await doctorAPI.getProfile();
            if (response.success && response.profile) {
                setProfileForm({
                    fullname: response.profile.fullname || '',
                    gender: response.profile.gender || '',
                    phone: response.profile.phone || '',
                    specialization: response.profile.specialization || ''
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const loadReports = () => {
        const savedReports = localStorage.getItem('doctorReports');
        if (savedReports) {
            setReports(JSON.parse(savedReports));
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/sign-in');
    };

    const openAddPatientModal = () => {
        setFormData(initialFormState);
        setFormErrors({});
        setError('');
        setSuccessMessage('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
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
        if (!formData.fullname.trim()) {
            errors.fullname = 'Full name is required';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errors.email = 'Enter a valid email address';
        }
        if (!formData.password.trim() || formData.password.trim().length < 6) {
            errors.password = 'Password must be at least 6 characters';
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

        try {
            await doctorAPI.addPatient(
                formData.fullname.trim(),
                formData.email.trim(),
                formData.password.trim()
            );
            setSuccessMessage('Patient added successfully!');
            setFormData(initialFormState);
            await loadPatients();

            setTimeout(() => {
                closeModal();
            }, 1500);
        } catch (submissionError) {
            console.error('Error adding patient:', submissionError);
            setError(submissionError.message || 'Failed to add patient. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemovePatient = async (patientId) => {
        if (!window.confirm('Are you sure you want to remove this patient?')) {
            return;
        }

        setError('');
        setSuccessMessage('');
        setLoading(true);
        try {
            await doctorAPI.removePatient(patientId);
            await loadPatients();
            setSuccessMessage('Patient removed successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (removeError) {
            console.error('Error removing patient:', removeError);
            setError(removeError.message || 'Failed to remove patient');
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
            const response = await doctorAPI.updateProfile(profileForm);
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
            const response = await doctorAPI.changePassword({
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
        localStorage.setItem('doctorReports', JSON.stringify(updatedReports));
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
            localStorage.setItem('doctorReports', JSON.stringify(updatedReports));
            setSuccessMessage('Report deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const sidebarItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'patients', icon: Users, label: 'Patients' },
        { id: 'appointments', icon: Calendar, label: 'Appointments' },
        { id: 'prescriptions', icon: Pill, label: 'Prescriptions' },
        { id: 'reports', icon: BarChart3, label: 'Reports' },
        { id: 'settings', icon: Settings, label: 'Settings' }
    ];

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

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
                                        ? 'bg-emerald-50 text-emerald-600'
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
                    {/* Success/Error Messages */}
                    {successMessage && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            {successMessage}
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {activeSection === 'dashboard' && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Patients</p>
                                            <p className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-2">{patients.length}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                            <Users className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Appointments</p>
                                            <p className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-2">0</p>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Prescriptions</p>
                                            <p className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-2">0</p>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                            <Pill className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
                                            <p className="text-2xl sm:text-3xl font-semibold text-amber-600 mt-2">0</p>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {/* Recent Patients */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
                                        <button 
                                            onClick={() => setActiveSection('patients')}
                                            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                        >
                                            View All
                                        </button>
                                    </div>
                                    {patients.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">No patients yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {patients.slice(0, 5).map((patient) => (
                                                <div key={patient._id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-white">
                                                            {patient.fullname?.charAt(0).toUpperCase() || 'P'}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{patient.fullname || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-500 truncate">{patient.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Today's Schedule */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="text-center py-8">
                                        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">No appointments scheduled</p>
                                        <button className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                                            + Add Appointment
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <button 
                                        onClick={openAddPatientModal}
                                        className="p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors text-center"
                                    >
                                        <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                                        <span className="text-sm font-medium text-emerald-700">Add Patient</span>
                                    </button>
                                    <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
                                        <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                        <span className="text-sm font-medium text-blue-700">Schedule</span>
                                    </button>
                                    <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
                                        <Pill className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                        <span className="text-sm font-medium text-purple-700">Prescribe</span>
                                    </button>
                                    <button 
                                        onClick={() => setShowReportModal(true)}
                                        className="p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors text-center"
                                    >
                                        <FileText className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                                        <span className="text-sm font-medium text-amber-700">Report</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'patients' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Patient Records</h2>
                                <button 
                                    onClick={openAddPatientModal}
                                    className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Add Patient</span>
                                </button>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200">
                                {loading && (
                                    <div className="text-center py-12">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                                        <p className="mt-4 text-gray-600">Loading patients...</p>
                                    </div>
                                )}

                                {!loading && patients.length === 0 && (
                                    <div className="text-center py-12 px-4">
                                        <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Patients Yet</h3>
                                        <p className="text-gray-500 mb-4">Start by adding your first patient</p>
                                        <button
                                            onClick={openAddPatientModal}
                                            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                                        >
                                            Add Your First Patient
                                        </button>
                                    </div>
                                )}

                                {!loading && patients.length > 0 && (
                                    <div className="divide-y divide-gray-200">
                                        {patients.map((patient) => (
                                            <div key={patient._id} className="px-4 sm:px-6 py-4 hover:bg-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                                                                <span className="text-sm font-medium text-white">
                                                                    {patient.fullname?.charAt(0).toUpperCase() || 'P'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{patient.fullname || 'Unknown Patient'}</p>
                                                            <p className="text-sm text-gray-500 truncate">{patient.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                                        <button 
                                                            onClick={() => handleRemovePatient(patient._id)}
                                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                            title="Remove patient"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'appointments' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Appointments</h2>
                                <button className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                                    <Plus className="w-5 h-5" />
                                    <span>Add Appointment</span>
                                </button>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Appointments</h3>
                                <p className="text-gray-500">You don't have any appointments scheduled</p>
                            </div>
                        </div>
                    )}

                    {activeSection === 'prescriptions' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Prescriptions</h2>
                                <button className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                                    <Plus className="w-5 h-5" />
                                    <span>New Prescription</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:border-emerald-200 transition-colors">
                                    <Pill className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                                    <h4 className="font-medium text-gray-900 mb-2">Create New Prescription</h4>
                                    <p className="text-sm text-gray-600 mb-4">Generate digital prescriptions for your patients</p>
                                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">
                                        Create Prescription
                                    </button>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:border-gray-300 transition-colors">
                                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <h4 className="font-medium text-gray-900 mb-2">Prescription History</h4>
                                    <p className="text-sm text-gray-600 mb-4">View and manage past prescriptions</p>
                                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">
                                        View History
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'reports' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Reports</h2>
                                <button 
                                    onClick={() => setShowReportModal(true)}
                                    className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Generate Report</span>
                                </button>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200">
                                {reports.length === 0 ? (
                                    <div className="text-center py-12 px-4">
                                        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reports Yet</h3>
                                        <p className="text-gray-500 mb-4">Generate your first report to get started</p>
                                        <button
                                            onClick={() => setShowReportModal(true)}
                                            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                                        >
                                            Generate Report
                                        </button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200">
                                        {reports.map((report) => (
                                            <div key={report.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3 min-w-0">
                                                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                            <FileText className="w-5 h-5 text-emerald-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(report.generatedAt).toLocaleDateString()} • {formatFileSize(report.fileSize)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button className="text-emerald-600 hover:text-emerald-800 p-2 rounded-lg hover:bg-emerald-50 transition-colors">
                                                            <Download className="w-5 h-5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteReport(report.id)}
                                                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'settings' && (
                        <div className="space-y-4 sm:space-y-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h2>

                            {/* Profile Settings */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-xl font-bold text-emerald-600">
                                        {user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'D'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{user?.fullName || profileForm.fullname || 'Doctor'}</h3>
                                        <p className="text-sm text-gray-500">{user?.email || 'No email'}</p>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                name="fullname"
                                                value={profileForm.fullname}
                                                onChange={handleProfileInputChange}
                                                className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                                    profileErrors.fullname ? 'border-red-500' : ''
                                                }`}
                                                placeholder="Enter your name"
                                            />
                                            {profileErrors.fullname && (
                                                <p className="text-red-500 text-xs mt-1">{profileErrors.fullname}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                                            <input
                                                type="text"
                                                name="specialization"
                                                value={profileForm.specialization}
                                                onChange={handleProfileInputChange}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                                placeholder="Enter specialization"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                            <select
                                                name="gender"
                                                value={profileForm.gender}
                                                onChange={handleProfileInputChange}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                            >
                                                <option value="">Select gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={profileForm.phone}
                                                onChange={handleProfileInputChange}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>

                            {/* Password Change */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={passwordForm.currentPassword}
                                                onChange={handlePasswordInputChange}
                                                className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                                    passwordErrors.currentPassword ? 'border-red-500' : ''
                                                }`}
                                                placeholder="Current password"
                                            />
                                            {passwordErrors.currentPassword && (
                                                <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwordForm.newPassword}
                                                onChange={handlePasswordInputChange}
                                                className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                                    passwordErrors.newPassword ? 'border-red-500' : ''
                                                }`}
                                                placeholder="New password"
                                            />
                                            {passwordErrors.newPassword && (
                                                <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordForm.confirmPassword}
                                                onChange={handlePasswordInputChange}
                                                className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                                    passwordErrors.confirmPassword ? 'border-red-500' : ''
                                                }`}
                                                placeholder="Confirm password"
                                            />
                                            {passwordErrors.confirmPassword && (
                                                <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400"
                                    >
                                        {isSubmitting ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Add Patient Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Add New Patient</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        {successMessage && (
                            <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                                {successMessage}
                            </div>
                        )}
                        
                        {error && (
                            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                        formErrors.fullname ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder="Enter patient's full name"
                                />
                                {formErrors.fullname && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.fullname}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
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
                                    className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                        formErrors.password ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder="Enter temporary password"
                                />
                                {formErrors.password && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                                )}
                            </div>

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
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Adding...</span>
                                        </>
                                    ) : (
                                        <span>Add Patient</span>
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
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleGenerateReport} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type *</label>
                                <select
                                    required
                                    value={reportForm.reportType}
                                    onChange={(e) => setReportForm({...reportForm, reportType: e.target.value})}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                >
                                    <option value="summary">Summary Report</option>
                                    <option value="patients">Patients Report</option>
                                    <option value="activity">Activity Report</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Report Title</label>
                                <input
                                    type="text"
                                    value={reportForm.title}
                                    onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                    placeholder="e.g., Monthly Summary Report"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={reportForm.description}
                                    onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
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
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                    <input
                                        type="date"
                                        value={reportForm.dateTo}
                                        onChange={(e) => setReportForm({...reportForm, dateTo: e.target.value})}
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                <p className="text-sm text-emerald-700">
                                    <strong>Note:</strong> The report will be generated and stored locally. You can download or delete it anytime from the reports list.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
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

export default DoctorDashboard;
