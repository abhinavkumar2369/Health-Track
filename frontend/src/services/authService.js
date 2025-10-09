// Authentication service for managing user sessions
const authService = {
    // Store token and user data
    login: (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Remove token and user data
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Get token
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Get user role
    getUserRole: () => {
        const user = authService.getCurrentUser();
        return user ? user.role : null;
    },

    // Check if user has specific role
    hasRole: (role) => {
        return authService.getUserRole() === role;
    },
};

export default authService;