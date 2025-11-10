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
    getUsers: getAdminUsers,
    removeUser: removeAdminUser,
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
