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
        { label: 'Blood Pressure', value: '120/80', status: 'normal', icon: '💓', color: 'from-green-500 to-green-600' },
        { label: 'Heart Rate', value: '72 bpm', status: 'normal', icon: '❤️', color: 'from-red-500 to-red-600' },
        { label: 'Blood Sugar', value: '95 mg/dL', status: 'normal', icon: '🩸', color: 'from-blue-500 to-blue-600' },
        { label: 'BMI', value: '23.4', status: 'normal', icon: '⚖️', color: 'from-purple-500 to-purple-600' }
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
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-white font-bold text-sm">👤</span>
                                </div>
                                <h1 className="text-xl font-bold text-gray-900">Patient Portal</h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user.fullName || user.email}</p>
                                <p className="text-xs text-gray-500">Patient</p>
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

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'overview', label: 'Health Overview', icon: '📊' },
                            { id: 'appointments', label: 'Appointments', icon: '📅' },
                            { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
                            { id: 'records', label: 'Medical Records', icon: '📋' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === tab.id
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Welcome Banner */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
                            <h2 className="text-2xl font-bold mb-2">Welcome to your Health Portal!</h2>
                            <p className="text-purple-100">Stay on top of your health with our comprehensive tracking tools.</p>
                        </div>

                        {/* Health Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {healthMetrics.map((metric, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                                            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                            <p className={`text-sm font-medium ${
                                                metric.status === 'normal' ? 'text-green-600' : 
                                                metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                                {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                                            </p>
                                        </div>
                                        <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                                            {metric.icon}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">📅</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Book Appointment</h3>
                                    <p className="text-sm text-gray-600 mb-4">Schedule your next visit with a healthcare provider</p>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 w-full">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">💊</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Refill Prescription</h3>
                                    <p className="text-sm text-gray-600 mb-4">Request refills for your current medications</p>
                                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 w-full">
                                        Refill Now
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">📋</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">View Lab Results</h3>
                                    <p className="text-sm text-gray-600 mb-4">Check your latest test results and reports</p>
                                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 w-full">
                                        View Results
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'appointments' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
                                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">
                                    Book New Appointment
                                </button>
                            </div>
                            <div className="divide-y divide-gray-200">
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
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Current Prescriptions</h3>
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                                    Request Refill
                                </button>
                            </div>
                            <div className="divide-y divide-gray-200">
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
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Lab Results</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {labResults.map((result) => (
                                    <div key={result.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{result.test}</p>
                                                <p className="text-sm text-gray-500">Ordered by {result.doctor} • {result.date}</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    result.status === 'normal' ? 'bg-green-100 text-green-800' :
                                                    result.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {result.status}
                                                </span>
                                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PatientDashboard;