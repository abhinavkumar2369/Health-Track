import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import authService from '../services/authService';
import { Crown, Stethoscope, User, Pill, Shield, Zap, Users, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

const SignIn = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'patient'
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const roles = [
        { value: 'admin', label: 'Admin', icon: Crown, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
        { value: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
        { value: 'patient', label: 'Patient', icon: User, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
        { value: 'pharmacist', label: 'Pharmacist', icon: Pill, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' }
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
            // Call backend API to login
            const response = await authAPI.login(formData.email, formData.password, formData.role);
            
            // Backend returns { token, user: { id, email, role } }
            if (response.token && response.user) {
                // Store token and user info
                authService.login(response.token, response.user);
                
                // Redirect to appropriate dashboard based on user role
                const dashboardRoutes = {
                    admin: '/admin-dashboard',
                    doctor: '/doctor-dashboard',
                    patient: '/patient-dashboard',
                    pharmacist: '/pharmacist-dashboard'
                };
                
                navigate(dashboardRoutes[response.user.role]);
            } else {
                setErrors({ general: 'Invalid credentials' });
            }
            
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ general: error.message || 'Sign in failed. Please check your credentials.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-3 sm:p-6 lg:p-8">
            <div className="max-w-6xl w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
                    {/* Left Side - Branding/Info (Hidden on mobile) */}
                    <div className="hidden lg:flex flex-col justify-center space-y-8 pr-8">
                        <div>
                            <div className="inline-flex items-center gap-3 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Health Track</h1>
                                </div>
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                Welcome Back to
                                <span className="block mt-1 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Smart Healthcare</span>
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Sign in to access your personalized healthcare dashboard and manage your health journey.
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Secure & Encrypted</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">Bank-level encryption protects your health data</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-200 hover:shadow-md transition-all duration-300">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Lightning Fast</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">Instant access to all your medical records</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-md transition-all duration-300">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Users className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Multi-Role Platform</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">Built for patients, doctors & administrators</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Sign In Form */}
                    <div className="max-w-md mx-auto w-full space-y-4 sm:space-y-6 lg:space-y-8">
                        {/* Mobile Header */}
                        <div className="text-center lg:hidden">
                            <div className="inline-flex items-center gap-2.5 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </div>
                                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Health Track</h1>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">Welcome Back</h2>
                            <p className="text-sm text-gray-600">Sign in to your healthcare dashboard</p>
                        </div>

                        {/* Desktop Header */}
                        <div className="hidden lg:block text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
                            <p className="text-gray-600">Enter your credentials to access your dashboard</p>
                        </div>

                {/* Sign In Form */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-gray-200">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Your Role
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {roles.map((role) => {
                                    const IconComponent = role.icon;
                                    return (
                                        <label
                                            key={role.value}
                                            className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                                formData.role === role.value
                                                    ? `${role.borderColor} ${role.bgColor}`
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
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
                                            <IconComponent className={`w-5 h-5 mb-1.5 ${formData.role === role.value ? role.color : 'text-gray-400'}`} strokeWidth={2} />
                                            <span className={`text-xs font-medium ${formData.role === role.value ? role.color : 'text-gray-600'}`}>{role.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.role && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><span className="w-1 h-1 bg-red-600 rounded-full"></span>{errors.role}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-400" strokeWidth={2} />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${
                                        errors.email
                                            ? 'border-red-300 focus:border-red-500 bg-red-50/50'
                                            : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                                    }`}
                                    placeholder="your.email@example.com"
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><span className="w-1 h-1 bg-red-600 rounded-full"></span>{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400" strokeWidth={2} />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${
                                        errors.password
                                            ? 'border-red-300 focus:border-red-500 bg-red-50/50'
                                            : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                                    }`}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={2} /> : <Eye className="w-5 h-5" strokeWidth={2} />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><span className="w-1 h-1 bg-red-600 rounded-full"></span>{errors.password}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-4 w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 sm:py-3.5 px-4 text-sm sm:text-base rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Signing In...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <span>Sign In to Dashboard</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                                </div>
                            )}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
    );
};

export default SignIn;