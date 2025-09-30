import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'patient'
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const roles = [
        { value: 'admin', label: 'Admin', icon: '👑' },
        { value: 'doctor', label: 'Doctor', icon: '👨‍⚕️' },
        { value: 'patient', label: 'Patient', icon: '👤' },
        { value: 'pharmacist', label: 'Pharmacist', icon: '💊' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        if (!formData.role) {
            newErrors.role = 'Please select a role';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Single set of credentials for all roles
            const defaultCredentials = {
                email: 'test@admin.com',
                password: 'admin'
            };
            
            if (formData.email !== defaultCredentials.email || formData.password !== defaultCredentials.password) {
                setErrors({ general: 'Invalid credentials. Use test@admin.com / admin' });
                setIsLoading(false);
                return;
            }
            
            // Store user info (in real app, use proper state management)
            localStorage.setItem('user', JSON.stringify({ 
                email: formData.email, 
                role: formData.role 
            }));
            
            // Redirect to appropriate dashboard
            const dashboardRoutes = {
                admin: '/admin-dashboard',
                doctor: '/doctor-dashboard',
                patient: '/patient-dashboard',
                pharmacist: '/pharmacist-dashboard'
            };
            
            navigate(dashboardRoutes[formData.role]);
            
        } catch (error) {
            setErrors({ general: 'Sign in failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="mt-2 text-gray-600">Sign in to access your Health Track dashboard</p>
                </div>

                {/* Sign In Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* General Error */}
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-red-700 text-sm">{errors.general}</span>
                                </div>
                            </div>
                        )}

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Select Your Role
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {roles.map((role) => (
                                    <label
                                        key={role.value}
                                        className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                            formData.role === role.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role.value}
                                            checked={formData.role === role.value}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">{role.icon}</span>
                                            <span className="text-sm font-medium text-gray-900">{role.label}</span>
                                        </div>
                                        {formData.role === role.value && (
                                            <div className="absolute top-2 right-2">
                                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </label>
                                ))}
                            </div>
                            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none focus:ring-0 ${
                                        errors.email
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-200 focus:border-blue-500'
                                    }`}
                                    placeholder="Enter your email"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                            </div>
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none focus:ring-0 ${
                                        errors.password
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-200 focus:border-blue-500'
                                    }`}
                                    placeholder="Enter your password"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Signing In...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        {/* Demo Credentials */}
                        <div className="bg-blue-50 rounded-lg p-4 mt-6">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials (All Roles):</h4>
                            <div className="text-xs text-blue-700 space-y-1">
                                <div><strong>Email:</strong> test@admin.com</div>
                                <div><strong>Password:</strong> admin</div>
                                <div className="text-blue-600 mt-2">Select your role above and use these credentials to sign in</div>
                            </div>
                        </div>

                        {/* Sign Up Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Need admin access?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/signup')}
                                    className="text-blue-600 hover:text-blue-500 font-medium"
                                >
                                    Contact Administrator
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignIn;