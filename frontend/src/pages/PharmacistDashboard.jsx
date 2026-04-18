import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacistAPI } from '../services/api';
import {
    LayoutDashboard, Package, ArrowLeftRight, BarChart3, Settings, LogOut,
    FileText, Download, Trash2, Plus, Menu, X, Send, TrendingUp,
    AlertTriangle, CheckCircle, Pill, Activity, IndianRupee, Boxes,
    ChevronRight, RefreshCw, User
} from 'lucide-react';

/* â”€â”€â”€ tiny helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const inputCls = 'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';
const labelCls = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5';

const stockBadge = (qty) =>
    qty === 0
        ? 'bg-red-50 text-red-600 border border-red-200'
        : qty < 50
        ? 'bg-amber-50 text-amber-600 border border-amber-200'
        : 'bg-emerald-50 text-emerald-600 border border-emerald-200';

const typeBadge = (t) => ({
    add:    'bg-blue-50 text-blue-600 border border-blue-200',
    issue:  'bg-emerald-50 text-emerald-600 border border-emerald-200',
    update: 'bg-amber-50 text-amber-600 border border-amber-200',
    remove: 'bg-red-50 text-red-600 border border-red-200',
}[t] || 'bg-slate-100 text-slate-600');

/* â”€â”€â”€ Modal shell â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const Modal = ({ title, onClose, children, size = 'md' }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className={`bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${size === 'lg' ? 'max-w-2xl' : 'max-w-lg'}`}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                    <X className="w-4 h-4" />
                </button>
            </div>
            {children}
        </div>
    </div>
);

/* â”€â”€â”€ Stat card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const StatCard = ({ label, value, sub, icon: Icon, color }) => {
    const colors = {
        blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600',   val: 'text-blue-700'   },
        green:  { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', val: 'text-emerald-700' },
        amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-600',  val: 'text-amber-700'  },
        red:    { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-600',      val: 'text-red-700'    },
        purple: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600',val: 'text-violet-700' },
        teal:   { bg: 'bg-teal-50',   icon: 'bg-teal-100 text-teal-600',   val: 'text-teal-700'   },
    };
    const c = colors[color] || colors.blue;
    return (
        <div className={`${c.bg} rounded-xl p-4 flex items-start gap-3`}>
            <div className={`${c.icon} p-2.5 rounded-xl shrink-0`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">{label}</p>
                <p className={`text-2xl font-bold ${c.val} leading-tight mt-0.5`}>{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
};

/* â”€â”€â”€ Section header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const SectionHeader = ({ title, action }) => (
    <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {action}
    </div>
);

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
        setSelectedMedicine(null);
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
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-300 text-sm">Loading dashboardâ€¦</p>
                </div>
            </div>
        );
    }

    const sidebarItems = [
        { id: 'overview',         icon: LayoutDashboard, label: 'Overview'     },
        { id: 'inventory',        icon: Package,         label: 'Inventory'    },
        { id: 'transactions',     icon: ArrowLeftRight,  label: 'Transactions' },
        { id: 'reports',          icon: BarChart3,       label: 'Reports'      },
        { id: 'personal-details', icon: Settings,        label: 'Settings'     },
    ];

    const tabTitle = {
        'overview':         'Overview',
        'inventory':        'Inventory',
        'transactions':     'Transactions',
        'reports':          'Reports',
        'personal-details': 'Settings',
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* â”€â”€ Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <aside className={`w-64 bg-slate-900 flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <img src="/favicon.svg" alt="Health Track" className="w-7 h-7" />
                        <span className="text-base font-bold text-white tracking-tight">Health Track</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Role badge */}
                <div className="px-5 pt-5 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pharmacist Portal</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
                    {sidebarItems.map(({ id, icon: Icon, label }) => {
                        const active = activeTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    active
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{label}</span>
                                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
                            </button>
                        );
                    })}
                </nav>

                {/* User card at bottom */}
                <div className="p-3 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-1">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {user?.fullName?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.fullName || 'Pharmacist'}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                    </button>
                </div>
            </aside>

            {/* â”€â”€ Main Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-5 sm:px-8 shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-base font-bold text-slate-900 leading-tight">{tabTitle[activeTab]}</h1>
                            <p className="text-xs text-slate-400 hidden sm:block">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                                {user?.fullName?.charAt(0)?.toUpperCase() || 'P'}
                            </div>
                            <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">{user?.fullName || 'Pharmacist'}</span>
                        </div>
                    </div>
                </header>

                {/* Toasts */}
                {(success || error) && (
                    <div className="fixed top-5 right-5 z-[100] space-y-2">
                        {success && (
                            <div className="flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium max-w-xs animate-in slide-in-from-right-5 duration-300">
                                <CheckCircle className="w-4 h-4 shrink-0" />
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="flex items-center gap-2.5 bg-red-600 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium max-w-xs animate-in slide-in-from-right-5 duration-300">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {/* Scroll area */}
                <main className="flex-1 overflow-y-auto p-5 sm:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                    {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                        OVERVIEW TAB
                    â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Stat cards row */}
                            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                                <StatCard label="Total Items"    value={stats?.totalItems    || 0} icon={Boxes}        color="blue"  sub="Medicine types"     />
                                <StatCard label="Total Stock"    value={stats?.totalQuantity || 0} icon={Package}      color="teal"  sub="Units in inventory" />
                                <StatCard label="Low Stock"      value={stats?.lowStock      || 0} icon={AlertTriangle}color="amber" sub="Below 50 units"     />
                                <StatCard label="Out of Stock"   value={stats?.outOfStock    || 0} icon={Activity}     color="red"   sub="Zero units left"    />
                            </div>

                            {/* Middle row */}
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                {/* Stock Distribution */}
                                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5">
                                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Stock Distribution</h3>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Healthy',     value: stats?.healthyStock  || 0, color: 'bg-emerald-500' },
                                            { label: 'Low Stock',   value: stats?.lowStock      || 0, color: 'bg-amber-400'   },
                                            { label: 'Out of Stock',value: stats?.outOfStock    || 0, color: 'bg-red-500'     },
                                        ].map(({ label, value, color }) => {
                                            const total = (stats?.healthyStock || 0) + (stats?.lowStock || 0) + (stats?.outOfStock || 0) || 1;
                                            const pct = Math.round((value / total) * 100);
                                            return (
                                                <div key={label}>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="font-medium text-slate-600">{label}</span>
                                                        <span className="font-semibold text-slate-900">{value} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                                                    </div>
                                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {/* Revenue info */}
                                    {stats?.totalValue !== undefined && (
                                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                                            <IndianRupee className="w-4 h-4 text-emerald-600" />
                                            <span className="text-xs text-slate-500">Inventory value</span>
                                            <span className="ml-auto text-sm font-bold text-slate-900">â‚¹{stats.totalValue.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Low Stock Alerts */}
                                <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl overflow-hidden">
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                                            <h3 className="text-sm font-semibold text-slate-900">Low Stock Alerts</h3>
                                        </div>
                                        {inventoryAlerts.length > 0 && (
                                            <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">{inventoryAlerts.length} items</span>
                                        )}
                                    </div>
                                    {inventoryAlerts.length === 0 ? (
                                        <div className="p-10 text-center">
                                            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-slate-700">All stocked up!</p>
                                            <p className="text-xs text-slate-400 mt-1">No medicines below threshold</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                        <th className="px-5 py-3 text-left">Medicine</th>
                                                        <th className="px-5 py-3 text-left">Stock</th>
                                                        <th className="px-5 py-3 text-left">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {inventoryAlerts.slice(0, 6).map((med) => (
                                                        <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-5 py-3 font-medium text-slate-900">{med.name}</td>
                                                            <td className="px-5 py-3 text-slate-600">{med.quantity} units</td>
                                                            <td className="px-5 py-3">
                                                                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${stockBadge(med.quantity)}`}>
                                                                    {med.quantity === 0 ? 'Out of stock' : 'Low stock'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ML Predictions — always rendered */}
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                                {/* header */}
                                <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-100 rounded-lg">
                                            <TrendingUp className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-slate-900">AI Stock Predictions</h3>
                                        <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 font-semibold px-2 py-0.5 rounded-full">ML Powered</span>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                        {mlHealthLoading ? (
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <RefreshCw className="w-3 h-3 animate-spin" /> Checking&#8230;
                                            </span>
                                        ) : mlHealth ? (
                                            <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                                mlHealth.status === 'healthy'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : mlHealth.status === 'unreachable'
                                                    ? 'bg-red-50 text-red-600 border-red-200'
                                                    : 'bg-amber-50 text-amber-600 border-amber-200'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${mlHealth.status === 'healthy' ? 'bg-emerald-500' : mlHealth.status === 'unreachable' ? 'bg-red-500' : 'bg-amber-400'}`} />
                                                ML {mlHealth.status}
                                            </span>
                                        ) : null}
                                        <button onClick={fetchPredictions} disabled={predictionsLoading} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition disabled:opacity-40" title="Refresh predictions">
                                            <RefreshCw className={`w-3.5 h-3.5 ${predictionsLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Summary row */}
                                {predictions?.summary && (
                                    <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                                        {[
                                            { label: 'Urgent Restock', value: predictions.summary.urgentRestock ?? 0, bg: 'bg-red-50',    text: 'text-red-600',     dot: 'bg-red-500'    },
                                            { label: 'At Risk',        value: predictions.summary.atRisk        ?? 0, bg: 'bg-amber-50',  text: 'text-amber-600',   dot: 'bg-amber-400'  },
                                            { label: 'Stable',         value: predictions.summary.stable        ?? 0, bg: 'bg-emerald-50',text: 'text-emerald-600', dot: 'bg-emerald-500'},
                                        ].map(({ label, value, bg, text, dot }) => (
                                            <div key={label} className={`${bg} px-5 py-3 flex items-center gap-3`}>
                                                <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
                                                <div>
                                                    <p className="text-xs text-slate-500">{label}</p>
                                                    <p className={`text-xl font-bold ${text}`}>{value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="p-5">
                                    {predictionsLoading && (
                                        <div className="flex items-center justify-center py-14 gap-3">
                                            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                                            <span className="text-sm text-slate-400">Analysing inventory patterns&#8230;</span>
                                        </div>
                                    )}

                                    {!predictionsLoading && (!predictions?.predictions || predictions.predictions.length === 0) && (
                                        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
                                            <div className="p-3 bg-slate-100 rounded-full">
                                                <TrendingUp className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-600">No prediction data available</p>
                                            <p className="text-xs text-slate-400 max-w-xs">Add medicines and record transactions to enable AI stock forecasting.</p>
                                            <button onClick={fetchPredictions} className="mt-1 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition">Retry</button>
                                        </div>
                                    )}

                                    {!predictionsLoading && predictions?.predictions && predictions.predictions.length > 0 && (
                                        <div className="space-y-5">
                                            <div>
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Select Medicine</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {predictions.predictions.map((pred, i) => {
                                                        const urgent = pred.daysUntilStockout <= 3;
                                                        const atRisk = pred.daysUntilStockout <= 7 && !urgent;
                                                        return (
                                                            <button
                                                                key={i}
                                                                onClick={() => setSelectedPrediction(pred)}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                                                    selectedPrediction?.medicineName === pred.medicineName
                                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                                                }`}
                                                            >
                                                                {urgent && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                                                                {atRisk && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                                                                {pred.medicineName}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {selectedPrediction && (() => {
                                                const pts = selectedPrediction.predictions?.slice(0, 7) || [];
                                                const urgent = selectedPrediction.daysUntilStockout <= 3;
                                                const atRisk = !urgent && selectedPrediction.daysUntilStockout <= 7;
                                                const statusColor = urgent ? '#dc2626' : atRisk ? '#d97706' : '#059669';
                                                const statusLabel = urgent ? 'Urgent Restock' : atRisk ? 'At Risk' : 'Stable';
                                                const statusBg = urgent ? 'bg-red-50 text-red-600 border-red-200' : atRisk ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200';
                                                const W = 600, H = 180, PL = 40, PR = 16, PT = 24, PB = 8;
                                                const chartW = W - PL - PR, chartH = H - PT - PB;
                                                const maxV = Math.max(...pts.map(d => d.predictedStock), selectedPrediction.currentStock || 0, 1);
                                                const minV = Math.max(0, Math.min(...pts.map(d => d.predictedStock)) - 5);
                                                const range = maxV - minV || 1;
                                                const toX = i2 => PL + (i2 / Math.max(pts.length - 1, 1)) * chartW;
                                                const toY = v => PT + chartH * (1 - (v - minV) / range);
                                                const points = pts.map((d, i2) => ({ x: toX(i2), y: toY(d.predictedStock), val: d.predictedStock }));
                                                const linePath = points.map((p, i2) => `${i2 === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
                                                const fillPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${(PT + chartH).toFixed(1)} L${PL},${(PT + chartH).toFixed(1)} Z`;
                                                const threshold = 50;
                                                const threshY = toY(threshold);
                                                const trendVal = selectedPrediction.trendAnalysis;
                                                const trendLabel = trendVal === 'increasing' ? 'Up' : trendVal === 'decreasing' ? 'Down' : 'Stable';
                                                const trendColor = trendVal === 'increasing' ? 'text-emerald-600' : trendVal === 'decreasing' ? 'text-red-600' : 'text-slate-500';
                                                const trendArrow = trendVal === 'increasing' ? '\u2191' : trendVal === 'decreasing' ? '\u2193' : '\u2192';
                                                return (
                                                    <div className="rounded-2xl border border-slate-200 overflow-hidden">
                                                        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100">
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900">{selectedPrediction.medicineName}</p>
                                                                <p className="text-xs text-slate-400">Current stock: <span className="font-semibold text-slate-600">{selectedPrediction.currentStock ?? '\u2014'} units</span></p>
                                                            </div>
                                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusBg}`}>{statusLabel}</span>
                                                        </div>

                                                        <div className="px-4 pt-4 pb-1 bg-white">
                                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">7-Day Stock Forecast</p>
                                                            {pts.length ? (
                                                                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                                                                    <defs>
                                                                        <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                                                                            <stop offset="0%" stopColor={statusColor} stopOpacity="0.18" />
                                                                            <stop offset="100%" stopColor={statusColor} stopOpacity="0.02" />
                                                                        </linearGradient>
                                                                    </defs>
                                                                    {[0, 0.25, 0.5, 0.75, 1].map(t => {
                                                                        const gy = PT + chartH * t;
                                                                        const gv = Math.round(maxV - range * t);
                                                                        return (
                                                                            <g key={t}>
                                                                                <line x1={PL} y1={gy} x2={W - PR} y2={gy} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 3" />
                                                                                <text x={PL - 6} y={gy + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{gv}</text>
                                                                            </g>
                                                                        );
                                                                    })}
                                                                    {threshold >= minV && threshold <= maxV && (
                                                                        <g>
                                                                            <line x1={PL} y1={threshY} x2={W - PR} y2={threshY} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 3" />
                                                                            <text x={W - PR + 3} y={threshY + 4} fontSize="9" fill="#d97706" fontWeight="600">Low</text>
                                                                        </g>
                                                                    )}
                                                                    <path d={fillPath} fill="url(#predGrad)" />
                                                                    <path d={linePath} fill="none" stroke={statusColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    {points.map((p, i2) => (
                                                                        <g key={i2}>
                                                                            <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={statusColor} strokeWidth="2" />
                                                                            <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="10" fill="#475569" fontWeight="700">{p.val}</text>
                                                                        </g>
                                                                    ))}
                                                                </svg>
                                                            ) : (
                                                                <p className="text-xs text-slate-400 text-center py-8">No forecast data for this medicine</p>
                                                            )}
                                                            <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-0.5 mb-2" style={{ paddingLeft: `${PL}px`, paddingRight: `${PR}px` }}>
                                                                {pts.map((d, i2) => (
                                                                    <span key={i2}>{new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border-t border-slate-100">
                                                            {[
                                                                { label: 'Avg Daily Demand', value: selectedPrediction.averageDailyDemand?.toFixed(1) ?? '0', sub: 'units/day', color: 'text-blue-600' },
                                                                { label: 'Days to Stockout', value: selectedPrediction.daysUntilStockout > 30 ? '30+' : (selectedPrediction.daysUntilStockout ?? '\u2014'), sub: 'days remaining', color: urgent ? 'text-red-600' : atRisk ? 'text-amber-600' : 'text-emerald-600' },
                                                                { label: 'Trend', value: `${trendArrow} ${trendLabel}`, sub: 'demand trend', color: trendColor },
                                                                { label: 'Algorithm', value: 'Linear Reg.', sub: 'forecast model', color: 'text-violet-600' },
                                                            ].map(({ label, value, sub, color }) => (
                                                                <div key={label} className="px-5 py-3 bg-white text-center">
                                                                    <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                                                                    <p className={`text-base font-bold ${color} leading-tight`}>{value}</p>
                                                                    <p className="text-[10px] text-slate-300 mt-0.5">{sub}</p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {selectedPrediction.restockRecommendation && (
                                                            <div className={`px-5 py-2.5 text-xs font-medium border-t ${urgent ? 'bg-red-50 text-red-700 border-red-100' : atRisk ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                                                {selectedPrediction.restockRecommendation}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── INVENTORY TAB ─── */}
                    {activeTab === 'inventory' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900">Medicine Inventory</h2>
                                <div className="flex gap-2">
                                    <button onClick={() => { resetIssueForm(); setShowIssueModal(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-all">
                                        <Send className="w-3.5 h-3.5" /><span>Issue</span>
                                    </button>
                                    <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all">
                                        <Plus className="w-3.5 h-3.5" /><span>Add Medicine</span>
                                    </button>
                                </div>
                            </div>

                            {loading && medicines.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                    <p className="text-sm text-slate-400">Loading inventory&#8230;</p>
                                </div>
                            ) : medicines.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                                    <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-4"><Package className="w-8 h-8 text-slate-400" /></div>
                                    <p className="text-base font-semibold text-slate-700 mb-1">No medicines found</p>
                                    <p className="text-sm text-slate-400 mb-5">Add your first medicine to start tracking inventory</p>
                                    <button onClick={() => setShowAddModal(true)} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all">Add First Medicine</button>
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                    <th className="px-5 py-3.5 text-left">Medicine</th>
                                                    <th className="px-5 py-3.5 text-left hidden sm:table-cell">Category</th>
                                                    <th className="px-5 py-3.5 text-left">Stock</th>
                                                    <th className="px-5 py-3.5 text-left hidden md:table-cell">Price</th>
                                                    <th className="px-5 py-3.5 text-left hidden lg:table-cell">Expiry</th>
                                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {medicines.map((medicine) => (
                                                    <tr key={medicine.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-5 py-3.5">
                                                            <p className="font-medium text-slate-900">{medicine.name}</p>
                                                            {medicine.description && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{medicine.description}</p>}
                                                        </td>
                                                        <td className="px-5 py-3.5 hidden sm:table-cell">
                                                            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">{medicine.category || 'General'}</span>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stockBadge(medicine.quantity)}`}>{medicine.quantity} units</span>
                                                        </td>
                                                        <td className="px-5 py-3.5 hidden md:table-cell font-medium text-slate-900">&#8377;{medicine.price || 0}</td>
                                                        <td className="px-5 py-3.5 hidden lg:table-cell text-slate-500 text-xs">{medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString('en-GB') : '&#8212;'}</td>
                                                        <td className="px-5 py-3.5 text-right">
                                                            <div className="flex items-center justify-end gap-3">
                                                                <button onClick={() => openIssueModal(medicine)} disabled={medicine.quantity === 0} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition">Issue</button>
                                                                <button onClick={() => openEditModal(medicine)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition">Edit</button>
                                                                <button onClick={() => handleRemoveMedicine(medicine.id, medicine.name)} className="text-xs font-semibold text-red-500 hover:text-red-600 transition">Remove</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── TRANSACTIONS TAB ─── */}
                    {activeTab === 'transactions' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-slate-900">Transaction History</h2>

                            {loading && transactions.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                    <p className="text-sm text-slate-400">Loading transactions&#8230;</p>
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                                    <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-4"><ArrowLeftRight className="w-8 h-8 text-slate-400" /></div>
                                    <p className="text-base font-semibold text-slate-700 mb-1">No transactions yet</p>
                                    <p className="text-sm text-slate-400">Transaction history will appear here once medicines are issued or updated</p>
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                    <th className="px-5 py-3.5 text-left">Date</th>
                                                    <th className="px-5 py-3.5 text-left">Type</th>
                                                    <th className="px-5 py-3.5 text-left">Medicine</th>
                                                    <th className="px-5 py-3.5 text-left hidden sm:table-cell">Qty</th>
                                                    <th className="px-5 py-3.5 text-left hidden md:table-cell">Amount</th>
                                                    <th className="px-5 py-3.5 text-left hidden lg:table-cell">Patient</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {transactions.map((txn) => (
                                                    <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                                                            {new Date(txn.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeBadge(txn.type)}`}>{txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}</span>
                                                        </td>
                                                        <td className="px-5 py-3.5 font-medium text-slate-900">{txn.medicineName}</td>
                                                        <td className="px-5 py-3.5 text-slate-600 hidden sm:table-cell">{txn.quantity}</td>
                                                        <td className="px-5 py-3.5 font-medium text-slate-900 hidden md:table-cell">&#8377;{txn.totalAmount?.toFixed(2) || '0.00'}</td>
                                                        <td className="px-5 py-3.5 text-slate-500 hidden lg:table-cell">{txn.patientName || '&#8212;'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── REPORTS TAB ─── */}
                    {activeTab === 'reports' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900">Reports</h2>
                                <button onClick={() => setShowReportModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all">
                                    <Plus className="w-3.5 h-3.5" /><span>Generate Report</span>
                                </button>
                            </div>

                            {loading && reports.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                    <p className="text-sm text-slate-400">Loading reports&#8230;</p>
                                </div>
                            ) : reports.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                                    <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-4"><FileText className="w-8 h-8 text-slate-400" /></div>
                                    <p className="text-base font-semibold text-slate-700 mb-1">No reports yet</p>
                                    <p className="text-sm text-slate-400 mb-5">Generate your first report to get started</p>
                                    <button onClick={() => setShowReportModal(true)} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all">Generate First Report</button>
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                    <th className="px-5 py-3.5 text-left">Report</th>
                                                    <th className="px-5 py-3.5 text-left hidden sm:table-cell">Type</th>
                                                    <th className="px-5 py-3.5 text-left hidden md:table-cell">Generated</th>
                                                    <th className="px-5 py-3.5 text-left hidden lg:table-cell">Size</th>
                                                    <th className="px-5 py-3.5 text-left">Status</th>
                                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {reports.map((report) => (
                                                    <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-blue-50 rounded-lg shrink-0"><FileText className="w-4 h-4 text-blue-500" /></div>
                                                                <div>
                                                                    <p className="font-medium text-slate-900">{report.title}</p>
                                                                    {report.description && <p className="text-xs text-slate-400 mt-0.5">{report.description}</p>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5 hidden sm:table-cell">
                                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                                                report.reportType === 'inventory' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                                report.reportType === 'transaction' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                                'bg-violet-50 text-violet-600 border-violet-200'
                                                            }`}>{report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)}</span>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-slate-500 text-xs hidden md:table-cell">{new Date(report.generatedAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                        <td className="px-5 py-3.5 text-slate-500 text-xs hidden lg:table-cell">{formatFileSize(report.fileSize)}</td>
                                                        <td className="px-5 py-3.5">
                                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                                                report.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                                report.status === 'generating' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                                'bg-red-50 text-red-600 border-red-200'
                                                            }`}>{report.status.charAt(0).toUpperCase() + report.status.slice(1)}</span>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-right">
                                                            <div className="flex items-center justify-end gap-3">
                                                                {report.status === 'completed' && (
                                                                    <button onClick={() => handleDownloadReport(report.id)} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition">
                                                                        <Download className="w-3.5 h-3.5" /><span>Download</span>
                                                                    </button>
                                                                )}
                                                                <button onClick={() => handleDeleteReport(report.id, report.title)} className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 transition">
                                                                    <Trash2 className="w-3.5 h-3.5" /><span>Delete</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── SETTINGS TAB ─── */}
                    {activeTab === 'personal-details' && (
                        <div className="space-y-6">
                            {/* Profile card */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                                <div className="flex items-center gap-4 pb-5 mb-5 border-b border-slate-100">
                                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0">
                                        {user?.fullName?.charAt(0)?.toUpperCase() || 'P'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-semibold text-slate-900 truncate">{user?.fullName || profileForm.name || 'Pharmacist'}</p>
                                        <p className="text-sm text-slate-400 truncate">{user?.email || ''}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs text-slate-400">Pharmacist ID</p>
                                        <p className="text-sm font-mono font-bold text-blue-600">#{user?.userId || 'N/A'}</p>
                                    </div>
                                </div>

                                <h3 className="text-sm font-semibold text-slate-900 mb-4">Profile Information</h3>
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Full Name</label>
                                            <input type="text" required value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className={inputCls} placeholder="Enter your name" />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Gender</label>
                                            <select value={profileForm.gender} onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})} className={inputCls}>
                                                <option value="">Select gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Phone</label>
                                            <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} className={inputCls} placeholder="Enter phone number" />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={loading} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all">
                                        {loading ? 'Saving&#8230;' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>

                            {/* Password card */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-slate-900 mb-4">Change Password</h3>
                                <form onSubmit={handleUpdatePassword} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className={labelCls}>Current Password</label>
                                            <input type="password" required value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className={inputCls} placeholder="Current password" />
                                        </div>
                                        <div>
                                            <label className={labelCls}>New Password</label>
                                            <input type="password" required value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} className={inputCls} placeholder="New password" />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Confirm Password</label>
                                            <input type="password" required value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className={inputCls} placeholder="Confirm password" />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={loading} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all">
                                        {loading ? 'Updating&#8230;' : 'Update Password'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    </div>
                </main>

                {/* ─── Add Medicine Modal ─── */}
                {showAddModal && (
                    <Modal title="Add New Medicine" onClose={() => { setShowAddModal(false); resetMedicineForm(); }} size="lg">
                        <form onSubmit={handleAddMedicine} className="p-6 space-y-4">
                            <div>
                                <label className={labelCls}>Medicine Name *</label>
                                <input type="text" required value={medicineForm.name} onChange={(e) => setMedicineForm({...medicineForm, name: e.target.value})} className={inputCls} placeholder="e.g., Paracetamol 500mg" />
                            </div>
                            <div>
                                <label className={labelCls}>Description</label>
                                <textarea value={medicineForm.description} onChange={(e) => setMedicineForm({...medicineForm, description: e.target.value})} className={inputCls} rows="2" placeholder="Brief description" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Category</label>
                                    <select value={medicineForm.category} onChange={(e) => setMedicineForm({...medicineForm, category: e.target.value})} className={inputCls}>
                                        <option value="">Select category</option>
                                        <option>Antibiotic</option><option>Painkiller</option><option>Vitamin</option>
                                        <option>Antacid</option><option>Antihistamine</option><option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Quantity *</label>
                                    <input type="number" required min="0" value={medicineForm.quantity} onChange={(e) => setMedicineForm({...medicineForm, quantity: e.target.value})} className={inputCls} placeholder="0" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Price (&#8377;)</label>
                                    <input type="number" min="0" step="0.01" value={medicineForm.price} onChange={(e) => setMedicineForm({...medicineForm, price: e.target.value})} className={inputCls} placeholder="0.00" />
                                </div>
                                <div>
                                    <label className={labelCls}>Expiry Date</label>
                                    <input type="date" value={medicineForm.expiryDate} onChange={(e) => setMedicineForm({...medicineForm, expiryDate: e.target.value})} className={inputCls} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all">{loading ? 'Adding&#8230;' : 'Add Medicine'}</button>
                                <button type="button" onClick={() => { setShowAddModal(false); resetMedicineForm(); }} className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-all">Cancel</button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* ─── Edit Medicine Modal ─── */}
                {showEditModal && (
                    <Modal title="Edit Medicine" onClose={() => { setShowEditModal(false); resetMedicineForm(); }} size="lg">
                        <form onSubmit={handleUpdateMedicine} className="p-6 space-y-4">
                            <div>
                                <label className={labelCls}>Medicine Name *</label>
                                <input type="text" required value={medicineForm.name} onChange={(e) => setMedicineForm({...medicineForm, name: e.target.value})} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Description</label>
                                <textarea value={medicineForm.description} onChange={(e) => setMedicineForm({...medicineForm, description: e.target.value})} className={inputCls} rows="2" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Category</label>
                                    <select value={medicineForm.category} onChange={(e) => setMedicineForm({...medicineForm, category: e.target.value})} className={inputCls}>
                                        <option value="">Select category</option>
                                        <option>Antibiotic</option><option>Painkiller</option><option>Vitamin</option>
                                        <option>Antacid</option><option>Antihistamine</option><option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Quantity *</label>
                                    <input type="number" required min="0" value={medicineForm.quantity} onChange={(e) => setMedicineForm({...medicineForm, quantity: e.target.value})} className={inputCls} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Price (&#8377;)</label>
                                    <input type="number" min="0" step="0.01" value={medicineForm.price} onChange={(e) => setMedicineForm({...medicineForm, price: e.target.value})} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Expiry Date</label>
                                    <input type="date" value={medicineForm.expiryDate} onChange={(e) => setMedicineForm({...medicineForm, expiryDate: e.target.value})} className={inputCls} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all">{loading ? 'Updating&#8230;' : 'Update Medicine'}</button>
                                <button type="button" onClick={() => { setShowEditModal(false); resetMedicineForm(); }} className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-all">Cancel</button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* ─── Issue Medicine Modal ─── */}
                {showIssueModal && (
                    <Modal title="Issue Medicine" onClose={() => { setShowIssueModal(false); resetIssueForm(); }}>
                        <form onSubmit={handleIssueMedicine} className="p-6 space-y-4">
                            <div>
                                <label className={labelCls}>Select Medicine *</label>
                                <select required value={issueForm.medicineId} onChange={(e) => { const sel = medicines.find(m => m.id === e.target.value); setIssueForm({...issueForm, medicineId: e.target.value}); setSelectedMedicine(sel); }} className={inputCls}>
                                    <option value="">Choose a medicine&#8230;</option>
                                    {medicines.filter(m => m.quantity > 0).map((m) => (
                                        <option key={m.id} value={m.id}>{m.name} (Available: {m.quantity})</option>
                                    ))}
                                </select>
                            </div>
                            {selectedMedicine && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm">
                                    <p className="font-semibold text-blue-900">{selectedMedicine.name}</p>
                                    <p className="text-blue-600">Available: {selectedMedicine.quantity} units{selectedMedicine.category ? ` · ${selectedMedicine.category}` : ''}</p>
                                </div>
                            )}
                            <div>
                                <label className={labelCls}>Quantity *</label>
                                <input type="number" required min="1" max={selectedMedicine?.quantity} value={issueForm.quantity} onChange={(e) => setIssueForm({...issueForm, quantity: e.target.value})} className={inputCls} placeholder="Enter quantity" disabled={!issueForm.medicineId} />
                            </div>
                            <div>
                                <label className={labelCls}>Patient Code *</label>
                                <input type="text" required value={issueForm.patientName} onChange={(e) => setIssueForm({...issueForm, patientName: e.target.value})} className={inputCls} placeholder="Enter patient code" />
                            </div>
                            <div>
                                <label className={labelCls}>Notes</label>
                                <textarea value={issueForm.notes} onChange={(e) => setIssueForm({...issueForm, notes: e.target.value})} className={inputCls} rows="2" placeholder="Optional notes" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all">{loading ? 'Issuing&#8230;' : 'Issue Medicine'}</button>
                                <button type="button" onClick={() => { setShowIssueModal(false); resetIssueForm(); }} className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-all">Cancel</button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* ─── Generate Report Modal ─── */}
                {showReportModal && (
                    <Modal title="Generate Report" onClose={() => setShowReportModal(false)}>
                        <form onSubmit={handleGenerateReport} className="p-6 space-y-4">
                            <div>
                                <label className={labelCls}>Report Type *</label>
                                <select required value={reportForm.reportType} onChange={(e) => setReportForm({...reportForm, reportType: e.target.value})} className={inputCls}>
                                    <option value="summary">Summary Report</option>
                                    <option value="inventory">Inventory Report</option>
                                    <option value="transaction">Transaction Report</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Report Title</label>
                                <input type="text" value={reportForm.title} onChange={(e) => setReportForm({...reportForm, title: e.target.value})} className={inputCls} placeholder="e.g., Monthly Inventory Report" />
                            </div>
                            <div>
                                <label className={labelCls}>Description</label>
                                <textarea value={reportForm.description} onChange={(e) => setReportForm({...reportForm, description: e.target.value})} className={inputCls} rows="2" placeholder="Brief description" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>From Date</label>
                                    <input type="date" value={reportForm.dateFrom} onChange={(e) => setReportForm({...reportForm, dateFrom: e.target.value})} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>To Date</label>
                                    <input type="date" value={reportForm.dateTo} onChange={(e) => setReportForm({...reportForm, dateTo: e.target.value})} className={inputCls} />
                                </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700">
                                The report will be generated as a PDF and stored securely. Download it anytime from the reports list.
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all">{loading ? 'Generating&#8230;' : 'Generate Report'}</button>
                                <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-all">Cancel</button>
                            </div>
                        </form>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default PharmacistDashboard;
