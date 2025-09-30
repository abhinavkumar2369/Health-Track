import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('appointments');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/signin');
            return;
        }
        
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'doctor') {
            navigate('/signin');
            return;
        }
        
        setUser(parsedUser);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const todayStats = [
        { label: 'Today\'s Appointments', value: '8', icon: '📅', color: 'from-blue-500 to-blue-600' },
        { label: 'Patients Seen', value: '12', icon: '👥', color: 'from-green-500 to-green-600' },
        { label: 'Pending Reports', value: '5', icon: '📋', color: 'from-orange-500 to-orange-600' },
        { label: 'Emergency Calls', value: '2', icon: '🚨', color: 'from-red-500 to-red-600' }
    ];

    const upcomingAppointments = [
        { id: 1, patient: 'Sarah Johnson', time: '10:00 AM', type: 'Check-up', status: 'confirmed' },
        { id: 2, patient: 'Mike Davis', time: '11:30 AM', type: 'Follow-up', status: 'confirmed' },
        { id: 3, patient: 'Emily Chen', time: '2:00 PM', type: 'Consultation', status: 'pending' },
        { id: 4, patient: 'Robert Wilson', time: '3:30 PM', type: 'Emergency', status: 'urgent' }
    ];

    const recentPatients = [
        { id: 1, name: 'Alice Brown', lastVisit: '2024-01-15', condition: 'Hypertension', status: 'stable' },
        { id: 2, name: 'David Lee', lastVisit: '2024-01-14', condition: 'Diabetes', status: 'monitoring' },
        { id: 3, name: 'Maria Garcia', lastVisit: '2024-01-13', condition: 'Asthma', status: 'improved' },
        { id: 4, name: 'James Taylor', lastVisit: '2024-01-12', condition: 'Heart Disease', status: 'critical' }
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
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-white font-bold text-sm">👨‍⚕️</span>
                                </div>
                                <h1 className="text-xl font-bold text-gray-900">Doctor Portal</h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">Dr. {user.fullName || user.email}</p>
                                <p className="text-xs text-gray-500">Medical Doctor</p>
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
                            { id: 'appointments', label: 'Appointments', icon: '📅' },
                            { id: 'patients', label: 'Patient Records', icon: '📋' },
                            { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
                            { id: 'reports', label: 'Medical Reports', icon: '📊' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === tab.id
                                        ? 'border-green-500 text-green-600'
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
                {activeTab === 'appointments' && (
                    <div className="space-y-8">
                        {/* Welcome Banner */}
                        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
                            <h2 className="text-2xl font-bold mb-2">Good morning, Doctor!</h2>
                            <p className="text-green-100">You have 8 appointments scheduled for today.</p>
                        </div>

                        {/* Today's Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {todayStats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                        </div>
                                        <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Upcoming Appointments */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Today's Appointments</h3>
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                                    Add Appointment
                                </button>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {upcomingAppointments.map((appointment) => (
                                    <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {appointment.patient.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{appointment.patient}</p>
                                                    <p className="text-sm text-gray-500">{appointment.type} • {appointment.time}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {appointment.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'patients' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Patient Records</h3>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Search patients..."
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                                        Add Patient
                                    </button>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {recentPatients.map((patient) => (
                                    <div key={patient.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {patient.name.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                                                    <p className="text-sm text-gray-500">{patient.condition} • Last visit: {patient.lastVisit}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    patient.status === 'stable' ? 'bg-green-100 text-green-800' :
                                                    patient.status === 'monitoring' ? 'bg-yellow-100 text-yellow-800' :
                                                    patient.status === 'improved' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {patient.status}
                                                </span>
                                                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                                    View Record
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
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prescription Management</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                                <div className="text-4xl mb-4">💊</div>
                                <h4 className="font-medium text-gray-900 mb-2">Create New Prescription</h4>
                                <p className="text-sm text-gray-600 mb-4">Generate digital prescriptions for your patients</p>
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                                    Create Prescription
                                </button>
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                                <div className="text-4xl mb-4">📋</div>
                                <h4 className="font-medium text-gray-900 mb-2">Prescription History</h4>
                                <p className="text-sm text-gray-600 mb-4">View and manage past prescriptions</p>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                                    View History
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Reports</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Lab Results</h4>
                                <p className="text-sm text-blue-700">3 pending reviews</p>
                                <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Review Now
                                </button>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-2">Imaging Reports</h4>
                                <p className="text-sm text-green-700">2 new reports</p>
                                <button className="mt-2 text-green-600 hover:text-green-800 text-sm font-medium">
                                    View Reports
                                </button>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <h4 className="font-medium text-purple-900 mb-2">Consultation Notes</h4>
                                <p className="text-sm text-purple-700">12 notes today</p>
                                <button className="mt-2 text-purple-600 hover:text-purple-800 text-sm font-medium">
                                    Manage Notes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DoctorDashboard;