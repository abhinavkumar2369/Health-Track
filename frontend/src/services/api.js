// API configuration and utilities
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

// Admin API
export const adminAPI = {
    // Add doctor or pharmacist
    addUser: async (fullname, email, password, role, specialization = '') => {
        const token = getToken();
        const body = { token, fullname, email, password, role };
        if (role === 'doctor' && specialization) {
            body.specialization = specialization;
        }
        
        const response = await apiRequest('/admin/add-user', {
            method: 'POST',
            body: JSON.stringify(body),
        });
        return response;
    },

    // Remove doctor or pharmacist
    removeUser: async (userId, role) => {
        const token = getToken();
        const response = await apiRequest(`/admin/remove-user/${userId}`, {
            method: 'DELETE',
            body: JSON.stringify({ token, role }),
        });
        return response;
    },
};

// Doctor API
export const doctorAPI = {
    // Add patient
    addPatient: async (fullname, email, password) => {
        const token = getToken();
        const response = await apiRequest('/doctor/add-patient', {
            method: 'POST',
            body: JSON.stringify({ token, fullname, email, password }),
        });
        return response;
    },

    // Remove patient
    removePatient: async (patientId) => {
        const token = getToken();
        const response = await apiRequest(`/doctor/remove-patient/${patientId}`, {
            method: 'DELETE',
            body: JSON.stringify({ token }),
        });
        return response;
    },

    // Get my patients
    getMyPatients: async () => {
        const token = getToken();
        const response = await apiRequest(`/doctor/my-patients?token=${token}`);
        return response;
    },
};

// Patient API (placeholder for future endpoints)
export const patientAPI = {
    // Add patient-specific endpoints here when backend is ready
};

// Pharmacist API (placeholder for future endpoints)
export const pharmacistAPI = {
    // Add pharmacist-specific endpoints here when backend is ready
};

export default {
    auth: authAPI,
    admin: adminAPI,
    doctor: doctorAPI,
    patient: patientAPI,
    pharmacist: pharmacistAPI,
};
