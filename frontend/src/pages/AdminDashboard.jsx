import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import authService from '../services/authService';

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
    const [activeTab, setActiveTab] = useState('overview');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [modalInfo, setModalInfo] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [pharmacists, setPharmacists] = useState([]);
    const [patients, setPatients] = useState([]);
    const [patientCount, setPatientCount] = useState(0);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadOverview = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await adminAPI.getUsers();
            if (response.success) {
                const doctorList = response.doctors || [];
                const pharmacistList = response.pharmacists || [];
                setDoctors(doctorList);
                setPharmacists(pharmacistList);
                setPatientCount(response.patientCount || 0);
                if (activeTab === 'overview') {
                    setUsers([...doctorList, ...pharmacistList]);
                }
            }
        } catch (fetchError) {
            console.error('Error loading users:', fetchError);
            setError(fetchError.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    const loadRole = useCallback(async (role) => {
        setLoading(true);
        setError('');
        try {
            if (role === 'patient') {
                const response = await adminAPI.getPatients();
                if (response.success) {
                    const list = response.data || [];
                    setUsers(list);
                    setPatients(list);
                }
            } else {
                const response = await adminAPI.getUsers(role);
                if (response.success) {
                    const list = response.data || [];
                    setUsers(list);
                    if (role === 'doctor') {
                        setDoctors(list);
                    } else if (role === 'pharmacist') {
                        setPharmacists(list);
                    }
                }
            }
        } catch (fetchError) {
            console.error('Error loading users:', fetchError);
            setError(fetchError.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/sign-in');
            return;
        }
        setUser(currentUser);
    }, [navigate]);

    useEffect(() => {
        if (!user) return;
        if (activeTab === 'overview') {
            loadOverview();
        } else {
            loadRole(activeTab.slice(0, -1));
        }
    }, [user, activeTab, loadOverview, loadRole]);

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const openAddUserModal = (type) => {
        setModalType(type);
        setFormData(initialFormState);
        setFormErrors({});
        setError('');
        setSuccessMessage('');
        setModalInfo('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType('');
        setModalInfo('');
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
                setSuccessMessage('Doctor added successfully. Share the temporary password with the doctor.');
            } else if (modalType === 'pharmacist') {
                await adminAPI.addPharmacist(payload);
                setSuccessMessage('Pharmacist added successfully. Share the temporary password with the pharmacist.');
            } else if (modalType === 'patient') {
                await adminAPI.addPatient(payload);
                setSuccessMessage('Patient added successfully. Share the temporary password with the patient.');
            }

            setFormData(initialFormState);

            await loadOverview();
            if (activeTab === 'doctors') {
                await loadRole('doctor');
            } else if (activeTab === 'pharmacists') {
                await loadRole('pharmacist');
            } else if (activeTab === 'patients') {
                await loadRole('patient');
            }
        } catch (submissionError) {
            console.error('Error adding user:', submissionError);
            setError(submissionError.message || 'Failed to add user. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveUser = async (userId, role) => {
        setError('');
        setSuccessMessage('');
        setLoading(true);
        try {
            if (role === 'patient') {
                await adminAPI.removePatient(userId);
            } else {
                await adminAPI.removeUser(userId, role);
            }
            
            await loadOverview();
            if (role === 'doctor' && activeTab === 'doctors') {
                await loadRole('doctor');
            } else if (role === 'pharmacist' && activeTab === 'pharmacists') {
                await loadRole('pharmacist');
            } else if (role === 'patient' && activeTab === 'patients') {
                await loadRole('patient');
            } else {
                setUsers((prev) => prev.filter((item) => item.id !== userId));
            }
        } catch (removeError) {
            console.error('Error removing user:', removeError);
            setError(removeError.message || 'Failed to remove user');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: 'Total Staff',
            value: (doctors.length + pharmacists.length).toString(),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
            ),
            color: 'from-slate-500 to-slate-600',
        },
        {
            label: 'Doctors',
            value: doctors.length.toString(),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            color: 'from-emerald-500 to-emerald-600',
        },
        {
            label: 'Patients',
            value: patientCount.toString(),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            color: 'from-indigo-500 to-indigo-600',
        },
        {
            label: 'Pharmacists',
            value: pharmacists.length.toString(),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            ),
            color: 'from-teal-500 to-teal-600',
        },
    ];

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

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Admin Panel</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="border-b border-gray-200">
                        <div className="flex overflow-x-auto">
                            {['overview', 'doctors', 'patients', 'pharmacists'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                                        activeTab === tab
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">System Overview</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button
                                            onClick={() => openAddUserModal('doctor')}
                                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span className="font-semibold">Add Doctor</span>
                                        </button>
                                        <button
                                            onClick={() => openAddUserModal('patient')}
                                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span className="font-semibold">Add Patient</span>
                                        </button>
                                        <button
                                            onClick={() => openAddUserModal('pharmacist')}
                                            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span className="font-semibold">Add Pharmacist</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'patients' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Patients</h2>
                                    <button
                                        onClick={() => openAddUserModal('patient')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                    >
                                        + Add Patient
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        <p className="text-gray-600 mt-4">Loading...</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {users.map((member) => (
                                                    <tr key={member.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {member.uniqueId || member.id}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {member.name || '—'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {member.email || '—'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            Patient
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {formatDisplayDate(member.createdAt)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <button
                                                                onClick={() => handleRemoveUser(member.id, 'patient')}
                                                                className="text-red-600 hover:text-red-800 font-medium"
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {users.length === 0 && (
                                            <div className="text-center py-12 text-gray-500">
                                                No patients found.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {(activeTab === 'overview' || activeTab === 'doctors' || activeTab === 'pharmacists') && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {activeTab === 'overview' ? 'Team Members' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                                    </h2>
                                    {activeTab !== 'overview' && (
                                        <button
                                            onClick={() => openAddUserModal(activeTab.slice(0, -1))}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                        >
                                            + Add {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1)}
                                        </button>
                                    )}
                                </div>

                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        <p className="text-gray-600 mt-4">Loading...</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Details</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {users.map((member) => (
                                                    <tr key={member.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {member.uniqueId || member.id}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {member.name || '—'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {member.email || '—'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {member.role === 'doctor'
                                                                ? member.specialization || 'Doctor'
                                                                : member.role === 'pharmacist'
                                                                    ? 'Pharmacist'
                                                                    : member.role || '—'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {formatDisplayDate(member.createdAt)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <button
                                                                onClick={() => handleRemoveUser(member.id, member.role)}
                                                                className="text-red-600 hover:text-red-800 font-medium"
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {users.length === 0 && (
                                            <div className="text-center py-12 text-gray-500">
                                                No records available.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                                {modalType === 'doctor'
                                    ? 'Add Doctor'
                                    : modalType === 'pharmacist'
                                        ? 'Add Pharmacist'
                                        : 'Add Patient'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {modalInfo && (
                            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                                {modalInfo}
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-700 text-sm">{successMessage}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                formErrors.firstName ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="Jane"
                                        />
                                        {formErrors.firstName && (
                                            <p className="mt-1 text-xs text-red-600">{formErrors.firstName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                formErrors.lastName ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="Doe"
                                        />
                                        {formErrors.lastName && (
                                            <p className="mt-1 text-xs text-red-600">{formErrors.lastName}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            formErrors.email ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="user@example.com"
                                    />
                                    {formErrors.email && (
                                        <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                                    )}
                                </div>

                                {modalType === 'doctor' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                        <input
                                            type="text"
                                            name="specialization"
                                            value={formData.specialization}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                formErrors.specialization ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="Cardiology"
                                        />
                                        {formErrors.specialization && (
                                            <p className="mt-1 text-xs text-red-600">{formErrors.specialization}</p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Temporary password</label>
                                    <input
                                        type="text"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            formErrors.password ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="At least 6 characters"
                                    />
                                    {formErrors.password && (
                                        <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>
                                    )}
                                    <p className="mt-2 text-xs text-gray-500">Share this temporary password securely and ask the user to reset it after the first login.</p>
                                </div>

                                <div className="flex space-x-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Creating...' : 'Create account'}
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
