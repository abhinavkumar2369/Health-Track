// API configuration and utilities
// Remove trailing slash if present to avoid double slashes
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
    .replace(/\/$/, '')
    .replace(/\/api$/, '');

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Simple API request helper
const apiRequest = async (endpoint, options = {}) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Auth API
export const authAPI = {
    // Sign in for all roles
    login: async (email, password, role) => {
        const response = await apiRequest('/auth/sign-in', {
            method: 'POST',
            body: JSON.stringify({ email, password, role }),
        });
        return response;
    },

    // Admin sign up
    signUp: async (fullname, email, password) => {
        const response = await apiRequest('/auth/sign-up', {
            method: 'POST',
            body: JSON.stringify({ fullname, email, password, role: 'admin' }),
        });
        return response;
    },

    // Logout (client-side)
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return Promise.resolve({ success: true });
    },
};

// Admin API helpers
const ensureToken = () => {
    const token = getToken();
    if (!token) {
        throw new Error('Authentication required. Please sign in again.');
    }
    return token;
};

const addAdminUser = async ({ fullname, email, password, role, specialization }) => {
    const token = ensureToken();
    const body = { token, fullname, email, password, role };

    if (role === 'doctor' && specialization) {
        body.specialization = specialization;
    }

    return apiRequest('/admin/add-user', {
        method: 'POST',
        body: JSON.stringify(body),
    });
};

const removeAdminUser = async (userId, role) => {
    const token = ensureToken();
    return apiRequest(`/admin/remove-user/${userId}`, {
        method: 'DELETE',
        body: JSON.stringify({ token, role }),
    });
};

const getAdminUsers = async (role) => {
    const token = ensureToken();
    const params = new URLSearchParams({ token });
    if (role) {
        params.append('role', role);
    }
    return apiRequest(`/admin/users?${params.toString()}`);
};

export const adminAPI = {
    addDoctor: async ({ fullname, email, password, specialization }) =>
        addAdminUser({ fullname, email, password, role: 'doctor', specialization }),
    addPharmacist: async ({ fullname, email, password }) =>
        addAdminUser({ fullname, email, password, role: 'pharmacist' }),
    addPatient: async ({ fullname, email, password }) => {
        const token = ensureToken();
        return apiRequest('/admin/add-patient', {
            method: 'POST',
            body: JSON.stringify({ token, fullname, email, password }),
        });
    },
    getUsers: getAdminUsers,
    getPatients: async () => {
        const token = ensureToken();
        return apiRequest(`/admin/patients?token=${token}`);
    },
    removeUser: removeAdminUser,
    removePatient: async (patientId) => {
        const token = ensureToken();
        return apiRequest(`/admin/remove-patient/${patientId}`, {
            method: 'DELETE',
            body: JSON.stringify({ token }),
        });
    },
    getProfile: async () => {
        const token = ensureToken();
        return apiRequest(`/admin/profile?token=${token}`);
    },
    updateProfile: async (profileData) => {
        const token = ensureToken();
        return apiRequest('/admin/profile', {
            method: 'PUT',
            body: JSON.stringify({ token, ...profileData }),
        });
    },
    changePassword: async (passwordData) => {
        const token = ensureToken();
        return apiRequest('/admin/change-password', {
            method: 'PUT',
            body: JSON.stringify({ token, ...passwordData }),
        });
    },
    getPharmacyInventory: async () => {
        const token = ensureToken();
        return apiRequest(`/admin/pharmacy-inventory?token=${token}`);
    },
    getCriticalDiseases: async () => {
        const token = ensureToken();
        return apiRequest(`/admin/critical-diseases?token=${token}`);
    },
    generateApiToken: async (expiryDays = 365) => {
        const token = ensureToken();
        return apiRequest('/admin/generate-api-token', {
            method: 'POST',
            body: JSON.stringify({ token, expiryDays }),
        });
    },
    getApiToken: async () => {
        const token = ensureToken();
        return apiRequest(`/admin/api-token?token=${token}`);
    },
    revokeApiToken: async () => {
        const token = ensureToken();
        return apiRequest('/admin/api-token', {
            method: 'DELETE',
            body: JSON.stringify({ token }),
        });
    },
};

