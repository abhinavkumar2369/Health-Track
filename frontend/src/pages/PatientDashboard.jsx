import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/signin');
            return;
        }
        
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'patient') {
            navigate('/signin');
            return;
        }
        
        setUser(parsedUser);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const healthMetrics = [
        { 
            label: 'Blood Pressure', 
            value: '120/80', 
            status: 'normal', 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>, 
            color: 'from-emerald-500 to-emerald-600' 
        },
        { 
            label: 'Heart Rate', 
            value: '72 bpm', 
            status: 'normal', 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19c-4.418 0-8-3.582-8-8 0-1.657.507-3.19 1.374-4.462" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19c4.418 0 8-3.582 8-8 0-1.657-.507-3.19-1.374-4.462" /></svg>, 
            color: 'from-rose-500 to-rose-600' 
        },
        { 
            label: 'Blood Sugar', 
            value: '95 mg/dL', 
            status: 'normal', 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>, 
            color: 'from-sky-500 to-sky-600' 
        },
        { 
            label: 'BMI', 
            value: '23.4', 
            status: 'normal', 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>, 
            color: 'from-violet-500 to-violet-600' 
        }
    ];

    const upcomingAppointments = [
        { id: 1, doctor: 'Dr. Sarah Johnson', specialty: 'Cardiology', date: '2024-01-20', time: '10:00 AM', type: 'Follow-up' },
        { id: 2, doctor: 'Dr. Mike Davis', specialty: 'General Practice', date: '2024-01-25', time: '2:30 PM', type: 'Check-up' },
        { id: 3, doctor: 'Dr. Emily Chen', specialty: 'Dermatology', date: '2024-02-01', time: '11:00 AM', type: 'Consultation' }
    ];

    const recentPrescriptions = [
        { id: 1, medication: 'Lisinopril 10mg', prescriber: 'Dr. Johnson', date: '2024-01-15', frequency: 'Once daily', status: 'active' },
        { id: 2, medication: 'Metformin 500mg', prescriber: 'Dr. Davis', date: '2024-01-10', frequency: 'Twice daily', status: 'active' },
        { id: 3, medication: 'Vitamin D3', prescriber: 'Dr. Chen', date: '2024-01-05', frequency: 'Once daily', status: 'completed' }
    ];

    const labResults = [
        { id: 1, test: 'Complete Blood Count', date: '2024-01-14', status: 'normal', doctor: 'Dr. Johnson' },
        { id: 2, test: 'Lipid Panel', date: '2024-01-12', status: 'normal', doctor: 'Dr. Davis' },
        { id: 3, test: 'Thyroid Function', date: '2024-01-08', status: 'pending', doctor: 'Dr. Chen' }
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
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Patient Panel</h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user.fullName || user.email}</p>
                                <p className="text-xs text-gray-500">Patient</p>
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
                                label: 'Health Overview', 
                                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> 
                            },
                            { 
                                id: 'appointments', 
                                label: 'Appointments', 
                                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> 
                            },
                            { 
                                id: 'prescriptions', 
                                label: 'Prescriptions', 
                                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg> 
                            },
                            { 
                                id: 'records', 
                                label: 'Medical Records', 
                                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> 
                            },
                            { 
                                id: 'reports', 
                                label: 'Reports', 
                                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> 
                            }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'border-purple-500 text-purple-600'
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
                        {/* Health Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                            {healthMetrics.map((metric, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center justify-between">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{metric.label}</p>
                                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{metric.value}</p>
                                            <p className={`text-xs sm:text-sm font-medium ${
                                                metric.status === 'normal' ? 'text-green-600' : 
                                                metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                                {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                                            </p>
                                        </div>
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center text-white text-lg sm:text-2xl flex-shrink-0 ml-2`}>
                                            {metric.icon}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                                <div className="text-center">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Book Appointment</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Schedule your next visit with a healthcare provider</p>
                                    <button className="bg-slate-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-slate-700 w-full">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                                <div className="text-center">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Refill Prescription</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Request refills for your current medications</p>
                                    <button className="bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-emerald-700 w-full">
                                        Refill Now
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                                <div className="text-center">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">View Lab Results</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Check your latest test results and reports</p>
                                    <button className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-indigo-700 w-full">
                                        View Results
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'appointments' && (
                    <div className="space-y-4 sm:space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
                                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">
                                    Book New Appointment
                                </button>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {upcomingAppointments.map((appointment) => (
                                    <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-purple-600">
                                                            {appointment.doctor.split(' ')[1][0]}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{appointment.doctor}</p>
                                                    <p className="text-sm text-gray-500">{appointment.specialty} • {appointment.type}</p>
                                                    <p className="text-sm text-gray-500">{appointment.date} at {appointment.time}</p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                    Reschedule
                                                </button>
                                                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'prescriptions' && (
                    <div className="space-y-4 sm:space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Current Prescriptions</h3>
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                                    Request Refill
                                </button>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {recentPrescriptions.map((prescription) => (
                                    <div key={prescription.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{prescription.medication}</p>
                                                <p className="text-sm text-gray-500">Prescribed by {prescription.prescriber} • {prescription.date}</p>
                                                <p className="text-sm text-gray-500">Take {prescription.frequency}</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    prescription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {prescription.status}
                                                </span>
                                                {prescription.status === 'active' && (
                                                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                                        Refill
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'records' && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Upload New Record Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Upload New Record</h3>
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span>Upload Record</span>
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Your Medical Record</h4>
                                    <p className="text-sm text-gray-600 mb-4">Drag and drop your medical record here, or click to browse</p>
                                    <p className="text-xs text-gray-500">Supports: PDF, JPG, PNG, DOC (Max: 25MB)</p>
                                </div>
                            </div>
                        </div>

                        {/* Uploaded Records Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900">My Medical Records</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {/* Sample uploaded records */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Annual Health Checkup Report</h4>
                                                <p className="text-sm text-gray-500">Uploaded on January 15, 2025 • 2.4 MB</p>
                                                <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Verified</span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                                                View
                                            </button>
                                            <button className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                                                Download
                                            </button>
                                            <button className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Cardiology Consultation Report</h4>
                                                <p className="text-sm text-gray-500">Uploaded on January 10, 2025 • 1.8 MB</p>
                                                <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Under Review</span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                                                View
                                            </button>
                                            <button className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                                                Download
                                            </button>
                                            <button className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Blood Work Results</h4>
                                                <p className="text-sm text-gray-500">Uploaded on January 5, 2025 • 985 KB</p>
                                                <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Verified</span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                                                View
                                            </button>
                                            <button className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                                                Download
                                            </button>
                                            <button className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Simple Report Generation - Top Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Health Summary Report</h3>
                                <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                                    Create a comprehensive summary of your health data including medical records, appointments, and health metrics.
                                </p>
                                <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 flex items-center space-x-2 mx-auto">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Generate Report</span>
                                </button>
                            </div>
                        </div>

                        {/* My Health Reports Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900">My Generated Reports</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    {/* Sample Old Reports */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">December 2024 Health Summary</h4>
                                                <p className="text-sm text-gray-500">Monthly Report • Generated on Jan 1, 2025 • 12 pages</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Monthly</span>
                                                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Complete</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                                                View
                                            </button>
                                            <button className="px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                                                Download
                                            </button>
                                            <button className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                                                Share
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">2024 Annual Health Report</h4>
                                                <p className="text-sm text-gray-500">Annual Report • Generated on Dec 31, 2024 • 45 pages</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Annual</span>
                                                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Complete</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                                                View
                                            </button>
                                            <button className="px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                                                Download
                                            </button>
                                            <button className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                                                Share
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Cardiology Focus Report (Oct-Dec 2024)</h4>
                                                <p className="text-sm text-gray-500">Custom Report • Generated on Dec 28, 2024 • 8 pages</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Custom</span>
                                                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Complete</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                                                View
                                            </button>
                                            <button className="px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                                                Download
                                            </button>
                                            <button className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                                                Share
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">November 2024 Health Summary</h4>
                                                <p className="text-sm text-gray-500">Monthly Report • Generated on Dec 1, 2024 • 10 pages</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Monthly</span>
                                                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Complete</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                                                View
                                            </button>
                                            <button className="px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                                                Download
                                            </button>
                                            <button className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                                                Share
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Simple Report Generation */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200 text-center">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Health Summary Report</h3>
                                <p className="text-sm text-gray-600">Create a comprehensive summary of your health data</p>
                            </div>
                            <div className="p-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-semibold text-gray-900 mb-3">Create Your Health Report</h4>
                                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                        Generate a detailed summary including your medical records, test results, appointments, and health metrics.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                                        <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 flex items-center justify-center space-x-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>Generate Report</span>
                                        </button>
                                        <button className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all duration-200 flex items-center justify-center space-x-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                            </svg>
                                            <span>Customize</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PatientDashboard;