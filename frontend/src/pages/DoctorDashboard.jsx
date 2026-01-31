import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import authService from '../services/authService';
import { LayoutDashboard, Users, FileText, Pill, BarChart3, Settings, LogOut, Plus, Menu, X, Calendar, Clock, Download, Trash2 } from 'lucide-react';

const initialFormState = {
    fullname: '',
    email: '',
    password: '',
};

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Profile form states
    const [profileForm, setProfileForm] = useState({
        fullname: '',
        gender: '',
        phone: '',
        specialization: ''
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [profileErrors, setProfileErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});
    
    // Reports state
    const [reports, setReports] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportForm, setReportForm] = useState({
        reportType: 'summary',
        title: '',
        description: '',
        dateFrom: '',
        dateTo: ''
    });
    const [showPatientListModal, setShowPatientListModal] = useState(false);
    const [patientListForReport, setPatientListForReport] = useState([]);
    
    // Prescription state
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [prescriptionForm, setPrescriptionForm] = useState({
        patientId: '',
        patientName: '',
        diagnosis: '',
        medicines: [{
            name: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: ''
        }],
        additionalNotes: ''
    });
    const [prescriptionErrors, setPrescriptionErrors] = useState({});
    const [showPrescriptionHistoryModal, setShowPrescriptionHistoryModal] = useState(false);
    const [prescriptionHistory, setPrescriptionHistory] = useState([]);
    const [selectedPatientForHistory, setSelectedPatientForHistory] = useState('');
    const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
    
    // Appointment state
    const [appointments, setAppointments] = useState([]);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [appointmentForm, setAppointmentForm] = useState({
        patientId: '',
        patientName: '',
        appointmentDate: '',
        appointmentTime: '',
        notes: ''
    });
    const [appointmentErrors, setAppointmentErrors] = useState({});
    const [appointmentFilter, setAppointmentFilter] = useState('all'); // all, today, upcoming, past

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'doctor') {
            navigate('/sign-in');
            return;
        }
        setUser(currentUser);
        loadPatients();
        loadProfile();
        loadReports();
        loadAppointments();
    }, [navigate]);

    const loadPatients = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await doctorAPI.getMyPatients();
            setPatients(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error('Error loading patients:', err);
            setError(err.message || 'Failed to load patients');
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const loadProfile = async () => {
        try {
            const response = await doctorAPI.getProfile();
            if (response.success && response.profile) {
                setProfileForm({
                    fullname: response.profile.fullname || '',
                    gender: response.profile.gender || '',
                    phone: response.profile.phone || '',
                    specialization: response.profile.specialization || ''
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const loadReports = () => {
        const savedReports = localStorage.getItem('doctorReports');
        if (savedReports) {
            setReports(JSON.parse(savedReports));
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/sign-in');
    };

    const openAddPatientModal = () => {
        setFormData(initialFormState);
        setFormErrors({});
        setError('');
        setSuccessMessage('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData(initialFormState);
        setFormErrors({});
        setError('');
        setSuccessMessage('');
        setIsSubmitting(false);
    };

    const handleInputChange = ({ target: { name, value } }) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.fullname.trim()) {
            errors.fullname = 'Full name is required';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errors.email = 'Enter a valid email address';
        }
        if (!formData.password.trim() || formData.password.trim().length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            await doctorAPI.addPatient(
                formData.fullname.trim(),
                formData.email.trim(),
                formData.password.trim()
            );
            setSuccessMessage('Patient added successfully!');
            setFormData(initialFormState);
            await loadPatients();

            setTimeout(() => {
                closeModal();
            }, 1500);
        } catch (submissionError) {
            console.error('Error adding patient:', submissionError);
            setError(submissionError.message || 'Failed to add patient. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemovePatient = async (patientId) => {
        if (!window.confirm('Are you sure you want to remove this patient?')) {
            return;
        }

        setError('');
        setSuccessMessage('');
        setLoading(true);
        try {
            await doctorAPI.removePatient(patientId);
            await loadPatients();
            setSuccessMessage('Patient removed successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (removeError) {
            console.error('Error removing patient:', removeError);
            setError(removeError.message || 'Failed to remove patient');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileInputChange = ({ target: { name, value } }) => {
        setProfileForm((prev) => ({ ...prev, [name]: value }));
        if (profileErrors[name]) {
            setProfileErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handlePasswordInputChange = ({ target: { name, value } }) => {
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
        if (passwordErrors[name]) {
            setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const errors = {};
        
        if (!profileForm.fullname.trim()) {
            errors.fullname = 'Full name is required';
        }

        setProfileErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await doctorAPI.updateProfile(profileForm);
            if (response.success) {
                setSuccessMessage('Profile updated successfully!');
                await loadProfile();
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setError(error.message || 'Failed to update profile');
            setTimeout(() => setError(''), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        const errors = {};
        
        if (!passwordForm.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }
        if (!passwordForm.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordForm.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setPasswordErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await doctorAPI.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            
            if (response.success) {
                setSuccessMessage('Password changed successfully!');
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Password change error:', error);
            setError(error.message || 'Failed to change password');
            setTimeout(() => setError(''), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateReport = async (e) => {
        e.preventDefault();
        
        // If it's a patient list report, fetch the actual patient data
        if (reportForm.reportType === 'patientList') {
            try {
                setLoading(true);
                const response = await doctorAPI.getMyPatients();
                const patientData = Array.isArray(response) ? response : [];
                
                const newReport = {
                    id: Date.now(),
                    ...reportForm,
                    title: reportForm.title || 'Patient List Report',
                    status: 'completed',
                    generatedAt: new Date().toISOString(),
                    fileSize: Math.floor(JSON.stringify(patientData).length * 1.5),
                    patientData: patientData
                };
                
                const updatedReports = [newReport, ...reports];
                setReports(updatedReports);
                localStorage.setItem('doctorReports', JSON.stringify(updatedReports));
                setShowReportModal(false);
                setReportForm({
                    reportType: 'summary',
                    title: '',
                    description: '',
                    dateFrom: '',
                    dateTo: ''
                });
                setSuccessMessage('Patient list report generated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (err) {
                console.error('Error generating patient list report:', err);
                setError(err.message || 'Failed to generate patient list report');
                setTimeout(() => setError(''), 3000);
            } finally {
                setLoading(false);
            }
        } else {
            const newReport = {
                id: Date.now(),
                ...reportForm,
                title: reportForm.title || `${reportForm.reportType.charAt(0).toUpperCase() + reportForm.reportType.slice(1)} Report`,
                status: 'completed',
                generatedAt: new Date().toISOString(),
                fileSize: Math.floor(Math.random() * 500000) + 100000
            };
            const updatedReports = [newReport, ...reports];
            setReports(updatedReports);
            localStorage.setItem('doctorReports', JSON.stringify(updatedReports));
            setShowReportModal(false);
            setReportForm({
                reportType: 'summary',
                title: '',
                description: '',
                dateFrom: '',
                dateTo: ''
            });
            setSuccessMessage('Report generated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const handleDeleteReport = (reportId) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            const updatedReports = reports.filter(r => r.id !== reportId);
            setReports(updatedReports);
            localStorage.setItem('doctorReports', JSON.stringify(updatedReports));
            setSuccessMessage('Report deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleViewPatientList = (report) => {
        if (report.patientData) {
            setPatientListForReport(report.patientData);
            setShowPatientListModal(true);
        }
    };

    const handleDownloadPatientList = (report) => {
        if (report.patientData) {
            const csvContent = generatePatientListCSV(report.patientData);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `patient-list-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const generatePatientListCSV = (patients) => {
        const headers = ['Name', 'Email', 'Patient ID', 'Date Added'];
        const rows = patients.map(p => [
            p.name || 'N/A',
            p.email || 'N/A',
            p._id || 'N/A',
            p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'
        ]);
        
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });
        
        return csv;
    };

    const handleOpenPrescriptionModal = () => {
        setPrescriptionForm({
            patientId: '',
            patientName: '',
            diagnosis: '',
            medicines: [{
                name: '',
                dosage: '',
                frequency: '',
                duration: '',
                instructions: ''
            }],
            additionalNotes: ''
        });
        setPrescriptionErrors({});
        setShowPrescriptionModal(true);
    };

    const handleClosePrescriptionModal = () => {
        setShowPrescriptionModal(false);
        setPrescriptionForm({
            patientId: '',
            patientName: '',
            diagnosis: '',
            medicines: [{
                name: '',
                dosage: '',
                frequency: '',
                duration: '',
                instructions: ''
            }],
            additionalNotes: ''
        });
        setPrescriptionErrors({});
    };

    const handlePrescriptionInputChange = (e) => {
        const { name, value } = e.target;
        setPrescriptionForm(prev => ({
            ...prev,
            [name]: value
        }));
        if (prescriptionErrors[name]) {
            setPrescriptionErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePatientSelect = (e) => {
        const patientId = e.target.value;
        const selectedPatient = patients.find(p => p._id === patientId);
        setPrescriptionForm(prev => ({
            ...prev,
            patientId: patientId,
            patientName: selectedPatient ? selectedPatient.name : ''
        }));
        if (prescriptionErrors.patientId) {
            setPrescriptionErrors(prev => ({ ...prev, patientId: '' }));
        }
    };

    const handleMedicineChange = (index, field, value) => {
        const updatedMedicines = [...prescriptionForm.medicines];
        updatedMedicines[index][field] = value;
        setPrescriptionForm(prev => ({
            ...prev,
            medicines: updatedMedicines
        }));
    };

    const handleAddMedicine = () => {
        setPrescriptionForm(prev => ({
            ...prev,
            medicines: [...prev.medicines, {
                name: '',
                dosage: '',
                frequency: '',
                duration: '',
                instructions: ''
            }]
        }));
    };

    const handleRemoveMedicine = (index) => {
        if (prescriptionForm.medicines.length > 1) {
            const updatedMedicines = prescriptionForm.medicines.filter((_, i) => i !== index);
            setPrescriptionForm(prev => ({
                ...prev,
                medicines: updatedMedicines
            }));
        }
    };

    const validatePrescriptionForm = () => {
        const errors = {};
        
        if (!prescriptionForm.patientId) {
            errors.patientId = 'Please select a patient';
        }
        
        if (!prescriptionForm.diagnosis.trim()) {
            errors.diagnosis = 'Diagnosis is required';
        }
        
        prescriptionForm.medicines.forEach((med, index) => {
            if (!med.name.trim()) {
                errors[`medicine_${index}_name`] = 'Medicine name is required';
            }
            if (!med.dosage.trim()) {
                errors[`medicine_${index}_dosage`] = 'Dosage is required';
            }
            if (!med.frequency.trim()) {
                errors[`medicine_${index}_frequency`] = 'Frequency is required';
            }
            if (!med.duration.trim()) {
                errors[`medicine_${index}_duration`] = 'Duration is required';
            }
        });
        
        setPrescriptionErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitPrescription = async (e) => {
        e.preventDefault();
        
        if (!validatePrescriptionForm()) {
            return;
        }
        
        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');
        
        try {
            // For now, save to localStorage (can be updated to API call later)
            const prescription = {
                id: Date.now(),
                ...prescriptionForm,
                doctorId: user?.id,
                doctorName: user?.fullName || profileForm.fullname,
                createdAt: new Date().toISOString()
            };
            
            const savedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
            savedPrescriptions.push(prescription);
            localStorage.setItem('prescriptions', JSON.stringify(savedPrescriptions));
            
            setSuccessMessage('Prescription created successfully!');
            setTimeout(() => {
                handleClosePrescriptionModal();
                setSuccessMessage('');
            }, 2000);
        } catch (err) {
            console.error('Error creating prescription:', err);
            setError(err.message || 'Failed to create prescription');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenPrescriptionHistory = () => {
        const savedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
        const doctorPrescriptions = savedPrescriptions.filter(p => p.doctorId === user?.id);
        setPrescriptionHistory(doctorPrescriptions);
        setFilteredPrescriptions(doctorPrescriptions);
        setSelectedPatientForHistory('');
        setShowPrescriptionHistoryModal(true);
    };

    const handleClosePrescriptionHistory = () => {
        setShowPrescriptionHistoryModal(false);
        setSelectedPatientForHistory('');
        setFilteredPrescriptions([]);
    };

    const handlePatientFilterChange = (e) => {
        const patientId = e.target.value;
        setSelectedPatientForHistory(patientId);
        
        if (patientId === '') {
            setFilteredPrescriptions(prescriptionHistory);
        } else {
            const filtered = prescriptionHistory.filter(p => p.patientId === patientId);
            setFilteredPrescriptions(filtered);
        }
    };

    const handleDeletePrescription = (prescriptionId) => {
        if (window.confirm('Are you sure you want to delete this prescription?')) {
            const savedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
            const updatedPrescriptions = savedPrescriptions.filter(p => p.id !== prescriptionId);
            localStorage.setItem('prescriptions', JSON.stringify(updatedPrescriptions));
            
            const doctorPrescriptions = updatedPrescriptions.filter(p => p.doctorId === user?.id);
            setPrescriptionHistory(doctorPrescriptions);
            
            if (selectedPatientForHistory) {
                const filtered = doctorPrescriptions.filter(p => p.patientId === selectedPatientForHistory);
                setFilteredPrescriptions(filtered);
            } else {
                setFilteredPrescriptions(doctorPrescriptions);
            }
            
            setSuccessMessage('Prescription deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const loadAppointments = () => {
        const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        const doctorAppointments = savedAppointments.filter(a => a.doctorId === user?.id);
        setAppointments(doctorAppointments);
    };

    const handleOpenAppointmentModal = () => {
        setAppointmentForm({
            patientId: '',
            patientName: '',
            appointmentDate: '',
            appointmentTime: '',
            notes: ''
        });
        setAppointmentErrors({});
        setShowAppointmentModal(true);
    };

    const handleCloseAppointmentModal = () => {
        setShowAppointmentModal(false);
        setAppointmentForm({
            patientId: '',
            patientName: '',
            appointmentDate: '',
            appointmentTime: '',
            notes: ''
        });
        setAppointmentErrors({});
    };

    const handleAppointmentInputChange = (e) => {
        const { name, value } = e.target;
        setAppointmentForm(prev => ({
            ...prev,
            [name]: value
        }));
        if (appointmentErrors[name]) {
            setAppointmentErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAppointmentPatientSelect = (e) => {
        const patientId = e.target.value;
        const selectedPatient = patients.find(p => p._id === patientId);
        setAppointmentForm(prev => ({
            ...prev,
            patientId: patientId,
            patientName: selectedPatient ? selectedPatient.name : ''
        }));
        if (appointmentErrors.patientId) {
            setAppointmentErrors(prev => ({ ...prev, patientId: '' }));
        }
    };

    const validateAppointmentForm = () => {
        const errors = {};
        
        if (!appointmentForm.patientId) {
            errors.patientId = 'Please select a patient';
        }
        
        if (!appointmentForm.appointmentDate) {
            errors.appointmentDate = 'Appointment date is required';
        }
        
        if (!appointmentForm.appointmentTime) {
            errors.appointmentTime = 'Appointment time is required';
        }
        
        setAppointmentErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitAppointment = async (e) => {
        e.preventDefault();
        
        if (!validateAppointmentForm()) {
            return;
        }
        
        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');
        
        try {
            const appointment = {
                id: Date.now(),
                ...appointmentForm,
                doctorId: user?.id,
                doctorName: user?.fullName || profileForm.fullname,
                createdAt: new Date().toISOString()
            };
            
            const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            savedAppointments.push(appointment);
            localStorage.setItem('appointments', JSON.stringify(savedAppointments));
            
            loadAppointments();
            setSuccessMessage('Appointment scheduled successfully!');
            setTimeout(() => {
                handleCloseAppointmentModal();
                setSuccessMessage('');
            }, 2000);
        } catch (err) {
            console.error('Error creating appointment:', err);
            setError(err.message || 'Failed to schedule appointment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAppointment = (appointmentId) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            const updatedAppointments = savedAppointments.filter(a => a.id !== appointmentId);
            localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
            loadAppointments();
            setSuccessMessage('Appointment cancelled successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const getFilteredAppointments = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.appointmentDate);
            appointmentDate.setHours(0, 0, 0, 0);
            
            if (appointmentFilter === 'today') {
                return appointmentDate.getTime() === today.getTime();
            } else if (appointmentFilter === 'upcoming') {
                return appointmentDate >= today;
            } else if (appointmentFilter === 'past') {
                return appointmentDate < today;
            }
            return true; // 'all'
        }).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    };

    const getAppointmentStatus = (appointment) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const appointmentDate = new Date(appointment.appointmentDate);
        appointmentDate.setHours(0, 0, 0, 0);
        
        if (appointmentDate.getTime() === today.getTime()) {
            return { label: 'Today', color: 'bg-green-100 text-green-700' };
        } else if (appointmentDate > today) {
            return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' };
        } else {
            return { label: 'Past', color: 'bg-gray-100 text-gray-700' };
        }
    };

    const sidebarItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'patients', icon: Users, label: 'Patients' },
        { id: 'appointments', icon: Calendar, label: 'Appointments' },
        { id: 'prescriptions', icon: Pill, label: 'Prescriptions' },
        { id: 'reports', icon: BarChart3, label: 'Reports' },
        { id: 'settings', icon: Settings, label: 'Settings' }
    ];

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

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
                                    setActiveSection(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                    activeSection === item.id
                                        ? 'bg-emerald-50 text-emerald-600'
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
            <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
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

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {/* Success/Error Messages */}
                    {successMessage && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            {successMessage}
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {activeSection === 'dashboard' && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Patients</p>
                                            <p className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-2">{patients.length}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                            <Users className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Appointments</p>
                                            <p className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-2">0</p>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Prescriptions</p>
                                            <p className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-2">0</p>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                            <Pill className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
                                            <p className="text-2xl sm:text-3xl font-semibold text-amber-600 mt-2">0</p>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {/* Recent Patients */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
                                        <button 
                                            onClick={() => setActiveSection('patients')}
                                            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                        >
                                            View All
                                        </button>
                                    </div>
                                    {patients.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">No patients yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {patients.slice(0, 5).map((patient) => (
                                                <div key={patient._id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-white">
                                                            {patient.fullname?.charAt(0).toUpperCase() || 'P'}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{patient.fullname || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-500 truncate">{patient.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Today's Schedule */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="text-center py-8">
                                        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">No appointments scheduled</p>
                                        <button className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                                            + Add Appointment
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <button 
                                        onClick={openAddPatientModal}
                                        className="p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors text-center"
                                    >
                                        <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                                        <span className="text-sm font-medium text-emerald-700">Add Patient</span>
                                    </button>
                                    <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
                                        <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                        <span className="text-sm font-medium text-blue-700">Schedule</span>
                                    </button>
                                    <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
                                        <Pill className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                        <span className="text-sm font-medium text-purple-700">Prescribe</span>
                                    </button>
                                    <button 
                                        onClick={() => setShowReportModal(true)}
                                        className="p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors text-center"
                                    >
                                        <FileText className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                                        <span className="text-sm font-medium text-amber-700">Report</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'patients' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Patient Records</h2>
                                <button 
                                    onClick={openAddPatientModal}
                                    className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Add Patient</span>
                                </button>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200">
                                {loading && (
                                    <div className="text-center py-12">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                                        <p className="mt-4 text-gray-600">Loading patients...</p>
                                    </div>
                                )}

                                {!loading && patients.length === 0 && (
                                    <div className="text-center py-12 px-4">
                                        <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Patients Yet</h3>
                                        <p className="text-gray-500 mb-4">Start by adding your first patient</p>
                                        <button
                                            onClick={openAddPatientModal}
                                            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                                        >
                                            Add Your First Patient
                                        </button>
                                    </div>
                                )}

                                {!loading && patients.length > 0 && (
                                    <div className="divide-y divide-gray-200">
                                        {patients.map((patient) => (
                                            <div key={patient._id} className="px-4 sm:px-6 py-4 hover:bg-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                                                                <span className="text-sm font-medium text-white">
                                                                    {patient.fullname?.charAt(0).toUpperCase() || 'P'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{patient.fullname || patient.name}</p>
                                                            <p className="text-sm text-gray-500 truncate">{patient.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                                        <button 
                                                            onClick={() => handleRemovePatient(patient._id)}
                                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                            title="Remove patient"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
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

                    {activeSection === 'appointments' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Appointments</h2>
                                <button 
                                    onClick={handleOpenAppointmentModal}
                                    className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Schedule Appointment</span>
                                </button>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-fit">
                                <button
                                    onClick={() => setAppointmentFilter('all')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        appointmentFilter === 'all'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    All ({appointments.length})
                                </button>
                                <button
                                    onClick={() => setAppointmentFilter('today')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        appointmentFilter === 'today'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => setAppointmentFilter('upcoming')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        appointmentFilter === 'upcoming'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Upcoming
                                </button>
                                <button
                                    onClick={() => setAppointmentFilter('past')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        appointmentFilter === 'past'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Past
                                </button>
                            </div>

                            {/* Appointments List */}
                            <div className="bg-white rounded-xl border border-gray-200">
                                {getFilteredAppointments().length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Appointments</h3>
                                        <p className="text-gray-500 mb-4">
                                            {appointmentFilter === 'all' 
                                                ? "You don't have any appointments scheduled"
                                                : `No ${appointmentFilter} appointments`}
                                        </p>
                                        <button
                                            onClick={handleOpenAppointmentModal}
                                            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                                        >
                                            Schedule Appointment
                                        </button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200">
                                        {getFilteredAppointments().map((appointment) => {
                                            const status = getAppointmentStatus(appointment);
                                            return (
                                                <div key={appointment.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start space-x-4 min-w-0 flex-1">
                                                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                <Calendar className="w-6 h-6 text-emerald-600" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-semibold text-gray-900">{appointment.patientName}</h4>
                                                                    <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                                                                        {status.label}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600">
                                                                    <div className="flex items-center space-x-1">
                                                                        <Calendar className="w-4 h-4" />
                                                                        <span>
                                                                            {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                                                                weekday: 'short',
                                                                                year: 'numeric',
                                                                                month: 'short',
                                                                                day: 'numeric'
                                                                            })}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-1">
                                                                        <Clock className="w-4 h-4" />
                                                                        <span>{appointment.appointmentTime}</span>
                                                                    </div>
                                                                </div>
                                                                {appointment.notes && (
                                                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                                                        <span className="font-medium">Notes:</span> {appointment.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteAppointment(appointment.id)}
                                                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                                                            title="Cancel appointment"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'prescriptions' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Prescriptions</h2>
                                <button 
                                    onClick={handleOpenPrescriptionModal}
                                    className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>New Prescription</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:border-emerald-200 transition-colors">
                                    <Pill className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                                    <h4 className="font-medium text-gray-900 mb-2">Create New Prescription</h4>
                                    <p className="text-sm text-gray-600 mb-4">Generate digital prescriptions for your patients</p>
                                    <button 
                                        onClick={handleOpenPrescriptionModal}
                                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700"
                                    >
                                        Create Prescription
                                    </button>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:border-gray-300 transition-colors">
                                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <h4 className="font-medium text-gray-900 mb-2">Prescription History</h4>
                                    <p className="text-sm text-gray-600 mb-4">View and manage past prescriptions</p>
                                    <button 
                                        onClick={handleOpenPrescriptionHistory}
                                        className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
                                    >
                                        View History
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'reports' && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* ...removed Reports heading... */}

                            {/* Report Generation Options - Always Visible */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 text-center hover:shadow-md transition-all">
                                        <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                                        <h4 className="font-medium text-gray-900 mb-2">Patient List</h4>
                                        <p className="text-sm text-gray-600 mb-4">Generate complete patient list</p>
                                        <button
                                            onClick={() => {
                                                setReportForm({
                                                    reportType: 'patientList',
                                                    title: 'Patient List Report',
                                                    description: 'Complete list of all patients',
                                                    dateFrom: '',
                                                    dateTo: ''
                                                });
                                                setShowReportModal(true);
                                            }}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium"
                                        >
                                            Generate Patient List
                                        </button>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-6 text-center hover:shadow-md transition-all">
                                        <BarChart3 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                                        <h4 className="font-medium text-gray-900 mb-2">Summary Report</h4>
                                        <p className="text-sm text-gray-600 mb-4">Generate summary statistics</p>
                                        <button
                                            onClick={() => {
                                                setReportForm({
                                                    reportType: 'summary',
                                                    title: 'Summary Report',
                                                    description: 'Overall summary report',
                                                    dateFrom: '',
                                                    dateTo: ''
                                                });
                                                setShowReportModal(true);
                                            }}
                                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors font-medium"
                                        >
                                            Generate Report
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Reports List */}
                            {reports.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200">
                                <div className="divide-y divide-gray-200">
                                        {reports.map((report) => (
                                            <div key={report.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3 min-w-0">
                                                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                            <FileText className="w-5 h-5 text-emerald-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(report.generatedAt).toLocaleDateString()} • {formatFileSize(report.fileSize)}
                                                                {report.reportType === 'patientList' && report.patientData && (
                                                                    <span className="ml-2 text-emerald-600">• {report.patientData.length} patients</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {report.reportType === 'patientList' && report.patientData && (
                                                            <button 
                                                                onClick={() => handleViewPatientList(report)}
                                                                className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                                title="View Patient List"
                                                            >
                                                                <Users className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => report.reportType === 'patientList' ? handleDownloadPatientList(report) : null}
                                                            className="text-emerald-600 hover:text-emerald-800 p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                                                            disabled={report.reportType !== 'patientList'}
                                                        >
                                                            <Download className="w-5 h-5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteReport(report.id)}
                                                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'settings' && (
                        <div className="space-y-4 sm:space-y-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h2>

                            {/* Profile Settings */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-xl font-bold text-emerald-600">
                                        {user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'D'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{user?.fullName || profileForm.fullname || 'Doctor'}</h3>
                                        <p className="text-sm text-gray-500">{user?.email || 'No email'}</p>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                name="fullname"
                                                value={profileForm.fullname}
                                                onChange={handleProfileInputChange}
                                                className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                                    profileErrors.fullname ? 'border-red-500' : ''
                                                }`}
                                                placeholder="Enter your name"
                                            />
                                            {profileErrors.fullname && (
                                                <p className="text-red-500 text-xs mt-1">{profileErrors.fullname}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                                            <input
                                                type="text"
                                                name="specialization"
                                                value={profileForm.specialization}
                                                onChange={handleProfileInputChange}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                                placeholder="Enter specialization"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                            <select
                                                name="gender"
                                                value={profileForm.gender}
                                                onChange={handleProfileInputChange}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                            >
                                                <option value="">Select gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={profileForm.phone}
                                                onChange={handleProfileInputChange}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>

                            {/* Password Change */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={passwordForm.currentPassword}
                                                onChange={handlePasswordInputChange}
                                                className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                                    passwordErrors.currentPassword ? 'border-red-500' : ''
                                                }`}
                                                placeholder="Current password"
                                            />
                                            {passwordErrors.currentPassword && (
                                                <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwordForm.newPassword}
                                                onChange={handlePasswordInputChange}
                                                className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                                    passwordErrors.newPassword ? 'border-red-500' : ''
                                                }`}
                                                placeholder="New password"
                                            />
                                            {passwordErrors.newPassword && (
                                                <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordForm.confirmPassword}
                                                onChange={handlePasswordInputChange}
                                                className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                                    passwordErrors.confirmPassword ? 'border-red-500' : ''
                                                }`}
                                                placeholder="Confirm password"
                                            />
                                            {passwordErrors.confirmPassword && (
                                                <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400"
                                    >
                                        {isSubmitting ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Add Patient Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Add New Patient</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        {successMessage && (
                            <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                                {successMessage}
                            </div>
                        )}
                        
                        {error && (
                            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                        formErrors.fullname ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder="Enter patient's full name"
                                />
                                {formErrors.fullname && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.fullname}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                        formErrors.email ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder="Enter email address"
                                />
                                {formErrors.email && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Temporary Password *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                        formErrors.password ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder="Enter temporary password"
                                />
                                {formErrors.password && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Adding...</span>
                                        </>
                                    ) : (
                                        <span>Add Patient</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Generate Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Generate Report</h3>
                            <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleGenerateReport} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type *</label>
                                <select
                                    required
                                    value={reportForm.reportType}
                                    onChange={(e) => setReportForm({...reportForm, reportType: e.target.value})}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                >
                                    <option value="summary">Summary Report</option>
                                    <option value="patients">Patients Report</option>
                                    <option value="patientList">Patient List (All Patients)</option>
                                    <option value="activity">Activity Report</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Report Title</label>
                                <input
                                    type="text"
                                    value={reportForm.title}
                                    onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                    placeholder="e.g., Monthly Summary Report"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={reportForm.description}
                                    onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                    placeholder="Brief description of the report"
                                    rows="2"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                    <input
                                        type="date"
                                        value={reportForm.dateFrom}
                                        onChange={(e) => setReportForm({...reportForm, dateFrom: e.target.value})}
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                    <input
                                        type="date"
                                        value={reportForm.dateTo}
                                        onChange={(e) => setReportForm({...reportForm, dateTo: e.target.value})}
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                <p className="text-sm text-emerald-700">
                                    <strong>Note:</strong> The report will be generated and stored locally. You can download or delete it anytime from the reports list.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
                                >
                                    Generate Report
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

            {/* Patient List Modal */}
            {showPatientListModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Patient List</h3>
                                <p className="text-sm text-gray-500 mt-1">Total Patients: {patientListForReport.length}</p>
                            </div>
                            <button 
                                onClick={() => setShowPatientListModal(false)} 
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            {patientListForReport.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-500">No patients found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Patient ID</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date Added</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {patientListForReport.map((patient, index) => (
                                                <tr key={patient._id || index} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-medium text-emerald-600">
                                                                {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                                                            </div>
                                                            <span className="font-medium text-gray-900">{patient.name || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600">{patient.email || 'N/A'}</td>
                                                    <td className="py-3 px-4">
                                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                                                            {patient._id?.slice(-8) || 'N/A'}
                                                        </code>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600">
                                                        {patient.createdAt 
                                                            ? new Date(patient.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })
                                                            : 'N/A'
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowPatientListModal(false)}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Prescription Modal */}
            {showPrescriptionModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-semibold text-gray-900">Create New Prescription</h3>
                            <button 
                                onClick={handleClosePrescriptionModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {successMessage && (
                            <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                                {successMessage}
                            </div>
                        )}

                        {error && (
                            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmitPrescription} className="p-6 space-y-6">
                            {/* Patient Selection */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                                    Patient Information
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Patient *
                                        </label>
                                        <select
                                            value={prescriptionForm.patientId}
                                            onChange={handlePatientSelect}
                                            className={`w-full px-4 py-2 border-2 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                                prescriptionErrors.patientId ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        >
                                            <option value="">-- Select Patient --</option>
                                            {patients.map(patient => (
                                                <option key={patient._id} value={patient._id}>
                                                    {patient.name} ({patient.email})
                                                </option>
                                            ))}
                                        </select>
                                        {prescriptionErrors.patientId && (
                                            <p className="text-red-500 text-xs mt-1">{prescriptionErrors.patientId}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Patient ID
                                        </label>
                                        <input
                                            type="text"
                                            value={prescriptionForm.patientId ? prescriptionForm.patientId.slice(-8) : ''}
                                            disabled
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                                            placeholder="Auto-filled"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Diagnosis */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Diagnosis *
                                </label>
                                <textarea
                                    name="diagnosis"
                                    value={prescriptionForm.diagnosis}
                                    onChange={handlePrescriptionInputChange}
                                    className={`w-full px-4 py-2 border-2 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                        prescriptionErrors.diagnosis ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    rows="3"
                                    placeholder="Enter diagnosis details"
                                />
                                {prescriptionErrors.diagnosis && (
                                    <p className="text-red-500 text-xs mt-1">{prescriptionErrors.diagnosis}</p>
                                )}
                            </div>

                            {/* Medicines */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-900 flex items-center">
                                        <Pill className="w-5 h-5 mr-2 text-emerald-600" />
                                        Medicines *
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={handleAddMedicine}
                                        className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Add Medicine</span>
                                    </button>
                                </div>

                                {prescriptionForm.medicines.map((medicine, index) => (
                                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h5 className="font-medium text-gray-700">Medicine {index + 1}</h5>
                                            {prescriptionForm.medicines.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMedicine(index)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Medicine Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={medicine.name}
                                                    onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                                                    className={`w-full px-3 py-2 border-2 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                                        prescriptionErrors[`medicine_${index}_name`] ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                                    placeholder="e.g., Amoxicillin"
                                                />
                                                {prescriptionErrors[`medicine_${index}_name`] && (
                                                    <p className="text-red-500 text-xs mt-1">{prescriptionErrors[`medicine_${index}_name`]}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Dosage *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={medicine.dosage}
                                                    onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                                                    className={`w-full px-3 py-2 border-2 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                                        prescriptionErrors[`medicine_${index}_dosage`] ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                                    placeholder="e.g., 500mg"
                                                />
                                                {prescriptionErrors[`medicine_${index}_dosage`] && (
                                                    <p className="text-red-500 text-xs mt-1">{prescriptionErrors[`medicine_${index}_dosage`]}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Frequency *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={medicine.frequency}
                                                    onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                                                    className={`w-full px-3 py-2 border-2 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                                        prescriptionErrors[`medicine_${index}_frequency`] ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                                    placeholder="e.g., 3 times daily"
                                                />
                                                {prescriptionErrors[`medicine_${index}_frequency`] && (
                                                    <p className="text-red-500 text-xs mt-1">{prescriptionErrors[`medicine_${index}_frequency`]}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Duration *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={medicine.duration}
                                                    onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                                                    className={`w-full px-3 py-2 border-2 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                                        prescriptionErrors[`medicine_${index}_duration`] ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                                    placeholder="e.g., 7 days"
                                                />
                                                {prescriptionErrors[`medicine_${index}_duration`] && (
                                                    <p className="text-red-500 text-xs mt-1">{prescriptionErrors[`medicine_${index}_duration`]}</p>
                                                )}
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Instructions
                                                </label>
                                                <input
                                                    type="text"
                                                    value={medicine.instructions}
                                                    onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                                    placeholder="e.g., Take after meals"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Additional Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Notes
                                </label>
                                <textarea
                                    name="additionalNotes"
                                    value={prescriptionForm.additionalNotes}
                                    onChange={handlePrescriptionInputChange}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                    rows="3"
                                    placeholder="Any additional instructions or precautions"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleClosePrescriptionModal}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Creating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Pill className="w-5 h-5" />
                                            <span>Create Prescription</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Prescription History Modal */}
            {showPrescriptionHistoryModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Prescription History</h3>
                                <p className="text-sm text-gray-500 mt-1">View all prescriptions and filter by patient</p>
                            </div>
                            <button 
                                onClick={handleClosePrescriptionHistory}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {successMessage && (
                            <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                                {successMessage}
                            </div>
                        )}

                        <div className="p-6">
                            {/* Patient Filter */}
                            <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Filter by Patient
                                </label>
                                <select
                                    value={selectedPatientForHistory}
                                    onChange={handlePatientFilterChange}
                                    className="w-full sm:w-96 px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                >
                                    <option value="">All Patients ({prescriptionHistory.length} prescriptions)</option>
                                    {patients.map(patient => {
                                        const patientPrescriptionCount = prescriptionHistory.filter(p => p.patientId === patient._id).length;
                                        return (
                                            <option key={patient._id} value={patient._id}>
                                                {patient.name} - {patientPrescriptionCount} prescription{patientPrescriptionCount !== 1 ? 's' : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Prescriptions List */}
                            {filteredPrescriptions.length === 0 ? (
                                <div className="text-center py-12">
                                    <Pill className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Prescriptions Found</h3>
                                    <p className="text-gray-500">
                                        {selectedPatientForHistory 
                                            ? 'No prescriptions found for this patient' 
                                            : 'Start creating prescriptions for your patients'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredPrescriptions.map((prescription) => (
                                        <div key={prescription.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-emerald-200 transition-colors">
                                            {/* Prescription Header */}
                                            <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                                                <div className="flex items-start space-x-4">
                                                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Pill className="w-6 h-6 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <h4 className="font-semibold text-gray-900 text-lg">{prescription.patientName}</h4>
                                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                                Patient
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            ID: <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{prescription.patientId?.slice(-8)}</code>
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Created: {new Date(prescription.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeletePrescription(prescription.id)}
                                                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                    title="Delete prescription"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Diagnosis */}
                                            <div className="mb-4">
                                                <h5 className="text-sm font-semibold text-gray-700 mb-2">Diagnosis:</h5>
                                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{prescription.diagnosis}</p>
                                            </div>

                                            {/* Medicines */}
                                            <div className="mb-4">
                                                <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                                    <Pill className="w-4 h-4 mr-2 text-emerald-600" />
                                                    Prescribed Medicines:
                                                </h5>
                                                <div className="space-y-3">
                                                    {prescription.medicines.map((medicine, index) => (
                                                        <div key={index} className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-600 mb-1">Medicine</p>
                                                                    <p className="text-sm font-semibold text-gray-900">{medicine.name}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-600 mb-1">Dosage</p>
                                                                    <p className="text-sm text-gray-900">{medicine.dosage}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-600 mb-1">Frequency</p>
                                                                    <p className="text-sm text-gray-900">{medicine.frequency}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-600 mb-1">Duration</p>
                                                                    <p className="text-sm text-gray-900">{medicine.duration}</p>
                                                                </div>
                                                            </div>
                                                            {medicine.instructions && (
                                                                <div className="mt-3 pt-3 border-t border-emerald-200">
                                                                    <p className="text-xs font-medium text-gray-600 mb-1">Instructions</p>
                                                                    <p className="text-sm text-gray-900">{medicine.instructions}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Additional Notes */}
                                            {prescription.additionalNotes && (
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Additional Notes:</h5>
                                                    <p className="text-sm text-gray-900">{prescription.additionalNotes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Close Button */}
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleClosePrescriptionHistory}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Appointment Modal */}
            {showAppointmentModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-semibold text-gray-900">Schedule Appointment</h3>
                            <button 
                                onClick={handleCloseAppointmentModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {successMessage && (
                            <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                                {successMessage}
                            </div>
                        )}

                        {error && (
                            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmitAppointment} className="p-6 space-y-6">
                            {/* Patient Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Patient *
                                </label>
                                <select
                                    value={appointmentForm.patientId}
                                    onChange={handleAppointmentPatientSelect}
                                    className={`w-full px-4 py-2 border-2 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                        appointmentErrors.patientId ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                >
                                    <option value="">-- Select Patient --</option>
                                    {patients.map(patient => (
                                        <option key={patient._id} value={patient._id}>
                                            {patient.name} ({patient.email})
                                        </option>
                                    ))}
                                </select>
                                {appointmentErrors.patientId && (
                                    <p className="text-red-500 text-xs mt-1">{appointmentErrors.patientId}</p>
                                )}
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Appointment Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="appointmentDate"
                                        value={appointmentForm.appointmentDate}
                                        onChange={handleAppointmentInputChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full px-4 py-2 border-2 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                            appointmentErrors.appointmentDate ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    />
                                    {appointmentErrors.appointmentDate && (
                                        <p className="text-red-500 text-xs mt-1">{appointmentErrors.appointmentDate}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Appointment Time *
                                    </label>
                                    <input
                                        type="time"
                                        name="appointmentTime"
                                        value={appointmentForm.appointmentTime}
                                        onChange={handleAppointmentInputChange}
                                        className={`w-full px-4 py-2 border-2 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors ${
                                            appointmentErrors.appointmentTime ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    />
                                    {appointmentErrors.appointmentTime && (
                                        <p className="text-red-500 text-xs mt-1">{appointmentErrors.appointmentTime}</p>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    name="notes"
                                    value={appointmentForm.notes}
                                    onChange={handleAppointmentInputChange}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-0 transition-colors"
                                    rows="4"
                                    placeholder="Add any special notes or reasons for the appointment"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCloseAppointmentModal}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Scheduling...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Calendar className="w-5 h-5" />
                                            <span>Schedule Appointment</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
