// API configuration and utilities
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// API request helper
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Auth API
export const authAPI = {
    login: async (email, password, profession) => {
        return apiRequest('/auth/sign-in', {
            method: 'POST',
            body: JSON.stringify({ email, password, profession }),
        });
    },

    signUp: async (fullName, email, password) => {
        return apiRequest('/auth/sign-up', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, password }),
        });
    },

    logout: () => {
        // Client-side logout (clear token)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return Promise.resolve({ success: true });
    },
};

// Admin API
export const adminAPI = {
    // Add doctor or pharmacist
    addStaff: async (fullName, email, password, profession) => {
        return apiRequest('/admin/staff', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, password, profession }),
        });
    },

    removeStaff: async (staffId) => {
        return apiRequest(`/admin/staff/${staffId}`, {
            method: 'DELETE',
        });
    },

    getAllDoctors: async () => {
        return apiRequest('/admin/doctors');
    },

    getAllPharmacists: async () => {
        return apiRequest('/admin/pharmacists');
    },

    // Hospital Management
    addHospital: async (hospitalData) => {
        return apiRequest('/admin/hospitals', {
            method: 'POST',
            body: JSON.stringify(hospitalData),
        });
    },

    getAllHospitals: async () => {
        return apiRequest('/admin/hospitals');
    },

    updateHospital: async (hospitalId, hospitalData) => {
        return apiRequest(`/admin/hospitals/${hospitalId}`, {
            method: 'PUT',
            body: JSON.stringify(hospitalData),
        });
    },

    deleteHospital: async (hospitalId) => {
        return apiRequest(`/admin/hospitals/${hospitalId}`, {
            method: 'DELETE',
        });
    },

    // System Statistics
    getStats: async () => {
        return apiRequest('/admin/stats');
    },
};

// Doctor API
export const doctorAPI = {
    addPatient: async (fullName, email, password) => {
        return apiRequest('/doctor/patients', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, password }),
        });
    },

    removePatient: async (patientId) => {
        return apiRequest(`/doctor/patients/${patientId}`, {
            method: 'DELETE',
        });
    },

    getMyPatients: async () => {
        return apiRequest('/doctor/patients');
    },

    getPatientDetails: async (patientId) => {
        return apiRequest(`/doctor/patients/${patientId}`);
    },

    getPatientDocuments: async (patientId) => {
        return apiRequest(`/doctor/patients/${patientId}/documents`);
    },
};

// Patient API
export const patientAPI = {
    uploadDocument: async (formData) => {
        const token = getToken();
        const response = await fetch(`${API_URL}/patient/upload`, {
            method: 'POST',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: formData, // FormData, not JSON
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
        }
        
        return data;
    },

    getMyDocuments: async () => {
        return apiRequest('/patient/documents');
    },

    viewDocument: async (fileId) => {
        return apiRequest(`/patient/documents/${fileId}`);
    },

    getMyDoctor: async () => {
        return apiRequest('/patient/my-doctor');
    },
};

// Pharmacist API
export const pharmacistAPI = {
    addMedicine: async (medicineData) => {
        return apiRequest('/pharmacist/add-medicine', {
            method: 'POST',
            body: JSON.stringify(medicineData),
        });
    },

    getInventory: async () => {
        return apiRequest('/pharmacist/inventory');
    },

    updateMedicine: async (medicineId, medicineData) => {
        return apiRequest(`/pharmacist/medicine/${medicineId}`, {
            method: 'PUT',
            body: JSON.stringify(medicineData),
        });
    },

    issueMedicine: async (issueData) => {
        return apiRequest('/pharmacist/issue-medicine', {
            method: 'POST',
            body: JSON.stringify(issueData),
        });
    },

    getIssuedHistory: async (patientId = null) => {
        const url = patientId ? `/pharmacist/issued?patientId=${patientId}` : '/pharmacist/issued';
        return apiRequest(url);
    },

    getLowStock: async (threshold = 10) => {
        return apiRequest(`/pharmacist/low-stock?threshold=${threshold}`);
    },
};

// ML API
export const mlAPI = {
    processData: async (data, type) => {
        return apiRequest('/ml/process', {
            method: 'POST',
            body: JSON.stringify({ data, type }),
        });
    },

    analyzeDocument: async (fileId, s3Key) => {
        return apiRequest('/ml/analyze-document', {
            method: 'POST',
            body: JSON.stringify({ fileId, s3Key }),
        });
    },

    predictHealth: async (symptoms, patientData) => {
        return apiRequest('/ml/predict-health', {
            method: 'POST',
            body: JSON.stringify({ symptoms, patientData }),
        });
    },

    checkHealth: async () => {
        return apiRequest('/ml/health');
    },
};

export default {
    auth: authAPI,
    admin: adminAPI,
    doctor: doctorAPI,
    patient: patientAPI,
    pharmacist: pharmacistAPI,
    ml: mlAPI,
};
