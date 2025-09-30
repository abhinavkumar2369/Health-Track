import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'doctors', 'patients', 'pharmacists'
    const [modalAction, setModalAction] = useState(''); // 'add', 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [interoperabilityEnabled, setInteroperabilityEnabled] = useState(true);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        specialization: '', // for doctors
        license: '', // for doctors and pharmacists
        department: '' // for doctors
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/signin');
            return;
        }
        
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'admin') {
            navigate('/signin');
            return;
        }
        
        setUser(parsedUser);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    // Sample data for different user types
    const [doctors, setDoctors] = useState([
        { id: 1, fullName: 'Dr. Sarah Johnson', email: 'sarah.johnson@healthtrack.com', phone: '+1-555-0123', specialization: 'Cardiology', license: 'MD12345', department: 'Internal Medicine', status: 'active' },
        { id: 2, fullName: 'Dr. Michael Chen', email: 'michael.chen@healthtrack.com', phone: '+1-555-0124', specialization: 'Pediatrics', license: 'MD12346', department: 'Pediatrics', status: 'active' },
        { id: 3, fullName: 'Dr. Emily Rodriguez', email: 'emily.rodriguez@healthtrack.com', phone: '+1-555-0125', specialization: 'Orthopedics', license: 'MD12347', department: 'Surgery', status: 'inactive' }
    ]);

    const [patients, setPatients] = useState([
        { id: 1, fullName: 'John Smith', email: 'john.smith@email.com', phone: '+1-555-0201', dateOfBirth: '1985-03-15', address: '123 Main St, City, State', emergencyContact: '+1-555-0301', status: 'active' },
        { id: 2, fullName: 'Mary Williams', email: 'mary.williams@email.com', phone: '+1-555-0202', dateOfBirth: '1992-07-22', address: '456 Oak Ave, City, State', emergencyContact: '+1-555-0302', status: 'active' },
        { id: 3, fullName: 'David Brown', email: 'david.brown@email.com', phone: '+1-555-0203', dateOfBirth: '1978-11-08', address: '789 Pine Rd, City, State', emergencyContact: '+1-555-0303', status: 'inactive' }
    ]);

    const [pharmacists, setPharmacists] = useState([
        { id: 1, fullName: 'Lisa Thompson', email: 'lisa.thompson@healthtrack.com', phone: '+1-555-0401', license: 'PH12345', pharmacy: 'Central Pharmacy', yearsExperience: 8, status: 'active' },
        { id: 2, fullName: 'Robert Garcia', email: 'robert.garcia@healthtrack.com', phone: '+1-555-0402', license: 'PH12346', pharmacy: 'North Branch Pharmacy', yearsExperience: 12, status: 'active' },
        { id: 3, fullName: 'Amanda Davis', email: 'amanda.davis@healthtrack.com', phone: '+1-555-0403', license: 'PH12347', pharmacy: 'South Branch Pharmacy', yearsExperience: 6, status: 'inactive' }
    ]);

    // Modal functions
    const openModal = (type, action = 'add', user = null) => {
        setModalType(type);
        setModalAction(action);
        setSelectedUser(user);
        if (user && action === 'edit') {
            setFormData(user);
        } else {
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                specialization: '',
                license: '',
                department: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType('');
        setModalAction('');
        setSelectedUser(null);
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            specialization: '',
            license: '',
            department: ''
        });
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send data to backend
        console.log('Form submitted:', formData);
        closeModal();
    };

    const deleteUser = (type, id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            if (type === 'doctors') {
                setDoctors(doctors.filter(doc => doc.id !== id));
            } else if (type === 'patients') {
                setPatients(patients.filter(patient => patient.id !== id));
            } else if (type === 'pharmacists') {
                setPharmacists(pharmacists.filter(pharm => pharm.id !== id));
            }
        }
    };

    const stats = [
        { 
            label: 'Total Users', 
            value: '1,245', 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>, 
            color: 'from-slate-500 to-slate-600', 
            change: '+12%' 
        },
        { 
            label: 'Active Doctors', 
            value: '89', 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, 
            color: 'from-emerald-500 to-emerald-600', 
            change: '+5%' 
        },
        { 
            label: 'Patients', 
            value: '1,087', 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, 
            color: 'from-indigo-500 to-indigo-600', 
            change: '+18%' 
        },
        { 
            label: 'Pharmacists', 
            value: '69', 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>, 
            color: 'from-teal-500 to-teal-600', 
            change: '+3%' 
        }
    ];

    const recentActivities = [
        { id: 1, type: 'user_registration', user: 'Dr. Smith', action: 'New doctor registered', time: '2 hours ago', status: 'success' },
        { id: 2, type: 'system_update', user: 'System', action: 'Database backup completed', time: '4 hours ago', status: 'info' },
        { id: 3, type: 'user_login', user: 'John Doe', action: 'Patient logged in', time: '6 hours ago', status: 'success' },
        { id: 4, type: 'alert', user: 'System', action: 'High server load detected', time: '8 hours ago', status: 'warning' }
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
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-white font-bold text-sm">H</span>
                                </div>
                                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Admin Panel</h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user.fullName || user.email}</p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-1 sm:space-x-8 overflow-x-auto scrollbar-hide py-2"
                         style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                        {[
                            { 
                                id: 'overview', 
                                label: 'Overview', 
                                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> 
                            },
                            { 
                                id: 'users', 
                                label: 'User Management', 
                                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg> 
                            },
                            { 
                                id: 'system', 
                                label: 'System Settings', 
                                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> 
                            },
                            { 
                                id: 'analytics', 
                                label: 'Analytics', 
                                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> 
                            }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.icon}
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {activeTab === 'overview' && (
                    <div className="space-y-6 sm:space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                            <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                                        </div>
                                        <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activities */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    activity.status === 'success' ? 'bg-green-400' :
                                                    activity.status === 'warning' ? 'bg-yellow-400' :
                                                    'bg-blue-400'
                                                }`}></div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                                    <p className="text-sm text-gray-500">by {activity.user}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-400">{activity.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-4 sm:space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
                            <p className="text-gray-600 mb-6">Manage doctors, patients, and pharmacists in the system.</p>
                            
                            {/* Management Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                <div className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <svg className="w-8 h-8 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Doctors</h4>
                                                <p className="text-sm text-gray-600">{doctors.length} total</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => openModal('doctors', 'add')}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-sm"
                                        >
                                            Add New
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {doctors.slice(0, 3).map(doctor => (
                                            <div key={doctor.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <div>
                                                    <p className="text-sm font-medium">{doctor.fullName}</p>
                                                    <p className="text-xs text-gray-600">{doctor.specialization}</p>
                                                </div>
                                                <div className="flex space-x-1">
                                                    <button 
                                                        onClick={() => openModal('doctors', 'edit', doctor)}
                                                        className="text-blue-600 hover:text-blue-800 text-xs"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteUser('doctors', doctor.id)}
                                                        className="text-red-600 hover:text-red-800 text-xs"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => openModal('doctors', 'list')}
                                            className="w-full text-emerald-600 hover:text-emerald-800 text-sm font-medium mt-2"
                                        >
                                            View All Doctors →
                                        </button>
                                    </div>
                                </div>

                                <div className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <svg className="w-8 h-8 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Patients</h4>
                                                <p className="text-sm text-gray-600">{patients.length} total</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => openModal('patients', 'add')}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm"
                                        >
                                            Add New
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {patients.slice(0, 3).map(patient => (
                                            <div key={patient.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <div>
                                                    <p className="text-sm font-medium">{patient.fullName}</p>
                                                    <p className="text-xs text-gray-600">{patient.email}</p>
                                                </div>
                                                <div className="flex space-x-1">
                                                    <button 
                                                        onClick={() => openModal('patients', 'edit', patient)}
                                                        className="text-blue-600 hover:text-blue-800 text-xs"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteUser('patients', patient.id)}
                                                        className="text-red-600 hover:text-red-800 text-xs"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => openModal('patients', 'list')}
                                            className="w-full text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2"
                                        >
                                            View All Patients →
                                        </button>
                                    </div>
                                </div>

                                <div className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <svg className="w-8 h-8 text-teal-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                            </svg>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Pharmacists</h4>
                                                <p className="text-sm text-gray-600">{pharmacists.length} total</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => openModal('pharmacists', 'add')}
                                            className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-lg text-sm"
                                        >
                                            Add New
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {pharmacists.slice(0, 3).map(pharmacist => (
                                            <div key={pharmacist.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <div>
                                                    <p className="text-sm font-medium">{pharmacist.fullName}</p>
                                                    <p className="text-xs text-gray-600">{pharmacist.pharmacy}</p>
                                                </div>
                                                <div className="flex space-x-1">
                                                    <button 
                                                        onClick={() => openModal('pharmacists', 'edit', pharmacist)}
                                                        className="text-blue-600 hover:text-blue-800 text-xs"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteUser('pharmacists', pharmacist.id)}
                                                        className="text-red-600 hover:text-red-800 text-xs"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => openModal('pharmacists', 'list')}
                                            className="w-full text-teal-600 hover:text-teal-800 text-sm font-medium mt-2"
                                        >
                                            View All Pharmacists →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
                        <p className="text-gray-600">Configure system-wide settings and preferences.</p>
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                <div className="flex items-center space-x-4">
                                    <div className="hidden sm:flex w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-lg">Interoperability</h4>
                                        <p className="text-sm text-gray-600">Enable data exchange with external healthcare systems</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className={`hidden sm:block text-sm font-medium ${interoperabilityEnabled ? 'text-blue-600' : 'text-gray-500'}`}>
                                        {interoperabilityEnabled ? 'ON' : 'OFF'}
                                    </span>
                                    <button
                                        onClick={() => setInteroperabilityEnabled(!interoperabilityEnabled)}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md ${
                                            interoperabilityEnabled ? 'bg-blue-600 shadow-blue-200' : 'bg-gray-300 shadow-gray-200'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 shadow-lg ${
                                                interoperabilityEnabled ? 'translate-x-7' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                            <div className={`hidden sm:flex items-center justify-between p-4 rounded-lg border ${
                                interoperabilityEnabled 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-red-50 border-red-200'
                            }`}>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        interoperabilityEnabled 
                                            ? 'bg-green-100' 
                                            : 'bg-red-100'
                                    }`}>
                                        {interoperabilityEnabled ? (
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Interoperability Status</h4>
                                        <p className={`text-sm ${
                                            interoperabilityEnabled ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                            {interoperabilityEnabled 
                                                ? 'System is connected and ready for data exchange' 
                                                : 'Data exchange is currently disabled'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                    interoperabilityEnabled 
                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                        : 'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                    {interoperabilityEnabled ? 'CONNECTED' : 'DISCONNECTED'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Analytics</h3>
                        <p className="text-gray-600">View detailed analytics and reports.</p>
                        <div className="mt-6 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <div className="flex justify-center mb-2">
                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500">Analytics charts would be displayed here</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Simple Modal with Transparent Blur Background */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto transform transition-all duration-300 scale-100 max-h-[95vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    {modalType === 'doctors' && (
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                    {modalType === 'patients' && (
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    )}
                                    {modalType === 'pharmacists' && (
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {modalAction === 'add' ? 'Add New' : modalAction === 'edit' ? 'Edit' : 'Manage'} {' '}
                                    {modalType === 'doctors' ? 'Doctor' : 
                                     modalType === 'patients' ? 'Patient' : 
                                     modalType === 'pharmacists' ? 'Pharmacist' : ''}
                                </h3>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto">
                            {modalAction === 'list' ? (
                                /* List View */
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900">
                                            Current {modalType === 'doctors' ? 'Doctors' : modalType === 'patients' ? 'Patients' : 'Pharmacists'}
                                        </h4>
                                        <button
                                            onClick={() => setModalAction('add')}
                                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                                        >
                                            Add New
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                                        {/* List items will be rendered here */}
                                        <p className="col-span-full text-center text-gray-500 py-8">List content coming soon...</p>
                                    </div>
                                </div>
                            ) : (
                                /* Form View - Responsive Layout */
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Full Name *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="Enter full name"
                                        />
                                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="Enter email address"
                                        />
                                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="Enter phone number"
                                        />
                                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                </div>

                                {modalType === 'doctors' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Specialization *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="specialization"
                                                    value={formData.specialization}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    placeholder="Enter specialization"
                                                />
                                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                License Number *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="license"
                                                    value={formData.license}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    placeholder="Enter license number"
                                                />
                                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Department *
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="department"
                                                    value={formData.department}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                                                >
                                                    <option value="">Select Department</option>
                                                    <option value="Internal Medicine">Internal Medicine</option>
                                                    <option value="Pediatrics">Pediatrics</option>
                                                    <option value="Surgery">Surgery</option>
                                                    <option value="Emergency">Emergency</option>
                                                    <option value="Radiology">Radiology</option>
                                                </select>
                                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                <svg className="w-4 h-4 text-gray-400 absolute right-3 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {modalType === 'patients' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Date of Birth *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    name="dateOfBirth"
                                                    value={formData.dateOfBirth}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                />
                                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Address *
                                            </label>
                                            <div className="relative">
                                                <textarea
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                                    placeholder="Enter full address"
                                                />
                                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Emergency Contact *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    name="emergencyContact"
                                                    value={formData.emergencyContact}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    placeholder="Emergency contact number"
                                                />
                                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {modalType === 'pharmacists' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                License Number *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="license"
                                                    value={formData.license}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    placeholder="Enter license number"
                                                />
                                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Pharmacy *
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="pharmacy"
                                                    value={formData.pharmacy}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                                                >
                                                    <option value="">Select Pharmacy</option>
                                                    <option value="Central Pharmacy">Central Pharmacy</option>
                                                    <option value="North Branch Pharmacy">North Branch Pharmacy</option>
                                                    <option value="South Branch Pharmacy">South Branch Pharmacy</option>
                                                    <option value="East Branch Pharmacy">East Branch Pharmacy</option>
                                                </select>
                                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                <svg className="w-4 h-4 text-gray-400 absolute right-3 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Years of Experience *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="yearsExperience"
                                                    value={formData.yearsExperience}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    placeholder="Years of experience"
                                                />
                                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Form Buttons */}
                                <div className="flex space-x-3 pt-6 col-span-1 md:col-span-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        {modalAction === 'add' ? 'Add' : 'Update'} {modalType === 'doctors' ? 'Doctor' : modalType === 'patients' ? 'Patient' : 'Pharmacist'}
                                    </button>
                                </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;