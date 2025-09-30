import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PharmacistDashboard = () => {
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

    const overviewStats = [
        { 
            label: 'Total Medicines', 
            value: '1,247', 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>, 
            color: 'from-blue-100 to-blue-200', 
            textColor: 'text-blue-700',
            change: '+12 this month', 
            trend: 'up' 
        },
        { 
            label: 'Orders Fulfilled', 
            value: '89', 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, 
            color: 'from-green-100 to-green-200', 
            textColor: 'text-green-700',
            change: '+15 today', 
            trend: 'up' 
        },
        { 
            label: 'Inventory Alerts', 
            value: '5', 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>, 
            color: 'from-orange-100 to-orange-200', 
            textColor: 'text-orange-700',
            change: '2 critical', 
            trend: 'warning' 
        },
        { 
            label: "Today's Revenue", 
            value: '$2,450', 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>, 
            color: 'from-emerald-100 to-emerald-200', 
            textColor: 'text-emerald-700',
            change: '+15% from yesterday', 
            trend: 'up' 
        }
    ];

    const dailyStats = [
        { 
            label: 'Prescriptions Filled', 
            value: '24', 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, 
            color: 'from-blue-100 to-blue-200', 
            textColor: 'text-blue-700',
            change: '+8' 
        },
        { 
            label: 'Pending Orders', 
            value: '12', 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, 
            color: 'from-yellow-100 to-yellow-200', 
            textColor: 'text-yellow-700',
            change: '+3' 
        },
        { 
            label: 'Inventory Alerts', 
            value: '5', 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>, 
            color: 'from-orange-100 to-orange-200', 
            textColor: 'text-orange-700',
            change: '+2' 
        },
        { 
            label: 'Revenue Today', 
            value: '$2,450', 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>, 
            color: 'from-green-100 to-green-200', 
            textColor: 'text-green-700',
            change: '+15%' 
        }
    ];

    const aiInventoryAdvice = [
        {
            type: 'restock',
            priority: 'high',
            message: 'Consider restocking Metformin 500mg - only 15 units left. Based on usage patterns, you\'ll run out in 3 days.',
            action: 'Order 200 units',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        },
        {
            type: 'demand',
            priority: 'medium',
            message: 'Vitamin D3 demand increased by 30% this month. Consider increasing minimum stock level.',
            action: 'Adjust min stock to 100',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        },
        {
            type: 'expiry',
            priority: 'medium',
            message: '8 medications expiring within 30 days. Total value: $340. Consider promotional pricing.',
            action: 'View expiring items',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11m-6 0h6" /></svg>
        }
    ];

    const inventoryItems = [
        { id: 1, name: 'Metformin 500mg', category: 'Diabetes', stock: 15, minStock: 50, price: 12.99, status: 'critical', lastUpdated: '2 hours ago' },
        { id: 2, name: 'Ibuprofen 200mg', category: 'Pain Relief', stock: 8, minStock: 100, price: 8.49, status: 'critical', lastUpdated: '1 hour ago' },
        { id: 3, name: 'Vitamin D3', category: 'Supplements', stock: 25, minStock: 75, price: 15.99, status: 'low', lastUpdated: '3 hours ago' },
        { id: 4, name: 'Amoxicillin 500mg', category: 'Antibiotics', stock: 150, minStock: 100, price: 18.99, status: 'good', lastUpdated: '1 day ago' },
        { id: 5, name: 'Lisinopril 10mg', category: 'Heart', stock: 200, minStock: 80, price: 22.49, status: 'good', lastUpdated: '2 days ago' }
    ];

    const allTransactions = [
        { id: 1, patient: 'Alice Brown', medication: 'Lipitor 20mg', quantity: 1, amount: 45.99, time: '10:30 AM', date: '2024-01-20', status: 'completed', paymentMethod: 'Insurance' },
        { id: 2, patient: 'David Lee', medication: 'Nexium 40mg', quantity: 1, amount: 89.50, time: '11:15 AM', date: '2024-01-20', status: 'completed', paymentMethod: 'Cash' },
        { id: 3, patient: 'Maria Garcia', medication: 'Synthroid 50mcg', quantity: 1, amount: 32.25, time: '12:00 PM', date: '2024-01-20', status: 'pending', paymentMethod: 'Card' },
        { id: 4, patient: 'James Taylor', medication: 'Metformin 1000mg', quantity: 2, amount: 28.75, time: '12:45 PM', date: '2024-01-20', status: 'completed', paymentMethod: 'Insurance' },
        { id: 5, patient: 'Sarah Johnson', medication: 'Vitamin D3', quantity: 1, amount: 15.99, time: '01:20 PM', date: '2024-01-20', status: 'completed', paymentMethod: 'Cash' },
        { id: 6, patient: 'Mike Wilson', medication: 'Ibuprofen 200mg', quantity: 3, amount: 25.47, time: '02:15 PM', date: '2024-01-20', status: 'refunded', paymentMethod: 'Card' }
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
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Pharmacy Panel</h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-800">{user.fullName || user.email}</p>
                                <p className="text-xs text-slate-500">Pharmacist</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-rose-400 hover:bg-rose-500 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-1 sm:space-x-8 overflow-x-auto scrollbar-hide py-2"
                         style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                        {[
                            { 
                                id: 'overview', 
                                label: 'Overview', 
                                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v14l-5-3-5 3V5z" /></svg>
                            },
                            { 
                                id: 'inventory', 
                                label: 'Inventory', 
                                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            },
                            { 
                                id: 'transactions', 
                                label: 'Transactions', 
                                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            },
                            { 
                                id: 'reports', 
                                label: 'Reports', 
                                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'border-blue-300 text-blue-500'
                                        : 'border-transparent text-slate-500 hover:text-slate-600 hover:border-slate-200'
                                }`}
                            >
                                <span>{tab.icon}</span>
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
                            {/* Welcome Banner removed */}

                        {/* Overview Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {overviewStats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                                            <p className={`text-sm font-medium ${
                                                stat.trend === 'up' ? 'text-emerald-500' : 
                                                stat.trend === 'warning' ? 'text-amber-500' : 'text-rose-500'
                                            }`}>
                                                {stat.change}
                                            </p>
                                        </div>
                                        <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center ${stat.textColor}`}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* AI Inventory Insights */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                            <div className="px-6 py-4 border-b border-slate-200">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800">AI Inventory Advisor</h3>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                {aiInventoryAdvice.map((advice, index) => (
                                    <div key={index} className={`border rounded-lg p-4 ${
                                        advice.priority === 'high' ? 'border-rose-200 bg-rose-50' :
                                        advice.priority === 'medium' ? 'border-amber-200 bg-amber-50' :
                                        'border-emerald-200 bg-emerald-50'
                                    }`}>
                                        <div className="flex items-start space-x-3">
                                            <div className={`p-2 rounded-lg ${
                                                advice.priority === 'high' ? 'bg-rose-100 text-rose-500' :
                                                advice.priority === 'medium' ? 'bg-amber-100 text-amber-500' :
                                                'bg-emerald-100 text-emerald-500'
                                            }`}>
                                                {advice.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-800 mb-1">{advice.message}</p>
                                                <button className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                                                    advice.priority === 'high' ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' :
                                                    advice.priority === 'medium' ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' :
                                                    'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                                }`}>
                                                    {advice.action}
                                                </button>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                advice.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                                                advice.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {advice.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="space-y-6">
                        {/* Inventory Header */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">Inventory Management</h3>
                                <div className="flex space-x-2">
                                    <button className="bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-500 transition-colors">
                                        Add Medicine
                                    </button>
                                    <button className="bg-sky-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-500 transition-colors">
                                        Bulk Import
                                    </button>
                                    <button className="bg-amber-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-500 transition-colors">
                                        Issue Medicine
                                    </button>
                                </div>
                            </div>
                            
                            {/* Search and Filter */}
                            <div className="flex space-x-4">
                                <input
                                    type="text"
                                    placeholder="Search medicines..."
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                                />
                                <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300">
                                    <option>All Categories</option>
                                    <option>Antibiotics</option>
                                    <option>Pain Relief</option>
                                    <option>Diabetes</option>
                                    <option>Heart</option>
                                    <option>Supplements</option>
                                </select>
                                <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300">
                                    <option>All Status</option>
                                    <option>Critical</option>
                                    <option>Low</option>
                                    <option>Good</option>
                                </select>
                            </div>
                        </div>

                        {/* Inventory Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h4 className="text-md font-semibold text-slate-800">Medicine Stock</h4>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Medicine</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {inventoryItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                        <div className="text-sm text-gray-500">Updated {item.lastUpdated}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{item.stock} units</div>
                                                    <div className="text-sm text-gray-500">Min: {item.minStock}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">${item.price}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        item.status === 'critical' ? 'bg-rose-100 text-rose-700' :
                                                        item.status === 'low' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button className="text-sky-500 hover:text-sky-600 transition-colors">View</button>
                                                    <button className="text-emerald-500 hover:text-emerald-600 transition-colors">Edit</button>
                                                    <button className="text-amber-500 hover:text-amber-600 transition-colors">Restock</button>
                                                    <button className="text-rose-500 hover:text-rose-600 transition-colors">Remove</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="space-y-6">
                        {/* Transaction Header */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">All Transactions</h3>
                                <div className="flex space-x-2">
                                    <button className="bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-500 transition-colors">
                                        New Sale
                                    </button>
                                    <button className="bg-sky-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-500 transition-colors">
                                        Export
                                    </button>
                                </div>
                            </div>
                            
                            {/* Filters */}
                            <div className="flex space-x-4">
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <input
                                    type="date"
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                                    <option>All Status</option>
                                    <option>Completed</option>
                                    <option>Pending</option>
                                    <option>Refunded</option>
                                </select>
                                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                                    <option>All Payments</option>
                                    <option>Cash</option>
                                    <option>Card</option>
                                    <option>Insurance</option>
                                </select>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {allTransactions.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    #TXN{transaction.id.toString().padStart(4, '0')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                                            <span className="text-xs font-medium text-gray-600">
                                                                {transaction.patient.split(' ').map(n => n[0]).join('')}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900">{transaction.patient}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.medication}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${transaction.amount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.paymentMethod}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {transaction.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div>{transaction.date}</div>
                                                    <div>{transaction.time}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="space-y-6">
                        {/* AI Report Generation */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800">AI-Powered Report Generation</h3>
                                    <p className="text-sm text-slate-600">Generate intelligent insights and comprehensive reports</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="border-2 border-dashed border-indigo-200 rounded-lg p-6 text-center hover:border-indigo-300 transition-colors">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-slate-800 mb-2">AI Sales Analysis</h4>
                                    <p className="text-sm text-slate-600 mb-4">Comprehensive sales trends and predictions</p>
                                    <button className="bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-500 w-full transition-colors">
                                        Generate & Download
                                    </button>
                                </div>

                                <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-slate-800 mb-2">AI Inventory Report</h4>
                                    <p className="text-sm text-slate-600 mb-4">Smart inventory optimization insights</p>
                                    <button className="bg-blue-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-500 w-full transition-colors">
                                        Generate & Download
                                    </button>
                                </div>

                                <div className="border-2 border-dashed border-emerald-200 rounded-lg p-6 text-center hover:border-emerald-300 transition-colors">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-slate-800 mb-2">AI Business Insights</h4>
                                    <p className="text-sm text-slate-600 mb-4">Strategic recommendations and forecasts</p>
                                    <button className="bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-500 w-full transition-colors">
                                        Generate & Download
                                    </button>
                                </div>

                                <div className="border-2 border-dashed border-amber-200 rounded-lg p-6 text-center hover:border-amber-300 transition-colors">
                                    <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-slate-800 mb-2">AI Financial Report</h4>
                                    <p className="text-sm text-slate-600 mb-4">Revenue analysis and profit optimization</p>
                                    <button className="bg-amber-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-500 w-full transition-colors">
                                        Generate & Download
                                    </button>
                                </div>

                                <div className="border-2 border-dashed border-amber-200 rounded-lg p-6 text-center hover:border-amber-300 transition-colors">
                                    <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-slate-800 mb-2">AI Financial Report</h4>
                                    <p className="text-sm text-slate-600 mb-4">Revenue analysis and profit optimization</p>
                                    <button className="bg-amber-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-500 w-full transition-colors">
                                        Generate & Download
                                    </button>
                                </div>

                                <div className="border-2 border-dashed border-rose-200 rounded-lg p-6 text-center hover:border-rose-300 transition-colors">
                                    <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-slate-800 mb-2">AI Risk Assessment</h4>
                                    <p className="text-sm text-slate-600 mb-4">Identify potential business risks and solutions</p>
                                    <button className="bg-rose-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-rose-500 w-full transition-colors">
                                        Generate & Download
                                    </button>
                                </div>

                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-slate-300 transition-colors">
                                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-slate-800 mb-2">Custom AI Report</h4>
                                    <p className="text-sm text-slate-600 mb-4">Create custom report with AI assistance</p>
                                    <button className="bg-slate-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-500 w-full transition-colors">
                                        Customize & Generate
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Reports */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Standard Reports</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Daily Sales Summary</h4>
                                    <p className="text-sm text-blue-700">Today's sales: $2,450 (6 transactions)</p>
                                    <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        Download PDF
                                    </button>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <h4 className="font-medium text-green-900 mb-2">Low Stock Alert</h4>
                                    <p className="text-sm text-green-700">5 items need immediate reorder</p>
                                    <button className="mt-2 text-green-600 hover:text-green-800 text-sm font-medium">
                                        Download PDF
                                    </button>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <h4 className="font-medium text-purple-900 mb-2">Monthly Revenue</h4>
                                    <p className="text-sm text-purple-700">This month: $67,890 (+12% growth)</p>
                                    <button className="mt-2 text-purple-600 hover:text-purple-800 text-sm font-medium">
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'prescriptions' && (
                    <div className="space-y-8">
                            {/* Welcome Banner removed */}

                        {/* Daily Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                            {dailyStats.map((stat, index) => (
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

                        {/* Pending Prescriptions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
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
                            <div className="divide-y divide-gray-100">
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
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                                    Add Stock
                                </button>
                            </div>
                            <div className="divide-y divide-gray-100">
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
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
                            
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
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
                            
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
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
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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