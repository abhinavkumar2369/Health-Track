import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
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

    const stats = [
        { label: 'Total Users', value: '1,245', icon: '👥', color: 'from-blue-500 to-blue-600', change: '+12%' },
        { label: 'Active Doctors', value: '89', icon: '👨‍⚕️', color: 'from-green-500 to-green-600', change: '+5%' },
        { label: 'Patients', value: '1,087', icon: '👤', color: 'from-purple-500 to-purple-600', change: '+18%' },
        { label: 'Pharmacists', value: '69', icon: '💊', color: 'from-orange-500 to-orange-600', change: '+3%' }
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
                                <h1 className="text-xl font-bold text-gray-900">Health Track Admin</h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user.fullName || user.email}</p>
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

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'overview', label: 'Overview', icon: '📊' },
                            { id: 'users', label: 'User Management', icon: '👥' },
                            { id: 'system', label: 'System Settings', icon: '⚙️' },
                            { id: 'analytics', label: 'Analytics', icon: '📈' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
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
                        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-6 text-white">
                            <h2 className="text-2xl font-bold mb-2">Welcome back, Administrator!</h2>
                            <p className="text-blue-100">Here's an overview of your Health Track system performance.</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
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
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
                        <p className="text-gray-600">Manage doctors, patients, and pharmacists in the system.</p>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                                <span className="block text-2xl mb-2">👨‍⚕️</span>
                                <span className="text-sm font-medium">Manage Doctors</span>
                            </button>
                            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                                <span className="block text-2xl mb-2">👤</span>
                                <span className="text-sm font-medium">Manage Patients</span>
                            </button>
                            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                                <span className="block text-2xl mb-2">💊</span>
                                <span className="text-sm font-medium">Manage Pharmacists</span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
                        <p className="text-gray-600">Configure system-wide settings and preferences.</p>
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">Database Backup</h4>
                                    <p className="text-sm text-gray-600">Last backup: 2 hours ago</p>
                                </div>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                                    Backup Now
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">System Maintenance</h4>
                                    <p className="text-sm text-gray-600">Schedule maintenance windows</p>
                                </div>
                                <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700">
                                    Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Analytics</h3>
                        <p className="text-gray-600">View detailed analytics and reports.</p>
                        <div className="mt-6 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-4xl mb-2">📊</div>
                                <p className="text-gray-500">Analytics charts would be displayed here</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;