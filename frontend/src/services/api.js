// API configuration and utilities
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
    login: async (email, password) => {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    getMe: async () => {
        return apiRequest('/auth/me');
    },

    updatePassword: async (currentPassword, newPassword) => {
        return apiRequest('/auth/updatepassword', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword }),
        });
    },

    logout: async () => {
        return apiRequest('/auth/logout', {
            method: 'POST',
        });
    },
};

// Admin API
export const adminAPI = {
    registerAdmin: async (userData) => {
        return apiRequest('/admin/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    getAllUsers: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return apiRequest(`/admin/users${queryParams ? `?${queryParams}` : ''}`);
    },

    getUser: async (id) => {
        return apiRequest(`/admin/users/${id}`);
    },

    activateUser: async (id) => {
        return apiRequest(`/admin/users/${id}/activate`, {
            method: 'PUT',
        });
    },

    deactivateUser: async (id) => {
        return apiRequest(`/admin/users/${id}/deactivate`, {
            method: 'PUT',
        });
    },

    // Admin can add users
    addDoctor: async (doctorData) => {
        return apiRequest('/admin/doctors', {
            method: 'POST',
            body: JSON.stringify(doctorData),
        });
    },

    addPatient: async (patientData) => {
        return apiRequest('/admin/patients', {
            method: 'POST',
            body: JSON.stringify(patientData),
        });
    },

    addPharmacist: async (pharmacistData) => {
        return apiRequest('/admin/pharmacists', {
            method: 'POST',
            body: JSON.stringify(pharmacistData),
        });
    },
};

// Doctor API
export const doctorAPI = {
    addPatient: async (patientData) => {
        return apiRequest('/doctor/patients', {
            method: 'POST',
            body: JSON.stringify(patientData),
        });
    },

    addDoctor: async (doctorData) => {
        return apiRequest('/doctor/doctors', {
            method: 'POST',
            body: JSON.stringify(doctorData),
        });
    },

    addPharmacist: async (pharmacistData) => {
        return apiRequest('/doctor/pharmacists', {
            method: 'POST',
            body: JSON.stringify(pharmacistData),
        });
    },

    getPatients: async () => {
        return apiRequest('/doctor/patients');
    },

    getDoctors: async () => {
        return apiRequest('/doctor/doctors');
    },

    getPharmacists: async () => {
        return apiRequest('/doctor/pharmacists');
    },
};

export default {
    auth: authAPI,
    admin: adminAPI,
    doctor: doctorAPI,
};
