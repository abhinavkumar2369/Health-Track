import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import authService from '../services/authService';
import { LayoutDashboard, Stethoscope, Users, Pill, BarChart3, Settings, LogOut, User, Lock, Plus, Menu, X, FileText, Download, Trash2 } from 'lucide-react';

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
    const [patients, setPatients] = useState([]);
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
    }, [navigate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [doctorsRes, pharmacistsRes, patientsRes] = await Promise.all([
                adminAPI.getUsers('doctor'),
                adminAPI.getUsers('pharmacist'),
                adminAPI.getPatients()
            ]);

            if (doctorsRes.success) setDoctors(doctorsRes.data || []);
            if (pharmacistsRes.success) setPharmacists(pharmacistsRes.data || []);
            if (patientsRes.success) setPatients(patientsRes.data || []);

            setStats({
                totalDoctors: doctorsRes.data?.length || 0,
                totalPharmacists: pharmacistsRes.data?.length || 0,
                totalPatients: patientsRes.data?.length || 0,
                totalRevenue: 45287
            });
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
            } else if (modalType === 'patient') {
                await adminAPI.addPatient(payload);
                setSuccessMessage('Patient added successfully!');
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
            if (role === 'patient') {
                await adminAPI.removePatient(userId);
            } else {
                await adminAPI.removeUser(userId, role);
            }
            
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
        { id: 'patients', icon: Users, label: 'Patients' },
        { id: 'pharmacists', icon: Pill, label: 'Pharmacists' },
        { id: 'reports', icon: BarChart3, label: 'Reports' },
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
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-900 font-semibold bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4 text-gray-900" />
                        <span className="text-gray-900 font-semibold">Log out</span>
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
                        <div className="space-y-4 sm:space-y-6">
                            {/* Two Charts Side by Side */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {/* Critical Diseases Chart */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Critical Diseases</h3>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">This Month</span>
                                    </div>
                                    
                                    {/* Horizontal Bar Chart for Diseases */}
                                    <div className="space-y-3">
                                        {[
                                            { name: 'Diabetes', cases: 45, color: 'bg-red-500', percentage: 90 },
                                            { name: 'Hypertension', cases: 38, color: 'bg-orange-500', percentage: 76 },
                                            { name: 'Heart Disease', cases: 28, color: 'bg-pink-500', percentage: 56 },
                                            { name: 'Respiratory', cases: 22, color: 'bg-yellow-500', percentage: 44 },
                                            { name: 'Kidney Disease', cases: 15, color: 'bg-purple-500', percentage: 30 },
                                        ].map((disease, index) => (
                                            <div key={index} className="group">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-700">{disease.name}</span>
                                                    <span className="text-sm font-semibold text-gray-900">{disease.cases} cases</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                    <div 
                                                        className={`${disease.color} h-2.5 rounded-full transition-all duration-500 group-hover:opacity-80`}
                                                        style={{ width: `${disease.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Summary */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                        <div>
                                            <p className="text-xs text-gray-500">Total Cases</p>
                                            <p className="text-lg font-semibold text-gray-900">148</p>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-red-500 text-sm">↑ 8%</span>
                                            <span className="text-xs text-gray-500">vs last month</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Line Chart */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Weekly Activity</h3>
                                        <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option>This Week</option>
                                            <option>Last Week</option>
                                            <option>This Month</option>
                                        </select>
                                    </div>
                                    
                                    {/* Line Chart using SVG */}
                                    <div className="relative h-40">
                                        {/* Y-axis labels */}
                                        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400 w-6">
                                            <span>50</span>
                                            <span>25</span>
                                            <span>0</span>
                                        </div>
                                        
                                        {/* Chart area */}
                                        <div className="ml-8 h-full">
                                            <svg className="w-full h-[calc(100%-24px)]" viewBox="0 0 300 100" preserveAspectRatio="none">
                                                {/* Grid lines */}
                                                <line x1="0" y1="0" x2="300" y2="0" stroke="#f3f4f6" strokeWidth="1" />
                                                <line x1="0" y1="50" x2="300" y2="50" stroke="#f3f4f6" strokeWidth="1" />
                                                <line x1="0" y1="100" x2="300" y2="100" stroke="#f3f4f6" strokeWidth="1" />
                                                
                                                {/* Area fill */}
                                                <path
                                                    d="M 0 70 L 50 55 L 100 65 L 150 40 L 200 50 L 250 30 L 300 45 L 300 100 L 0 100 Z"
                                                    fill="url(#blueGradient)"
                                                    opacity="0.3"
                                                />
                                                
                                                {/* Line */}
                                                <path
                                                    d="M 0 70 L 50 55 L 100 65 L 150 40 L 200 50 L 250 30 L 300 45"
                                                    fill="none"
                                                    stroke="#3b82f6"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                
                                                {/* Data points */}
                                                <circle cx="0" cy="70" r="4" fill="#3b82f6" />
                                                <circle cx="50" cy="55" r="4" fill="#3b82f6" />
                                                <circle cx="100" cy="65" r="4" fill="#3b82f6" />
                                                <circle cx="150" cy="40" r="4" fill="#3b82f6" />
                                                <circle cx="200" cy="50" r="4" fill="#3b82f6" />
                                                <circle cx="250" cy="30" r="4" fill="#3b82f6" />
                                                <circle cx="300" cy="45" r="4" fill="#3b82f6" />
                                                
                                                {/* Gradient definition */}
                                                <defs>
                                                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor="#3b82f6" />
                                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            
                                            {/* X-axis labels */}
                                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                                <span>Mon</span>
                                                <span>Tue</span>
                                                <span>Wed</span>
                                                <span>Thu</span>
                                                <span>Fri</span>
                                                <span>Sat</span>
                                                <span>Sun</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Stats summary */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                        <div>
                                            <p className="text-xs text-gray-500">Total Visits</p>
                                            <p className="text-lg font-semibold text-gray-900">1,248</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Avg/Day</p>
                                            <p className="text-lg font-semibold text-gray-900">178</p>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-green-500 text-sm">↑ 12%</span>
                                            <span className="text-xs text-gray-500">vs last week</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Staff Distribution & Quick Actions */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* User Statistics - Vertical Bar Chart */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h3>
                                    
                                    {/* Vertical Bar Chart */}
                                    <div className="flex items-end justify-around h-44 px-4">
                                        {/* Doctors Bar */}
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-semibold text-gray-900 mb-1">{stats.totalDoctors}</span>
                                            <div 
                                                className="w-12 sm:w-16 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500"
                                                style={{ height: `${Math.max((stats.totalDoctors / Math.max(stats.totalDoctors, stats.totalPatients, stats.totalPharmacists, 1)) * 100, 10)}%`, minHeight: '20px' }}
                                            ></div>
                                            <span className="text-xs font-medium text-gray-600 mt-2">Doctors</span>
                                        </div>
                                        
                                        {/* Patients Bar */}
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-semibold text-gray-900 mb-1">{stats.totalPatients}</span>
                                            <div 
                                                className="w-12 sm:w-16 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all duration-500"
                                                style={{ height: `${Math.max((stats.totalPatients / Math.max(stats.totalDoctors, stats.totalPatients, stats.totalPharmacists, 1)) * 100, 10)}%`, minHeight: '20px' }}
                                            ></div>
                                            <span className="text-xs font-medium text-gray-600 mt-2">Patients</span>
                                        </div>
                                        
                                        {/* Pharmacists Bar */}
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-semibold text-gray-900 mb-1">{stats.totalPharmacists}</span>
                                            <div 
                                                className="w-12 sm:w-16 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500"
                                                style={{ height: `${Math.max((stats.totalPharmacists / Math.max(stats.totalDoctors, stats.totalPatients, stats.totalPharmacists, 1)) * 100, 10)}%`, minHeight: '20px' }}
                                            ></div>
                                            <span className="text-xs font-medium text-gray-600 mt-2">Pharmacists</span>
                                        </div>
                                    </div>
                                    
                                    {/* Total Summary */}
                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500">Total Users</p>
                                                <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors + stats.totalPatients + stats.totalPharmacists}</p>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <span className="text-green-500 text-sm">↑ 8%</span>
                                                <span className="text-xs text-gray-500">this month</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Patients - Line Chart */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Active Patients</h3>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Last 6 months</span>
                                    </div>
                                    
                                    {/* Line Chart */}
                                    <div className="relative h-44">
                                        <svg className="w-full h-full" viewBox="0 0 300 150" preserveAspectRatio="none">
                                            {/* Grid lines */}
                                            <line x1="0" y1="30" x2="300" y2="30" stroke="#f3f4f6" strokeWidth="1" />
                                            <line x1="0" y1="60" x2="300" y2="60" stroke="#f3f4f6" strokeWidth="1" />
                                            <line x1="0" y1="90" x2="300" y2="90" stroke="#f3f4f6" strokeWidth="1" />
                                            <line x1="0" y1="120" x2="300" y2="120" stroke="#f3f4f6" strokeWidth="1" />
                                            
                                            {/* Area fill */}
                                            <defs>
                                                <linearGradient id="patientGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                                                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
                                                </linearGradient>
                                            </defs>
                                            <path
                                                d="M 0 110 L 60 95 L 120 100 L 180 65 L 240 45 L 300 25 L 300 150 L 0 150 Z"
                                                fill="url(#patientGradient)"
                                            />
                                            
                                            {/* Line */}
                                            <path
                                                d="M 0 110 L 60 95 L 120 100 L 180 65 L 240 45 L 300 25"
                                                fill="none"
                                                stroke="#22c55e"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            
                                            {/* Data points */}
                                            <circle cx="0" cy="110" r="5" fill="#fff" stroke="#22c55e" strokeWidth="2" />
                                            <circle cx="60" cy="95" r="5" fill="#fff" stroke="#22c55e" strokeWidth="2" />
                                            <circle cx="120" cy="100" r="5" fill="#fff" stroke="#22c55e" strokeWidth="2" />
                                            <circle cx="180" cy="65" r="5" fill="#fff" stroke="#22c55e" strokeWidth="2" />
                                            <circle cx="240" cy="45" r="5" fill="#fff" stroke="#22c55e" strokeWidth="2" />
                                            <circle cx="300" cy="25" r="5" fill="#22c55e" stroke="#22c55e" strokeWidth="2" />
                                        </svg>
                                    </div>
                                    
                                    {/* X-axis labels */}
                                    <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                                        <span>Jun</span>
                                        <span>Jul</span>
                                        <span>Aug</span>
                                        <span>Sep</span>
                                        <span>Oct</span>
                                        <span>Nov</span>
                                    </div>
                                    
                                    {/* Stats summary */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                        <div>
                                            <p className="text-xs text-gray-500">Current Active</p>
                                            <p className="text-lg font-semibold text-gray-900">267</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Avg/Month</p>
                                            <p className="text-lg font-semibold text-gray-900">185</p>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-green-500 text-sm">↑ 14%</span>
                                            <span className="text-xs text-gray-500">growth</span>
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
                                                        <span className="text-xs text-gray-400">ID: {doctor.uniqueId || doctor.id}</span>
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
                                                            <td className="px-4 lg:px-6 py-4 text-sm font-mono text-gray-600">{doctor.uniqueId || doctor.id}</td>
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

                    {/* Patients Section */}
                    {activeSection === 'patients' && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Table Card */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Patients</h3>
                                </div>
                                
                                {loading ? (
                                    <div className="p-8 sm:p-16 text-center">
                                        <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        <p className="text-gray-500 mt-4 text-sm">Loading patients...</p>
                                    </div>
                                ) : patients.length === 0 ? (
                                    <div className="p-8 sm:p-16 text-center">
                                        <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No Patients Found</h3>
                                        <p className="text-gray-500 mb-6 text-sm">Add your first patient to get started</p>
                                        <button
                                            onClick={() => openAddUserModal('patient')}
                                            className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                                        >
                                            Add First Patient
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Mobile Card View */}
                                        <div className="sm:hidden divide-y divide-gray-100">
                                            {patients.map((patient) => (
                                                <div key={patient.id} className="p-4 space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-gray-900 text-sm truncate">{patient.name || '—'}</p>
                                                            <p className="text-xs text-gray-500 truncate">{patient.email || '—'}</p>
                                                        </div>
                                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full ml-2">
                                                            Active
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-400">ID: {patient.uniqueId || patient.id}</span>
                                                        <button
                                                            onClick={() => handleRemoveUser(patient.id, 'patient')}
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
                                                    {patients.map((patient) => (
                                                        <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 lg:px-6 py-4 text-sm font-mono text-gray-600">{patient.uniqueId || patient.id}</td>
                                                            <td className="px-4 lg:px-6 py-4 text-sm font-medium text-gray-900">{patient.name || '—'}</td>
                                                            <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{patient.email || '—'}</td>
                                                            <td className="px-4 lg:px-6 py-4">
                                                                <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                                                                    Active
                                                                </span>
                                                            </td>
                                                            <td className="px-4 lg:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">{formatDisplayDate(patient.createdAt)}</td>
                                                            <td className="px-4 lg:px-6 py-4">
                                                                <button
                                                                    onClick={() => handleRemoveUser(patient.id, 'patient')}
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
                                                        <span className="text-xs text-gray-400">ID: {pharmacist.uniqueId || pharmacist.id}</span>
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
                                                            <td className="px-4 lg:px-6 py-4 text-sm font-mono text-gray-600">{pharmacist.uniqueId || pharmacist.id}</td>
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
                        <div className="space-y-4 sm:space-y-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h2>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}
                            {successMessage && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-green-700 text-sm">{successMessage}</p>
                                </div>
                            )}

                            {/* Profile Settings */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600">
                                        {user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{user?.fullName || profileForm.fullname || 'Administrator'}</h3>
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
                                                className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors ${
                                                    profileErrors.fullname ? 'border-red-500' : ''
                                                }`}
                                                placeholder="Enter your name"
                                            />
                                            {profileErrors.fullname && (
                                                <p className="text-red-500 text-xs mt-1">{profileErrors.fullname}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                            <select
                                                name="gender"
                                                value={profileForm.gender}
                                                onChange={handleProfileInputChange}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors"
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
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors"
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
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
                                                className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors ${
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
                                                className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors ${
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
                                                className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-0 transition-colors ${
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
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                                    >
                                        {isSubmitting ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
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
                                                                report.reportType === 'users' ? 'bg-green-50 text-green-700' :
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
                                                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1">
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
                                                                    report.reportType === 'users' ? 'bg-green-50 text-green-700' :
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
                                                                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline flex items-center space-x-1">
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
                                    <option value="users">Users Report</option>
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
