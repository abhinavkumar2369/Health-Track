import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacistAPI } from '../services/api';
import { LayoutDashboard, Package, ArrowLeftRight, BarChart3, User, LogOut, Settings, FileText, Download, Trash2, Plus, Menu, X, Send, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const PharmacistDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [medicines, setMedicines] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    
    // Reports state
    const [reports, setReports] = useState([]);
    const [reportForm, setReportForm] = useState({
        reportType: 'summary',
        title: '',
        description: '',
        dateFrom: '',
        dateTo: ''
    });
    
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

    // Profile form states
    const [profileForm, setProfileForm] = useState({
        name: '',
        gender: '',
        phone: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // ML Predictions state
    const [predictions, setPredictions] = useState(null);
    const [predictionsLoading, setPredictionsLoading] = useState(false);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [mlHealth, setMlHealth] = useState(null);
    const [mlHealthLoading, setMlHealthLoading] = useState(false);

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
        fetchTransactions();
        fetchProfile();
        fetchReports();
        fetchPredictions();
        fetchMlHealth();
    }, [navigate]);

    const fetchPredictions = async () => {
        setPredictionsLoading(true);
        try {
            const response = await pharmacistAPI.getInventoryPredictions();
            if (response.success) {
                setPredictions(response);
                // Select first medicine with predictions for chart display
                if (response.predictions && response.predictions.length > 0) {
                    setSelectedPrediction(response.predictions[0]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch predictions:', err);
        } finally {
            setPredictionsLoading(false);
        }
    };

    const fetchMlHealth = async () => {
        setMlHealthLoading(true);
        try {
            const response = await pharmacistAPI.getMlHealth();
            setMlHealth(response);
        } catch (err) {
            setMlHealth({ success: false, status: 'unreachable', message: err.message });
        } finally {
            setMlHealthLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await pharmacistAPI.getProfile();
            if (response.profile) {
                setProfileForm({
                    name: response.profile.name || '',
                    gender: response.profile.gender || '',
                    phone: response.profile.phone || ''
                });
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    };

    const fetchReports = async () => {
        try {
            const response = await pharmacistAPI.getReports();
            if (response.success) {
                setReports(response.reports || []);
            }
        } catch (err) {
            console.error('Failed to fetch reports:', err);
        }
    };

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

    const fetchTransactions = async () => {
        try {
            const response = await pharmacistAPI.getTransactions();
            setTransactions(response.transactions || []);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
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
            fetchTransactions(); // Refresh transactions
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
            fetchTransactions(); // Refresh transactions
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
            fetchTransactions(); // Refresh transactions
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
            fetchTransactions(); // Refresh transactions
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

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            const response = await pharmacistAPI.updateProfile(profileForm);
            setSuccess('Profile updated successfully!');
            
            // Update user in localStorage
            const userData = JSON.parse(localStorage.getItem('user'));
            userData.fullName = profileForm.name;
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await pharmacistAPI.updatePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setSuccess('Password updated successfully!');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            const response = await pharmacistAPI.generateReport(reportForm);
            if (response.success) {
                setSuccess('Report generated successfully!');
                setShowReportModal(false);
                setReportForm({
                    reportType: 'summary',
                    title: '',
                    description: '',
                    dateFrom: '',
                    dateTo: ''
                });
                fetchReports();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError(err.message || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async (reportId) => {
        try {
            const response = await pharmacistAPI.getReportDownloadUrl(reportId);
            if (response.success && response.downloadUrl) {
                window.open(response.downloadUrl, '_blank');
            }
        } catch (err) {
            setError(err.message || 'Failed to download report');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleDeleteReport = async (reportId, reportTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${reportTitle}"?`)) {
            return;
        }
        try {
            setLoading(true);
            const response = await pharmacistAPI.deleteReport(reportId);
            if (response.success) {
                setSuccess('Report deleted successfully!');
                fetchReports();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError(err.message || 'Failed to delete report');
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

    const sidebarItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'inventory', icon: Package, label: 'Inventory' },
        { id: 'transactions', icon: ArrowLeftRight, label: 'Transactions' },
        { id: 'reports', icon: BarChart3, label: 'Reports' },
        { id: 'personal-details', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <img src="/favicon.svg" alt="Health Track" className="w-8 h-8" />
                        <span className="text-lg font-bold text-gray-900">Health Track</span>
                    </div>
                    <button 
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === item.id
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
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 rounded-lg hover:text-red-700 transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8">
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                    <div className="text-sm text-gray-500 ml-auto">
                        <span className="hidden sm:inline">{new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</span>
                        <span className="sm:hidden">{new Date().toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                        })}</span>
                    </div>
                </header>

                {/* Success/Error Messages - Toast Notifications */}
                {success && (
                    <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
                        <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="flex-1">{success}</span>
                            <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
                        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="flex-1">{error}</span>
                            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {activeTab === 'overview' && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Stats Cards + Stock Distribution in Large Box */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Inventory Stats Box */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col">
                                <h3 className="text-base font-semibold text-gray-900 mb-3">Inventory Overview</h3>
                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex flex-col justify-center">
                                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Total Medicines</p>
                                        <p className="text-xl font-semibold text-gray-900 mt-1">{stats?.totalItems || 0}</p>
                                        <p className="text-xs text-gray-500">items in inventory</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-green-50 border border-green-100 flex flex-col justify-center">
                                        <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Total Stock</p>
                                        <p className="text-xl font-semibold text-gray-900 mt-1">{stats?.totalQuantity || 0}</p>
                                        <p className="text-xs text-gray-500">units available</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-100 flex flex-col justify-center">
                                        <p className="text-xs font-medium text-yellow-600 uppercase tracking-wider">Low Stock</p>
                                        <p className="text-xl font-semibold text-yellow-600 mt-1">{stats?.lowStock || 0}</p>
                                        <p className="text-xs text-gray-500">need restock</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex flex-col justify-center">
                                        <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Out of Stock</p>
                                        <p className="text-xl font-semibold text-red-600 mt-1">{stats?.outOfStock || 0}</p>
                                        <p className="text-xs text-gray-500">unavailable</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stock Distribution Box */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <h3 className="text-base font-semibold text-gray-900 mb-3">Stock Distribution</h3>
                                {medicines.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-500 text-xs">No inventory data</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {(() => {
                                            const goodStock = medicines.filter(m => m.quantity >= 50).length;
                                            const lowStock = medicines.filter(m => m.quantity > 0 && m.quantity < 50).length;
                                            const outOfStock = medicines.filter(m => m.quantity === 0).length;
                                            const total = medicines.length || 1;

                                            return (
                                                <>
                                                    <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                                                        <div className="flex justify-between items-center mb-1.5">
                                                            <span className="text-xs font-medium text-gray-700">Good Stock</span>
                                                            <span className="text-base font-bold text-green-600">{goodStock}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                            <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${(goodStock / total) * 100}%` }}></div>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                                                        <div className="flex justify-between items-center mb-1.5">
                                                            <span className="text-xs font-medium text-gray-700">Low Stock</span>
                                                            <span className="text-base font-bold text-yellow-600">{lowStock}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                            <div className="bg-yellow-500 h-1.5 rounded-full transition-all" style={{ width: `${(lowStock / total) * 100}%` }}></div>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                                                        <div className="flex justify-between items-center mb-1.5">
                                                            <span className="text-xs font-medium text-gray-700">Out of Stock</span>
                                                            <span className="text-base font-bold text-red-600">{outOfStock}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                            <div className="bg-red-500 h-1.5 rounded-full transition-all" style={{ width: `${(outOfStock / total) * 100}%` }}></div>
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Low Stock Alerts */}
                        {inventoryAlerts.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {inventoryAlerts.slice(0, 5).map((med) => (
                                                <tr key={med.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{med.name}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{med.category || 'N/A'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{med.quantity} units</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                            med.quantity === 0 ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                                                        }`}>
                                                            {med.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ML Inventory Predictions */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">ML Stock Predictions</h3>
                                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">AI Powered</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                        predictions?.dataSource === 'ml-prediction'
                                            ? 'bg-green-100 text-green-700'
                                            : predictions?.dataSource === 'fallback-calculation'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {predictions?.dataSource === 'ml-prediction'
                                            ? 'ML Service Connected'
                                            : predictions?.dataSource === 'fallback-calculation'
                                            ? 'ML Service Offline (Fallback)'
                                            : 'ML Service Not Checked'}
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                        mlHealth?.success && mlHealth?.status === 'healthy'
                                            ? 'bg-green-100 text-green-700'
                                            : mlHealth?.status === 'unhealthy'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : mlHealth?.status === 'unreachable'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {mlHealthLoading
                                            ? 'ML Health: Checking...'
                                            : mlHealth?.success && mlHealth?.status === 'healthy'
                                            ? 'ML Health: OK'
                                            : mlHealth?.status === 'unhealthy'
                                            ? 'ML Health: Unhealthy'
                                            : mlHealth?.status === 'unreachable'
                                            ? 'ML Health: Unreachable'
                                            : 'ML Health: Not Checked'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={fetchPredictions}
                                        className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
                                        disabled={predictionsLoading}
                                    >
                                        {predictionsLoading ? 'Checking...' : 'Check Connection'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={fetchMlHealth}
                                        className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
                                        disabled={mlHealthLoading}
                                    >
                                        {mlHealthLoading ? 'Checking...' : 'Check ML Health'}
                                    </button>
                                    {predictions && predictions.predictions && predictions.predictions.length > 0 && (
                                        <select
                                            value={selectedPrediction?.medicineName || ''}
                                            onChange={(e) => {
                                                const pred = predictions.predictions.find(p => p.medicineName === e.target.value);
                                                setSelectedPrediction(pred);
                                            }}
                                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            {predictions.predictions.map((pred) => (
                                                <option key={pred.medicineName} value={pred.medicineName}>
                                                    {pred.medicineName}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>

                            {predictionsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="ml-3 text-gray-500 text-sm">Analyzing inventory patterns...</span>
                                </div>
                            ) : !predictions || !predictions.predictions || predictions.predictions.length === 0 ? (
                                <div className="text-center py-12">
                                    <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">No prediction data available</p>
                                    <p className="text-gray-400 text-xs mt-1">Add medicines and transactions to enable predictions</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {/* Prediction Summary Cards */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertTriangle className="w-4 h-4 text-gray-600" />
                                                <span className="text-xs font-medium text-gray-700">Urgent Restock</span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{predictions.summary?.urgentRestock || 0}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertTriangle className="w-4 h-4 text-gray-600" />
                                                <span className="text-xs font-medium text-gray-700">At Risk</span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{predictions.summary?.atRisk || 0}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle className="w-4 h-4 text-gray-600" />
                                                <span className="text-xs font-medium text-gray-700">Stable</span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{predictions.summary?.stable || 0}</p>
                                        </div>
                                    </div>

                                    {/* Selected Medicine Details */}
                                    {selectedPrediction && (
                                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{selectedPrediction.medicineName}</h4>
                                                    <p className="text-sm text-gray-500">Current Stock: {selectedPrediction.currentStock} units</p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    selectedPrediction.restockRecommendation === 'Urgent - Restock immediately' 
                                                        ? 'bg-red-100 text-red-700' 
                                                        : selectedPrediction.restockRecommendation === 'Warning - Consider restocking soon'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {selectedPrediction.restockRecommendation === 'Urgent - Restock immediately' ? 'Urgent Restock' :
                                                     selectedPrediction.restockRecommendation === 'Warning - Consider restocking soon' ? 'At Risk' : 'Stable'}
                                                </div>
                                            </div>

                                            {/* 7-Day Prediction Line Chart */}
                                            <div className="mb-4">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">7-Day Stock Forecast</p>
                                                <div className="relative h-48 bg-white rounded-lg border border-gray-100 p-4">
                                                    {selectedPrediction.predictions && selectedPrediction.predictions.length > 0 && (() => {
                                                        const data = selectedPrediction.predictions;
                                                        const maxStock = Math.max(selectedPrediction.currentStock, ...data.map(d => d.predictedStock));
                                                        const minStock = Math.min(0, ...data.map(d => d.predictedStock));
                                                        const range = maxStock - minStock || 1;
                                                        const chartWidth = 280;
                                                        const chartHeight = 120;
                                                        const padding = 10;
                                                        
                                                        const points = data.map((d, i) => {
                                                            const x = padding + (i / (data.length - 1)) * (chartWidth - 2 * padding);
                                                            const y = padding + (chartHeight - 2 * padding) - ((d.predictedStock - minStock) / range) * (chartHeight - 2 * padding);
                                                            return `${x},${y}`;
                                                        }).join(' ');
                                                        
                                                        const areaPoints = `${padding},${chartHeight - padding} ${points} ${chartWidth - padding},${chartHeight - padding}`;
                                                        
                                                        return (
                                                            <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
                                                                {/* Grid Lines */}
                                                                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
                                                                    <line
                                                                        key={idx}
                                                                        x1={padding}
                                                                        y1={padding + (chartHeight - 2 * padding) * ratio}
                                                                        x2={chartWidth - padding}
                                                                        y2={padding + (chartHeight - 2 * padding) * ratio}
                                                                        stroke="#E5E7EB"
                                                                        strokeWidth="1"
                                                                    />
                                                                ))}
                                                                {/* Gradient Area */}
                                                                <defs>
                                                                    <linearGradient id="stockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                                                                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                                                                    </linearGradient>
                                                                </defs>
                                                                <polygon points={areaPoints} fill="url(#stockGradient)" />
                                                                {/* Line */}
                                                                <polyline
                                                                    points={points}
                                                                    fill="none"
                                                                    stroke="#3B82F6"
                                                                    strokeWidth="2.5"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                                {/* Data Points */}
                                                                {data.map((d, i) => {
                                                                    const x = padding + (i / (data.length - 1)) * (chartWidth - 2 * padding);
                                                                    const y = padding + (chartHeight - 2 * padding) - ((d.predictedStock - minStock) / range) * (chartHeight - 2 * padding);
                                                                    return (
                                                                        <g key={i}>
                                                                            <circle
                                                                                cx={x}
                                                                                cy={y}
                                                                                r="5"
                                                                                fill="#3B82F6"
                                                                                stroke="white"
                                                                                strokeWidth="2"
                                                                            />
                                                                            <text
                                                                                x={x}
                                                                                y={y - 10}
                                                                                textAnchor="middle"
                                                                                fontSize="9"
                                                                                fill="#6B7280"
                                                                                fontWeight="500"
                                                                            >
                                                                                {d.predictedStock}
                                                                            </text>
                                                                        </g>
                                                                    );
                                                                })}
                                                            </svg>
                                                        );
                                                    })()}
                                                </div>
                                                {/* X-axis Labels */}
                                                <div className="flex justify-between mt-2 px-2 text-xs text-gray-500 font-medium">
                                                    {selectedPrediction.predictions && selectedPrediction.predictions.slice(0, 7).map((d, i) => (
                                                        <span key={i}>{new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Prediction Stats */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                                                <div className="p-2 bg-white rounded-lg border border-gray-100">
                                                    <p className="text-xs text-gray-500">Avg Daily Demand</p>
                                                    <p className="text-lg font-semibold text-gray-900">{selectedPrediction.averageDailyDemand?.toFixed(1) || '0'}</p>
                                                </div>
                                                <div className="p-2 bg-white rounded-lg border border-gray-100">
                                                    <p className="text-xs text-gray-500">Days Until Stockout</p>
                                                    <p className={`text-lg font-semibold ${
                                                        selectedPrediction.daysUntilStockout <= 3 ? 'text-red-600' :
                                                        selectedPrediction.daysUntilStockout <= 7 ? 'text-yellow-600' : 'text-green-600'
                                                    }`}>
                                                        {selectedPrediction.daysUntilStockout > 30 ? '30+' : selectedPrediction.daysUntilStockout}
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-white rounded-lg border border-gray-100">
                                                    <p className="text-xs text-gray-500">Trend</p>
                                                    <p className={`text-lg font-semibold ${
                                                        selectedPrediction.trendAnalysis === 'increasing' ? 'text-green-600' :
                                                        selectedPrediction.trendAnalysis === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                                                    }`}>
                                                        {selectedPrediction.trendAnalysis === 'increasing' ? '↑ Up' :
                                                         selectedPrediction.trendAnalysis === 'decreasing' ? '↓ Down' : '→ Stable'}
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-white rounded-lg border border-gray-100">
                                                    <p className="text-xs text-gray-500">Algorithm</p>
                                                    <p className="text-sm font-semibold text-blue-600">Linear Regression</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="space-y-4 sm:space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Transaction History</h3>
                            </div>
                            
                            {loading && transactions.length === 0 ? (
                                <div className="p-8 sm:p-16 text-center">
                                    <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-gray-500 mt-4 text-sm">Loading transactions...</p>
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="p-8 sm:p-16 text-center">
                                    <ArrowLeftRight className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No Transactions Yet</h3>
                                    <p className="text-gray-500 text-xs sm:text-sm">Transaction history will appear here</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    {/* Mobile Card View */}
                                    <div className="sm:hidden divide-y divide-gray-100">
                                        {transactions.map((txn) => (
                                            <div key={txn.id} className="p-4 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{txn.medicineName}</p>
                                                        <p className="text-xs text-gray-500">{txn.quantity} units • ₹{txn.totalAmount?.toFixed(2) || '0.00'}</p>
                                                    </div>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                        txn.type === 'add' ? 'bg-blue-50 text-blue-700' :
                                                        txn.type === 'issue' ? 'bg-green-50 text-green-700' :
                                                        txn.type === 'update' ? 'bg-yellow-50 text-yellow-700' :
                                                        'bg-red-50 text-red-700'
                                                    }`}>
                                                        {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>{txn.patientName || 'No patient'}</span>
                                                    <span>{new Date(txn.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Desktop Table View */}
                                    <table className="w-full hidden sm:table">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Medicine</th>
                                                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
                                                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Patient</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {transactions.map((txn) => (
                                                <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(txn.createdAt).toLocaleString('en-IN', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                            txn.type === 'add' ? 'bg-blue-50 text-blue-700' :
                                                            txn.type === 'issue' ? 'bg-green-50 text-green-700' :
                                                            txn.type === 'update' ? 'bg-yellow-50 text-yellow-700' :
                                                            'bg-red-50 text-red-700'
                                                        }`}>
                                                            {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4 text-sm font-medium text-gray-900">
                                                        {txn.medicineName}
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {txn.quantity}
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        ₹{txn.totalAmount ? txn.totalAmount.toFixed(2) : '0.00'}
                                                    </td>
                                                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">
                                                        {txn.patientName || '—'}
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

                {activeTab === 'inventory' && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Inventory Header with Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Items</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">{stats?.totalItems || 0}</p>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Stock</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">{stats?.totalQuantity || 0}</p>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">{stats?.lowStock || 0}</p>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Out of Stock</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">{stats?.outOfStock || 0}</p>
                            </div>
                        </div>

                        {/* Medicines List */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Medicine Inventory</h3>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setShowIssueModal(true)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>Issue Medicine</span>
                                    </button>
                                    <button 
                                        onClick={() => setShowAddModal(true)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Add Medicine</span>
                                    </button>
                                </div>
                            </div>
                            
                            {loading && medicines.length === 0 ? (
                                <div className="p-16 text-center">
                                    <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-gray-500 mt-4 text-sm">Loading inventory...</p>
                                </div>
                            ) : medicines.length === 0 ? (
                                <div className="p-16 text-center">
                                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Medicines Found</h3>
                                    <p className="text-gray-500 mb-6 text-sm">Add your first medicine to get started</p>
                                    <button 
                                        onClick={() => setShowAddModal(true)}
                                        className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                                    >
                                        Add First Medicine
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Mobile Card View */}
                                    <div className="lg:hidden divide-y divide-gray-100">
                                        {medicines.map((medicine) => (
                                            <div key={medicine.id} className="p-4 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{medicine.name}</p>
                                                        {medicine.description && (
                                                            <p className="text-xs text-gray-500 mt-0.5">{medicine.description}</p>
                                                        )}
                                                    </div>
                                                    <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                                        {medicine.category || 'General'}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-sm">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Quantity</p>
                                                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                                            medicine.quantity === 0 ? 'bg-red-50 text-red-700' :
                                                            medicine.quantity < 50 ? 'bg-yellow-50 text-yellow-700' :
                                                            'bg-green-50 text-green-700'
                                                        }`}>
                                                            {medicine.quantity}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Price</p>
                                                        <p className="font-medium text-gray-900">₹{medicine.price || '0.00'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Expiry</p>
                                                        <p className="text-gray-600">{medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : '—'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4 pt-2 border-t border-gray-100">
                                                    <button 
                                                        onClick={() => openIssueModal(medicine)}
                                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={medicine.quantity === 0}
                                                    >
                                                        Issue
                                                    </button>
                                                    <button 
                                                        onClick={() => openEditModal(medicine)}
                                                        className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRemoveMedicine(medicine.id, medicine.name)}
                                                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Desktop Table View */}
                                    <div className="hidden lg:block overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Medicine</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {medicines.map((medicine) => (
                                                    <tr key={medicine.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-medium text-gray-900">{medicine.name}</p>
                                                            {medicine.description && (
                                                                <p className="text-xs text-gray-500 mt-0.5">{medicine.description}</p>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                                                {medicine.category || 'General'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                                                                medicine.quantity === 0 ? 'bg-red-50 text-red-700' :
                                                                medicine.quantity < 50 ? 'bg-yellow-50 text-yellow-700' :
                                                                'bg-green-50 text-green-700'
                                                            }`}>
                                                                {medicine.quantity} units
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm font-medium text-gray-900">₹{medicine.price || '0.00'}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : '—'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-3">
                                                                <button 
                                                                    onClick={() => openIssueModal(medicine)}
                                                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                                                                    disabled={medicine.quantity === 0}
                                                                >
                                                                    Issue
                                                                </button>
                                                                <button 
                                                                    onClick={() => openEditModal(medicine)}
                                                                    className="text-sm text-gray-600 hover:text-gray-700 font-medium hover:underline"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleRemoveMedicine(medicine.id, medicine.name)}
                                                                    className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="space-y-6">
                        {/* Reports Header */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
                                <button 
                                    onClick={() => setShowReportModal(true)}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Generate Report</span>
                                </button>
                            </div>
                            
                            {loading && reports.length === 0 ? (
                                <div className="p-16 text-center">
                                    <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-gray-500 mt-4 text-sm">Loading reports...</p>
                                </div>
                            ) : reports.length === 0 ? (
                                <div className="p-16 text-center">
                                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reports Found</h3>
                                    <p className="text-gray-500 mb-6 text-sm">Generate your first report to get started</p>
                                    <button 
                                        onClick={() => setShowReportModal(true)}
                                        className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                                    >
                                        Generate First Report
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Mobile Card View */}
                                    <div className="lg:hidden divide-y divide-gray-100">
                                        {reports.map((report) => (
                                            <div key={report.id} className="p-4 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <FileText className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{report.title}</p>
                                                            {report.description && (
                                                                <p className="text-xs text-gray-500 mt-0.5">{report.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                                        report.status === 'completed' ? 'bg-green-50 text-green-700' :
                                                        report.status === 'generating' ? 'bg-yellow-50 text-yellow-700' :
                                                        'bg-red-50 text-red-700'
                                                    }`}>
                                                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-sm">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Type</p>
                                                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                                            report.reportType === 'inventory' ? 'bg-blue-50 text-blue-700' :
                                                            report.reportType === 'transaction' ? 'bg-green-50 text-green-700' :
                                                            'bg-purple-50 text-purple-700'
                                                        }`}>
                                                            {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Size</p>
                                                        <p className="text-gray-600">{formatFileSize(report.fileSize)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Generated</p>
                                                        <p className="text-gray-600">{new Date(report.generatedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4 pt-2 border-t border-gray-100">
                                                    {report.status === 'completed' && (
                                                        <button 
                                                            onClick={() => handleDownloadReport(report.id)}
                                                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            <span>Download</span>
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDeleteReport(report.id, report.title)}
                                                        className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center space-x-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Desktop Table View */}
                                    <div className="hidden lg:block overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Report</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Generated</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Size</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {reports.map((report) => (
                                                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-3">
                                                                <FileText className="w-5 h-5 text-gray-400" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">{report.title}</p>
                                                                    {report.description && (
                                                                        <p className="text-xs text-gray-500 mt-0.5">{report.description}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                                                                report.reportType === 'inventory' ? 'bg-blue-50 text-blue-700' :
                                                                report.reportType === 'transaction' ? 'bg-green-50 text-green-700' :
                                                                'bg-purple-50 text-purple-700'
                                                            }`}>
                                                                {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {new Date(report.generatedAt).toLocaleString('en-IN', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {formatFileSize(report.fileSize)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                                                                report.status === 'completed' ? 'bg-green-50 text-green-700' :
                                                                report.status === 'generating' ? 'bg-yellow-50 text-yellow-700' :
                                                                'bg-red-50 text-red-700'
                                                            }`}>
                                                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-3">
                                                                {report.status === 'completed' && (
                                                                    <button 
                                                                        onClick={() => handleDownloadReport(report.id)}
                                                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline flex items-center space-x-1"
                                                                    >
                                                                        <Download className="w-4 h-4" />
                                                                        <span>Download</span>
                                                                    </button>
                                                                )}
                                                                <button 
                                                                    onClick={() => handleDeleteReport(report.id, report.title)}
                                                                    className="text-red-600 hover:text-red-700 font-medium text-sm hover:underline flex items-center space-x-1"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    <span>Delete</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'personal-details' && (
                    <div className="space-y-5">

                        {/* Alerts */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                {success}
                            </div>
                        )}

                        {/* ── Full-width Profile Banner ── */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Colored top strip */}
                            <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"/>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-6">
                                {/* Avatar */}
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-md flex-shrink-0">
                                    {user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'P'}
                                </div>
                                {/* Name & email */}
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-bold text-gray-900 leading-tight truncate">{user?.fullName || profileForm.name || 'Pharmacist'}</h2>
                                    <p className="text-sm text-gray-500 mt-0.5 truncate">{user?.email}</p>
                                </div>
                                {/* Badges */}
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>
                                        Pharmacist
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"/></svg>
                                        <span className="font-mono">#{user?.userId || user?.id?.slice(-6) || 'N/A'}</span>
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── Full-width two-column forms ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                            {/* Edit Profile */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
                                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800">Edit Profile</h3>
                                </div>
                                <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullname"
                                            required
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:bg-white focus:border-blue-400 focus:ring-3 focus:ring-blue-100 transition-all"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            readOnly
                                            value={user?.email || ''}
                                            className="w-full px-3.5 py-2.5 border border-gray-100 rounded-xl text-sm text-gray-400 bg-gray-100 cursor-not-allowed outline-none"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Gender</label>
                                            <select
                                                name="gender"
                                                value={profileForm.gender}
                                                onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
                                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:bg-white focus:border-blue-400 focus:ring-3 focus:ring-blue-100 transition-all"
                                            >
                                                <option value="">Select gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:bg-white focus:border-blue-400 focus:ring-3 focus:ring-blue-100 transition-all"
                                                placeholder="+91 00000 00000"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>

                            {/* Change Password */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800">Change Password</h3>
                                </div>
                                <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Current Password</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            required
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:bg-white focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 transition-all"
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            required
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:bg-white focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 transition-all"
                                            placeholder="Minimum 6 characters"
                                        />
                                        {passwordForm.newPassword.length > 0 && (
                                            <div className="mt-2 flex gap-1">
                                                {[1,2,3,4].map(i => (
                                                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                                                        passwordForm.newPassword.length >= i * 3
                                                            ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-yellow-400' : 'bg-emerald-500'
                                                            : 'bg-gray-200'
                                                    }`}/>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            required
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                            className={`w-full px-3.5 py-2.5 border rounded-xl text-sm text-gray-900 bg-gray-50 outline-none transition-all ${
                                                passwordForm.confirmPassword.length > 0
                                                    ? passwordForm.confirmPassword === passwordForm.newPassword
                                                        ? 'border-emerald-400 focus:ring-3 focus:ring-emerald-100 bg-emerald-50/30'
                                                        : 'border-red-300 focus:ring-3 focus:ring-red-100'
                                                    : 'border-gray-200 focus:bg-white focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100'
                                            }`}
                                            placeholder="Repeat new password"
                                        />
                                        {passwordForm.confirmPassword.length > 0 && passwordForm.confirmPassword !== passwordForm.newPassword && (
                                            <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                                        )}
                                        {passwordForm.confirmPassword.length > 0 && passwordForm.confirmPassword === passwordForm.newPassword && (
                                            <p className="text-xs text-emerald-600 mt-1">Passwords match ✓</p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
                                    >
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            </div>

                        </div>
                    </div>
                )}

            </main>

            {/* Add Medicine Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
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
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
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

            {/* Generate Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Generate Report</h3>
                            <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleGenerateReport} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type *</label>
                                <select
                                    required
                                    value={reportForm.reportType}
                                    onChange={(e) => setReportForm({...reportForm, reportType: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="summary">Summary Report</option>
                                    <option value="inventory">Inventory Report</option>
                                    <option value="transaction">Transaction Report</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Report Title</label>
                                <input
                                    type="text"
                                    value={reportForm.title}
                                    onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Monthly Inventory Report"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={reportForm.description}
                                    onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Brief description of the report"
                                    rows="2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                    <input
                                        type="date"
                                        value={reportForm.dateFrom}
                                        onChange={(e) => setReportForm({...reportForm, dateFrom: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                    <input
                                        type="date"
                                        value={reportForm.dateTo}
                                        onChange={(e) => setReportForm({...reportForm, dateTo: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-700">
                                    <strong>Note:</strong> The report will be generated as a PDF and stored in cloud storage. You can download it anytime from the reports list.
                                </p>
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {loading ? 'Generating...' : 'Generate Report'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReportModal(false)}
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
            {showIssueModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Issue Medicine</h3>
                            <button onClick={() => { setShowIssueModal(false); resetIssueForm(); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleIssueMedicine} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Medicine *</label>
                                <select
                                    required
                                    value={issueForm.medicineId}
                                    onChange={(e) => {
                                        const selected = medicines.find(m => m.id === e.target.value);
                                        setIssueForm({...issueForm, medicineId: e.target.value});
                                        setSelectedMedicine(selected);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Choose a medicine...</option>
                                    {medicines.filter(m => m.quantity > 0).map((medicine) => (
                                        <option key={medicine.id} value={medicine.id}>
                                            {medicine.name} (Available: {medicine.quantity})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedMedicine && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm font-medium text-blue-900">Medicine: {selectedMedicine.name}</p>
                                    <p className="text-sm text-blue-700">Available: {selectedMedicine.quantity} units</p>
                                    {selectedMedicine.category && (
                                        <p className="text-sm text-blue-700">Category: {selectedMedicine.category}</p>
                                    )}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Issue *</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max={selectedMedicine?.quantity || 999999}
                                    value={issueForm.quantity}
                                    onChange={(e) => setIssueForm({...issueForm, quantity: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter quantity"
                                    disabled={!issueForm.medicineId}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Code *</label>
                                <input
                                    type="text"
                                    required
                                    value={issueForm.patientName}
                                    onChange={(e) => setIssueForm({...issueForm, patientName: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter patient code"
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
        </div>
    );
};

export default PharmacistDashboard;
