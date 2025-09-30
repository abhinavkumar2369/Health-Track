import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PharmacistDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('prescriptions');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/signin');
            return;
        }
        
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'pharmacist') {
            navigate('/signin');
            return;
        }
        
        setUser(parsedUser);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const dailyStats = [
        { label: 'Prescriptions Filled', value: '24', icon: '💊', color: 'from-blue-500 to-blue-600', change: '+8' },
        { label: 'Pending Orders', value: '12', icon: '⏳', color: 'from-yellow-500 to-yellow-600', change: '+3' },
        { label: 'Inventory Alerts', value: '5', icon: '⚠️', color: 'from-red-500 to-red-600', change: '+2' },
        { label: 'Revenue Today', value: '$2,450', icon: '💰', color: 'from-green-500 to-green-600', change: '+15%' }
    ];

    const pendingPrescriptions = [
        { 
            id: 1, 
            patient: 'Sarah Johnson', 
            medication: 'Lisinopril 10mg', 
            quantity: '30 tablets',
            doctor: 'Dr. Smith',
            priority: 'normal',
            time: '2 hours ago'
        },
        { 
            id: 2, 
            patient: 'Mike Davis', 
            medication: 'Insulin', 
            quantity: '1 vial',
            doctor: 'Dr. Brown',
            priority: 'urgent',
            time: '30 minutes ago'
        },
        { 
            id: 3, 
            patient: 'Emily Chen', 
            medication: 'Amoxicillin 500mg', 
            quantity: '20 capsules',
            doctor: 'Dr. Wilson',
            priority: 'normal',
            time: '1 hour ago'
        }
    ];

    const inventoryAlerts = [
        { id: 1, medication: 'Metformin 500mg', current: 15, minimum: 50, status: 'low' },
        { id: 2, medication: 'Ibuprofen 200mg', current: 8, minimum: 100, status: 'critical' },
        { id: 3, medication: 'Blood Pressure Monitor', current: 2, minimum: 10, status: 'low' },
        { id: 4, medication: 'Vitamin D3', current: 25, minimum: 75, status: 'low' }
    ];

    const recentTransactions = [
        { id: 1, patient: 'Alice Brown', medication: 'Lipitor 20mg', amount: '$45.99', time: '10:30 AM', status: 'completed' },
        { id: 2, patient: 'David Lee', medication: 'Nexium 40mg', amount: '$89.50', time: '11:15 AM', status: 'completed' },
        { id: 3, patient: 'Maria Garcia', medication: 'Synthroid 50mcg', amount: '$32.25', time: '12:00 PM', status: 'pending' },
        { id: 4, patient: 'James Taylor', medication: 'Metformin 1000mg', amount: '$28.75', time: '12:45 PM', status: 'completed' }
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
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-white font-bold text-sm">💊</span>
                                </div>
                                <h1 className="text-xl font-bold text-gray-900">Pharmacy Portal</h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user.fullName || user.email}</p>
                                <p className="text-xs text-gray-500">Pharmacist</p>
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
                            { id: 'prescriptions', label: 'Prescriptions', icon: '📋' },
                            { id: 'inventory', label: 'Inventory', icon: '📦' },
                            { id: 'transactions', label: 'Transactions', icon: '💰' },
                            { id: 'reports', label: 'Reports', icon: '📊' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === tab.id
                                        ? 'border-orange-500 text-orange-600'
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
                {activeTab === 'prescriptions' && (
                    <div className="space-y-8">
                        {/* Welcome Banner */}
                        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-6 text-white">
                            <h2 className="text-2xl font-bold mb-2">Good day, Pharmacist!</h2>
                            <p className="text-orange-100">You have 12 pending prescriptions to process today.</p>
                        </div>

                        {/* Daily Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {dailyStats.map((stat, index) => (
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

                        {/* Pending Prescriptions */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Pending Prescriptions</h3>
                                <div className="flex space-x-2">
                                    <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700">
                                        Scan Prescription
                                    </button>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                                        Manual Entry
                                    </button>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {pendingPrescriptions.map((prescription) => (
                                    <div key={prescription.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {prescription.patient.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{prescription.patient}</p>
                                                    <p className="text-sm text-gray-600">{prescription.medication} • {prescription.quantity}</p>
                                                    <p className="text-sm text-gray-500">Prescribed by {prescription.doctor} • {prescription.time}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    prescription.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {prescription.priority}
                                                </span>
                                                <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">
                                                    Fill
                                                </button>
                                                <button className="bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700">
                                                    Hold
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="space-y-6">
                        {/* Low Stock Alerts */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                                    Add Stock
                                </button>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {inventoryAlerts.map((item) => (
                                    <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{item.medication}</p>
                                                <p className="text-sm text-gray-500">Current: {item.current} units • Minimum: {item.minimum} units</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    item.status === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {item.status}
                                                </span>
                                                <button className="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700">
                                                    Reorder
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">📦</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Inventory</h3>
                                    <p className="text-sm text-gray-600 mb-4">Add, update, or remove items from inventory</p>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 w-full">
                                        Manage Stock
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">📋</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Stock Report</h3>
                                    <p className="text-sm text-gray-600 mb-4">Generate detailed inventory reports</p>
                                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 w-full">
                                        Generate Report
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">🔍</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Medication</h3>
                                    <p className="text-sm text-gray-600 mb-4">Look up medication details and availability</p>
                                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 w-full">
                                        Search Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Search transactions..."
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700">
                                        New Sale
                                    </button>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {recentTransactions.map((transaction) => (
                                    <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{transaction.patient}</p>
                                                <p className="text-sm text-gray-500">{transaction.medication} • {transaction.time}</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm font-medium text-gray-900">{transaction.amount}</span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {transaction.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pharmacy Reports</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Sales Report</h4>
                                <p className="text-sm text-blue-700">Daily sales: $2,450</p>
                                <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    View Details
                                </button>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-2">Inventory Report</h4>
                                <p className="text-sm text-green-700">5 items need reorder</p>
                                <button className="mt-2 text-green-600 hover:text-green-800 text-sm font-medium">
                                    View Report
                                </button>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <h4 className="font-medium text-purple-900 mb-2">Prescription Analysis</h4>
                                <p className="text-sm text-purple-700">24 prescriptions filled</p>
                                <button className="mt-2 text-purple-600 hover:text-purple-800 text-sm font-medium">
                                    Analyze Trends
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PharmacistDashboard;