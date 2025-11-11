import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacistAPI } from '../services/api';

const PharmacistDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [medicines, setMedicines] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    
    // Form states
    const [medicineForm, setMedicineForm] = useState({
        name: '',
        description: '',
        quantity: '',
        category: '',
        expiryDate: '',
        price: ''
    });
    
    const [issueForm, setIssueForm] = useState({
        medicineId: '',
        quantity: '',
        patientName: '',
        notes: ''
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/sign-in');
            return;
        }
        
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'pharmacist') {
            navigate('/sign-in');
            return;
        }
        
        setUser(parsedUser);
        fetchMedicines();
        fetchStats();
    }, [navigate]);

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const response = await pharmacistAPI.getMedicines();
            setMedicines(response.medicines || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch medicines');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await pharmacistAPI.getInventoryStats();
            setStats(response.stats);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const handleAddMedicine = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            await pharmacistAPI.addMedicine(medicineForm);
            setSuccess('Medicine added successfully!');
            setShowAddModal(false);
            resetMedicineForm();
            fetchMedicines();
            fetchStats();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to add medicine');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMedicine = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            await pharmacistAPI.updateMedicine(selectedMedicine.id, medicineForm);
            setSuccess('Medicine updated successfully!');
            setShowEditModal(false);
            resetMedicineForm();
            fetchMedicines();
            fetchStats();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update medicine');
        } finally {
            setLoading(false);
        }
    };

    const handleIssueMedicine = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            await pharmacistAPI.issueMedicine(issueForm);
            setSuccess('Medicine issued successfully!');
            setShowIssueModal(false);
            resetIssueForm();
            fetchMedicines();
            fetchStats();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to issue medicine');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMedicine = async (medicineId, medicineName) => {
        if (!window.confirm(`Are you sure you want to remove ${medicineName}?`)) {
            return;
        }
        try {
            setLoading(true);
            setError('');
            await pharmacistAPI.removeMedicine(medicineId);
            setSuccess('Medicine removed successfully!');
            fetchMedicines();
            fetchStats();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to remove medicine');
        } finally {
            setLoading(false);
        }
    };

    const resetMedicineForm = () => {
        setMedicineForm({
            name: '',
            description: '',
            quantity: '',
            category: '',
            expiryDate: '',
            price: ''
        });
        setSelectedMedicine(null);
    };

    const resetIssueForm = () => {
        setIssueForm({
            medicineId: '',
            quantity: '',
            patientName: '',
            notes: ''
        });
    };

    const openEditModal = (medicine) => {
        setSelectedMedicine(medicine);
        setMedicineForm({
            name: medicine.name,
            description: medicine.description || '',
            quantity: medicine.quantity,
            category: medicine.category || '',
            expiryDate: medicine.expiryDate ? medicine.expiryDate.split('T')[0] : '',
            price: medicine.price || ''
        });
        setShowEditModal(true);
    };

    const openIssueModal = (medicine) => {
        setIssueForm({
            medicineId: medicine.id,
            quantity: '',
            patientName: '',
            notes: ''
        });
        setSelectedMedicine(medicine);
        setShowIssueModal(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
    };

    const inventoryAlerts = medicines.filter(med => med.quantity < 50);

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
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Pharmacy Panel</h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-800">{user.fullName || user.email}</p>
                                <p className="text-xs text-slate-600">Pharmacist</p>
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

            {/* Success/Error Messages */}
            {success && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                </div>
            )}
            {error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                </div>
            )}

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
                                        ? 'border-blue-300 text-blue-600'
                                        : 'border-transparent text-slate-600 hover:text-slate-700 hover:border-slate-200'
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
                        {/* Inventory Alerts */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
                                <button 
                                    onClick={() => setActiveTab('inventory')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                                >
                                    View Inventory
                                </button>
                            </div>
                            {inventoryAlerts.length === 0 ? (
                                <div className="px-6 py-8 text-center text-gray-500">
                                    No low stock items
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {inventoryAlerts.map((item) => (
                                        <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                    <p className="text-sm text-gray-500">Current: {item.quantity} units • Minimum: 50 units</p>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        item.quantity === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {item.quantity === 0 ? 'critical' : 'low'}
                                                    </span>
                                                    <button 
                                                        onClick={() => openEditModal(item)}
                                                        className="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700"
                                                    >
                                                        Restock
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Transactions Available</h3>
                            <p className="text-gray-500">Transaction history will appear here</p>
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="space-y-6">
                        {/* Inventory Header with Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Items</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats?.totalItems || 0}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Stock</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats?.totalQuantity || 0}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Low Stock</p>
                                        <p className="text-2xl font-bold text-yellow-600">{stats?.lowStock || 0}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Out of Stock</p>
                                        <p className="text-2xl font-bold text-red-600">{stats?.outOfStock || 0}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Medicines List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Medicine Inventory</h3>
                                <button 
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Add Medicine</span>
                                </button>
                            </div>
                            
                            {loading && medicines.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading inventory...</p>
                                </div>
                            ) : medicines.length === 0 ? (
                                <div className="p-12 text-center">
                                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Medicines in Inventory</h3>
                                    <p className="text-gray-500 mb-4">Start by adding your first medicine</p>
                                    <button 
                                        onClick={() => setShowAddModal(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                                    >
                                        Add Medicine
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {medicines.map((medicine) => (
                                                <tr key={medicine.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{medicine.name}</p>
                                                            <p className="text-sm text-gray-500">{medicine.description}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{medicine.category || 'N/A'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                            medicine.quantity === 0 ? 'bg-red-100 text-red-800' :
                                                            medicine.quantity < 50 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                            {medicine.quantity} units
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">${medicine.price || '0.00'}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm space-x-2">
                                                        <button 
                                                            onClick={() => openIssueModal(medicine)}
                                                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                                                            disabled={medicine.quantity === 0}
                                                        >
                                                            Issue
                                                        </button>
                                                        <button 
                                                            onClick={() => openEditModal(medicine)}
                                                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRemoveMedicine(medicine.id, medicine.name)}
                                                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
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

                {activeTab === 'reports' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reports Available</h3>
                            <p className="text-gray-500">Report generation features will be available here</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Add Medicine Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Add New Medicine</h3>
                            <button onClick={() => { setShowAddModal(false); resetMedicineForm(); }} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddMedicine} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={medicineForm.name}
                                    onChange={(e) => setMedicineForm({...medicineForm, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Paracetamol 500mg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={medicineForm.description}
                                    onChange={(e) => setMedicineForm({...medicineForm, description: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Brief description"
                                    rows="3"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={medicineForm.category}
                                        onChange={(e) => setMedicineForm({...medicineForm, category: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select category</option>
                                        <option value="Antibiotic">Antibiotic</option>
                                        <option value="Painkiller">Painkiller</option>
                                        <option value="Vitamin">Vitamin</option>
                                        <option value="Antacid">Antacid</option>
                                        <option value="Antihistamine">Antihistamine</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={medicineForm.quantity}
                                        onChange={(e) => setMedicineForm({...medicineForm, quantity: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={medicineForm.price}
                                        onChange={(e) => setMedicineForm({...medicineForm, price: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        value={medicineForm.expiryDate}
                                        onChange={(e) => setMedicineForm({...medicineForm, expiryDate: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Adding...' : 'Add Medicine'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowAddModal(false); resetMedicineForm(); }}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Medicine Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Edit Medicine</h3>
                            <button onClick={() => { setShowEditModal(false); resetMedicineForm(); }} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdateMedicine} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={medicineForm.name}
                                    onChange={(e) => setMedicineForm({...medicineForm, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={medicineForm.description}
                                    onChange={(e) => setMedicineForm({...medicineForm, description: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={medicineForm.category}
                                        onChange={(e) => setMedicineForm({...medicineForm, category: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select category</option>
                                        <option value="Antibiotic">Antibiotic</option>
                                        <option value="Painkiller">Painkiller</option>
                                        <option value="Vitamin">Vitamin</option>
                                        <option value="Antacid">Antacid</option>
                                        <option value="Antihistamine">Antihistamine</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={medicineForm.quantity}
                                        onChange={(e) => setMedicineForm({...medicineForm, quantity: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={medicineForm.price}
                                        onChange={(e) => setMedicineForm({...medicineForm, price: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        value={medicineForm.expiryDate}
                                        onChange={(e) => setMedicineForm({...medicineForm, expiryDate: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update Medicine'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); resetMedicineForm(); }}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Issue Medicine Modal */}
            {showIssueModal && selectedMedicine && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Issue Medicine</h3>
                            <button onClick={() => { setShowIssueModal(false); resetIssueForm(); }} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleIssueMedicine} className="p-6 space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-blue-900">Medicine: {selectedMedicine.name}</p>
                                <p className="text-sm text-blue-700">Available: {selectedMedicine.quantity} units</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Issue *</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max={selectedMedicine.quantity}
                                    value={issueForm.quantity}
                                    onChange={(e) => setIssueForm({...issueForm, quantity: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter quantity"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={issueForm.patientName}
                                    onChange={(e) => setIssueForm({...issueForm, patientName: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter patient name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={issueForm.notes}
                                    onChange={(e) => setIssueForm({...issueForm, notes: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Additional notes (optional)"
                                    rows="3"
                                />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? 'Issuing...' : 'Issue Medicine'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowIssueModal(false); resetIssueForm(); }}
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

export default PharmacistDashboard;