// Doctor API
export const doctorAPI = {
    // Add patient
    addPatient: async (fullname, email, password) => {
        const token = ensureToken();
        const response = await apiRequest('/doctor/add-patient', {
            method: 'POST',
            body: JSON.stringify({ token, fullname, email, password }),
        });
        return response;
    },

    // Remove patient
    removePatient: async (patientId) => {
        const token = ensureToken();
        const response = await apiRequest(`/doctor/remove-patient/${patientId}`, {
            method: 'DELETE',
            body: JSON.stringify({ token }),
        });
        return response;
    },

    // Get my patients
    getMyPatients: async () => {
        const token = ensureToken();
        const response = await apiRequest(`/doctor/my-patients?token=${token}`);
        return response;
    },

    // Get doctor profile
    getProfile: async () => {
        const token = ensureToken();
        return apiRequest(`/doctor/profile?token=${token}`);
    },

    // Update doctor profile
    updateProfile: async (profileData) => {
        const token = ensureToken();
        return apiRequest('/doctor/profile', {
            method: 'PUT',
            body: JSON.stringify({ token, ...profileData }),
        });
    },

    // Change doctor password
    changePassword: async (passwordData) => {
        const token = ensureToken();
        return apiRequest('/doctor/change-password', {
            method: 'PUT',
            body: JSON.stringify({ token, ...passwordData }),
        });
    },
};

