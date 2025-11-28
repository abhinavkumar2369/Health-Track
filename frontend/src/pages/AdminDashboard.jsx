import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import authService from '../services/authService';
import { LayoutDashboard, Stethoscope, Users, Pill, BarChart3, Settings, LogOut, User, Lock, Plus } from 'lucide-react';

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

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/sign-in');
            return;
        }
        setUser(currentUser);
        loadData();
        loadProfile();
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
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <img src="/favicon.svg" alt="Health Track" className="w-8 h-8" />
                        <span className="text-lg font-bold text-gray-900">Health Track</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {sidebarItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
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
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.email || 'mail@abhinavkumar.dev'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Administrator</p>
                    </div>
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
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8">
                    <div className="text-sm text-gray-500">
                        {new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-8">
                    {activeSection === 'dashboard' && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-500">Total Doctors</span>
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Stethoscope className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-3xl font-bold text-gray-900">
                                                {stats.totalDoctors}
                                            </div>
                                            <div className="flex items-center mt-2 text-sm">
                                                <span className="text-green-600 font-medium">↑ 8.5%</span>
                                                <span className="text-gray-500 ml-2">vs last month</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-500">Total Patients</span>
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Users className="w-5 h-5 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-3xl font-bold text-gray-900">
                                                {stats.totalPatients}
                                            </div>
                                            <div className="flex items-center mt-2 text-sm">
                                                <span className="text-green-600 font-medium">↑ 12.3%</span>
                                                <span className="text-gray-500 ml-2">vs last month</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-500">Pharmacists</span>
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Pill className="w-5 h-5 text-purple-600" />
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-3xl font-bold text-gray-900">
                                                {stats.totalPharmacists}
                                            </div>
                                            <div className="flex items-center mt-2 text-sm">
                                                <span className="text-green-600 font-medium">↑ 5.2%</span>
                                                <span className="text-gray-500 ml-2">vs last month</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Activity Chart */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900">Patient Activity</h3>
                                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                            View all
                                        </button>
                                    </div>
                                    <div className="h-64 flex items-end justify-between space-x-2">
                                        {[45, 65, 35, 70, 55, 80, 60, 75, 50, 85, 70, 90].map((height, idx) => (
                                            <div key={idx} className="flex-1 flex flex-col items-center">
                                                <div 
                                                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer"
                                                    style={{ height: `${height}%` }}
                                                ></div>
                                                <span className="text-xs text-gray-500 mt-2">
                                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Department Distribution */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900">Department Distribution</h3>
                                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                            View all
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { name: 'Cardiology', value: 28, color: 'bg-blue-500' },
                                            { name: 'Neurology', value: 22, color: 'bg-purple-500' },
                                            { name: 'Orthopedics', value: 18, color: 'bg-green-500' },
                                            { name: 'Pediatrics', value: 15, color: 'bg-yellow-500' },
                                            { name: 'General', value: 17, color: 'bg-pink-500' }
                                        ].map((dept) => (
                                            <div key={dept.name}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                                                    <span className="text-sm font-semibold text-gray-900">{dept.value}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div 
                                                        className={`${dept.color} h-2 rounded-full transition-all duration-300`}
                                                        style={{ width: `${dept.value}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-xl border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {[
                                        { action: 'New doctor registered', name: 'Dr. Sarah Johnson', time: '2 hours ago', icon: '👨‍⚕️', color: 'bg-blue-100 text-blue-600' },
                                        { action: 'Patient appointment booked', name: 'John Doe', time: '4 hours ago', icon: '📅', color: 'bg-green-100 text-green-600' },
                                        { action: 'Prescription issued', name: 'Dr. Michael Chen', time: '6 hours ago', icon: '💊', color: 'bg-purple-100 text-purple-600' },
                                        { action: 'Lab report uploaded', name: 'Lab Department', time: '8 hours ago', icon: '📋', color: 'bg-yellow-100 text-yellow-600' }
                                    ].map((activity, idx) => (
                                        <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-10 h-10 ${activity.color} rounded-full flex items-center justify-center`}>
                                                    <span>{activity.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                                    <p className="text-sm text-gray-500">{activity.name}</p>
                                                </div>
                                                <span className="text-xs text-gray-400">{activity.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Doctors Section */}
                    {activeSection === 'doctors' && (
                        <div className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-700">{error}</p>
                                </div>
                            )}
                            {successMessage && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-green-700">{successMessage}</p>
                                </div>
                            )}

                            {/* Table Card */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                {loading ? (
                                    <div className="p-16 text-center">
                                        <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        <p className="text-gray-500 mt-4 text-sm">Loading doctors...</p>
                                    </div>
                                ) : doctors.length === 0 ? (
                                    <div className="p-16 text-center">
                                        <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Doctors Found</h3>
                                        <p className="text-gray-500 mb-6 text-sm">Add your first doctor to get started</p>
                                        <button
                                            onClick={() => openAddUserModal('doctor')}
                                            className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                                        >
                                            Add First Doctor
                                        </button>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Specialization</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {doctors.map((doctor) => (
                                                    <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{doctor.uniqueId || doctor.id}</td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{doctor.name || '—'}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{doctor.email || '—'}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                                                                {doctor.specialization || 'General'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{formatDisplayDate(doctor.createdAt)}</td>
                                                        <td className="px-6 py-4">
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
                                )}
                            </div>
                        </div>
                    )}

                    {/* Patients Section */}
                    {activeSection === 'patients' && (
                        <div className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-700">{error}</p>
                                </div>
                            )}
                            {successMessage && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-green-700">{successMessage}</p>
                                </div>
                            )}

                            {/* Table Card */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                {loading ? (
                                    <div className="p-16 text-center">
                                        <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        <p className="text-gray-500 mt-4 text-sm">Loading patients...</p>
                                    </div>
                                ) : patients.length === 0 ? (
                                    <div className="p-16 text-center">
                                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Patients Found</h3>
                                        <p className="text-gray-500 mb-6 text-sm">Add your first patient to get started</p>
                                        <button
                                            onClick={() => openAddUserModal('patient')}
                                            className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                                        >
                                            Add First Patient
                                        </button>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {patients.map((patient) => (
                                                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{patient.uniqueId || patient.id}</td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{patient.name || '—'}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{patient.email || '—'}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                                                                Active
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{formatDisplayDate(patient.createdAt)}</td>
                                                        <td className="px-6 py-4">
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
                                )}
                            </div>
                        </div>
                    )}

                    {/* Pharmacists Section */}
                    {activeSection === 'pharmacists' && (
                        <div className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-700">{error}</p>
                                </div>
                            )}
                            {successMessage && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-green-700">{successMessage}</p>
                                </div>
                            )}

                            {/* Table Card */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                {loading ? (
                                    <div className="p-16 text-center">
                                        <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        <p className="text-gray-500 mt-4 text-sm">Loading pharmacists...</p>
                                    </div>
                                ) : pharmacists.length === 0 ? (
                                    <div className="p-16 text-center">
                                        <Pill className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Pharmacists Found</h3>
                                        <p className="text-gray-500 mb-6 text-sm">Add your first pharmacist to get started</p>
                                        <button
                                            onClick={() => openAddUserModal('pharmacist')}
                                            className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                                        >
                                            Add First Pharmacist
                                        </button>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {pharmacists.map((pharmacist) => (
                                                    <tr key={pharmacist.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{pharmacist.uniqueId || pharmacist.id}</td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{pharmacist.name || '—'}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{pharmacist.email || '—'}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full">
                                                                Active
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{formatDisplayDate(pharmacist.createdAt)}</td>
                                                        <td className="px-6 py-4">
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
                                )}
                            </div>
                        </div>
                    )}

                    {/* Settings Section */}
                    {activeSection === 'settings' && (
                        <div className="max-w-4xl space-y-6">
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

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Profile Settings */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <User className="w-5 h-5 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                                    </div>

                                    <form onSubmit={handleProfileUpdate} className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="fullname"
                                                value={profileForm.fullname}
                                                onChange={handleProfileInputChange}
                                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    profileErrors.fullname ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Your name"
                                            />
                                            {profileErrors.fullname && (
                                                <p className="text-red-500 text-xs mt-1">{profileErrors.fullname}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Gender
                                                </label>
                                                <select
                                                    name="gender"
                                                    value={profileForm.gender}
                                                    onChange={handleProfileInputChange}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Select</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={profileForm.phone}
                                                    onChange={handleProfileInputChange}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Phone number"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                                disabled
                                            />
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Password Settings */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <Lock className="w-5 h-5 text-purple-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                                    </div>

                                    <form onSubmit={handlePasswordChange} className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Current Password *
                                            </label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={passwordForm.currentPassword}
                                                onChange={handlePasswordInputChange}
                                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Current password"
                                            />
                                            {passwordErrors.currentPassword && (
                                                <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                New Password *
                                            </label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwordForm.newPassword}
                                                onChange={handlePasswordInputChange}
                                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="New password (min 6 chars)"
                                            />
                                            {passwordErrors.newPassword && (
                                                <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Confirm Password *
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordForm.confirmPassword}
                                                onChange={handlePasswordInputChange}
                                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Confirm password"
                                            />
                                            {passwordErrors.confirmPassword && (
                                                <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                                            )}
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? 'Changing...' : 'Change Password'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reports - placeholder */}
                    {activeSection === 'reports' && (
                        <div className="bg-white rounded-xl p-8 border border-gray-200">
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📈</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Reports</h3>
                                <p className="text-gray-500">View and generate reports</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            formErrors.firstName ? 'border-red-500' : 'border-gray-300'
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
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            formErrors.lastName ? 'border-red-500' : 'border-gray-300'
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
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        formErrors.email ? 'border-red-500' : 'border-gray-300'
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
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        formErrors.password ? 'border-red-500' : 'border-gray-300'
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
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            formErrors.specialization ? 'border-red-500' : 'border-gray-300'
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
        </div>
    );
};

export default AdminDashboard;