// Patient API
export const patientAPI = {
    // Get all doctors with specialties
    getAllDoctors: async () => {
        return apiRequest('/patient/doctors');
    },

    // Get available time slots for a doctor
    getAvailableSlots: async (doctorId, dates) => {
        return apiRequest('/patient/available-slots', {
            method: 'POST',
            body: JSON.stringify({ doctorId, dates }),
        });
    },

    // Get AI-suggested appointment slots
    getAISuggestedSlots: async (doctorId, preferredDates = null, preferredTimes = null) => {
        const token = ensureToken();
        return apiRequest('/patient/ai-suggest-slots', {
            method: 'POST',
            body: JSON.stringify({ 
                token, 
                doctorId, 
                preferredDates, 
                preferredTimes 
            }),
        });
    },

    // Request appointment
    requestAppointment: async (doctorId, appointmentDate, appointmentTime, notes = '') => {
        const token = ensureToken();
        return apiRequest('/patient/request-appointment', {
            method: 'POST',
            body: JSON.stringify({ 
                token, 
                doctorId, 
                appointmentDate, 
                appointmentTime, 
                notes 
            }),
        });
    },

    // Get patient's appointments
    getMyAppointments: async () => {
        const token = ensureToken();
        return apiRequest(`/patient/my-appointments?token=${token}`);
    },

    // Cancel appointment
    cancelAppointment: async (appointmentId) => {
        const token = ensureToken();
        return apiRequest(`/patient/cancel-appointment/${appointmentId}`, {
            method: 'DELETE',
            body: JSON.stringify({ token }),
        });
    },

    // Get reschedule suggestions with AI
    getRescheduleSuggestions: async (appointmentId) => {
        const token = ensureToken();
        return apiRequest(`/patient/reschedule-suggest/${appointmentId}`, {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
    },

    // Reschedule appointment
    rescheduleAppointment: async (appointmentId, newDate, newTime, reason = '') => {
        const token = ensureToken();
        return apiRequest(`/patient/reschedule-appointment/${appointmentId}`, {
            method: 'PUT',
            body: JSON.stringify({ 
                token, 
                newDate, 
                newTime, 
                reason 
            }),
        });
    },
};

// Document API
export const documentAPI = {
    // Upload document
    uploadDocument: async (formData) => {
        const token = ensureToken();
        formData.append('token', token);
        
        const response = await fetch(`${API_URL}/api/documents/upload`, {
            method: 'POST',
            body: formData, // Don't set Content-Type, let browser set it with boundary
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }
        return data;
    },

    // List all documents
    listDocuments: async () => {
        const token = ensureToken();
        return apiRequest('/api/documents/list', {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
    },

    // View document
    viewDocument: async (documentId) => {
        const token = ensureToken();
        return apiRequest(`/api/documents/view/${documentId}`, {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
    },

    // Download document
    downloadDocument: async (documentId) => {
        const token = ensureToken();
        return apiRequest(`/api/documents/download/${documentId}`, {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
    },

    // Delete document
    deleteDocument: async (documentId) => {
        const token = ensureToken();
        return apiRequest(`/api/documents/${documentId}`, {
            method: 'DELETE',
            body: JSON.stringify({ token }),
        });
    },

    // Summarize document using AI
    summarizeDocument: async (documentId) => {
        const token = ensureToken();
        return apiRequest(`/api/documents/summarize/${documentId}`, {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
    },

    // Get document summary
    getDocumentSummary: async (documentId) => {
        const token = ensureToken();
        return apiRequest(`/api/documents/summary/${documentId}`, {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
    },
};

// Pharmacist API
export const pharmacistAPI = {
    // Get all medicines in inventory
    getMedicines: async () => {
        const token = ensureToken();
        const response = await apiRequest(`/pharmacist/medicines?token=${token}`);
        return response;
    },

    // Add new medicine to inventory
    addMedicine: async (medicineData) => {
        const token = ensureToken();
        const response = await apiRequest('/pharmacist/add-medicine', {
            method: 'POST',
            body: JSON.stringify({ token, ...medicineData }),
        });
        return response;
    },

    // Update medicine in inventory
    updateMedicine: async (medicineId, medicineData) => {
        const token = ensureToken();
        const response = await apiRequest(`/pharmacist/update-medicine/${medicineId}`, {
            method: 'PUT',
            body: JSON.stringify({ token, ...medicineData }),
        });
        return response;
    },

    // Issue medicine to patient
    issueMedicine: async (issueData) => {
        const token = ensureToken();
        const response = await apiRequest('/pharmacist/issue-medicine', {
            method: 'POST',
            body: JSON.stringify({ token, ...issueData }),
        });
        return response;
    },

    // Remove medicine from inventory
    removeMedicine: async (medicineId) => {
        const token = ensureToken();
        const response = await apiRequest(`/pharmacist/remove-medicine/${medicineId}`, {
            method: 'DELETE',
            body: JSON.stringify({ token }),
        });
        return response;
    },

    // Get inventory statistics
    getInventoryStats: async () => {
        const token = ensureToken();
        const response = await apiRequest(`/pharmacist/inventory-stats?token=${token}`);
        return response;
    },

    // Get all transactions
    getTransactions: async () => {
        const token = ensureToken();
        const response = await apiRequest(`/pharmacist/transactions?token=${token}`);
        return response;
    },

    // Get pharmacist profile
    getProfile: async () => {
        const token = ensureToken();
        const response = await apiRequest(`/pharmacist/profile?token=${token}`);
        return response;
    },

    // Update pharmacist profile
    updateProfile: async (profileData) => {
        const token = ensureToken();
        const response = await apiRequest('/pharmacist/profile', {
            method: 'PUT',
            body: JSON.stringify({ token, ...profileData }),
        });
        return response;
    },

    // Update password
    updatePassword: async (passwordData) => {
        const token = ensureToken();
        const response = await apiRequest('/pharmacist/update-password', {
            method: 'PUT',
            body: JSON.stringify({ token, ...passwordData }),
        });
        return response;
    },

    // Get all reports
    getReports: async () => {
        const token = ensureToken();
        const response = await apiRequest(`/pharmacist/reports?token=${token}`);
        return response;
    },

    // Generate new report
    generateReport: async (reportData) => {
        const token = ensureToken();
        const response = await apiRequest('/pharmacist/generate-report', {
            method: 'POST',
            body: JSON.stringify({ token, ...reportData }),
        });
        return response;
    },

    // Get report download URL
    getReportDownloadUrl: async (reportId) => {
        const token = ensureToken();
        const response = await apiRequest(`/pharmacist/report-download/${reportId}?token=${token}`);
        return response;
    },

    // Delete report
    deleteReport: async (reportId) => {
        const token = ensureToken();
        const response = await apiRequest(`/pharmacist/report/${reportId}`, {
            method: 'DELETE',
            body: JSON.stringify({ token }),
        });
        return response;
    },
};

export default {
    auth: authAPI,
    admin: adminAPI,
    doctor: doctorAPI,
    patient: patientAPI,
    pharmacist: pharmacistAPI,
    document: documentAPI,
};
