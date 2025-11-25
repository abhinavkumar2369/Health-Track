import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import authService from '../services/authService';
import { Shield, CheckCircle2, Zap, Users, Mail, Lock, Eye, EyeOff, ArrowRight, User, Check } from 'lucide-react';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const validatePassword = (password) => {
        const minLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return {
            minLength,
            hasUppercase,
            hasLowercase,
            hasNumber,
            hasSpecialChar,
            isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar
        };
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Full name must be at least 2 characters';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        const passwordValidation = validatePassword(formData.password);
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!passwordValidation.isValid) {
            newErrors.password = 'Password does not meet requirements';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        
        try {
            // Register admin via API
            const response = await authAPI.signUp(
                formData.fullName,
                formData.email,
                formData.password
            );
            
            // Backend returns { token, user: { id, email, role } }
            if (response.token && response.user) {
                authService.login(response.token, response.user);
                navigate('/admin-dashboard', { replace: true });
            } else {
                setErrors({ general: response.message || 'Registration failed' });
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ general: error.message || 'Registration failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const passwordValidation = validatePassword(formData.password);

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
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                                Start Your Journey in
                                <span className="block mt-1 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Healthcare Management</span>
                            </h2>
                            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                                Create your administrator account and take control of your healthcare facility with powerful management tools.
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Admin Control Panel</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">Full access to manage staff, patients & operations</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Instant Setup</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">Get started immediately with your dashboard</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Users className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Team Management</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">Add and manage doctors, staff & pharmacists</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Sign Up Form */}
                    <div className="max-w-md mx-auto w-full space-y-4 sm:space-y-6 lg:space-y-8">
                        {/* Mobile Header */}
                        <div className="text-center lg:hidden">
                            <div className="inline-flex items-center gap-2.5 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </div>
                                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Health Track</h1>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">Create Admin Account</h2>
                            <p className="text-sm text-gray-600">Setup your administrator profile</p>
                        </div>

                        {/* Desktop Header */}
                        <div className="hidden lg:block text-center">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Registration</h2>
                            <p className="text-gray-600">Create your administrator account</p>
                        </div>

                {/* Sign Up Form */}
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

                        {/* Full Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-gray-400" strokeWidth={2} />
                                </div>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className={`w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${
                                        errors.fullName
                                            ? 'border-red-300 focus:border-red-500 bg-red-50/50'
                                            : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                                    }`}
                                    placeholder="John Doe"
                                />
                            </div>
                            {errors.fullName && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><span className="w-1 h-1 bg-red-600 rounded-full"></span>{errors.fullName}</p>}
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
                                    placeholder="admin@example.com"
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
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 sm:py-3 pr-11 text-sm sm:text-base rounded-xl border-2 transition-colors duration-200 focus:outline-none focus:ring-0 ${
                                        errors.password
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-200 focus:border-blue-500'
                                    }`}
                                    placeholder="Create a strong password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {showPassword ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M18.364 5.636L8.464 8.464m9.9-2.828l-1.414 1.414" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        )}
                                    </svg>
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                            
                            {/* Password Requirements */}
                            {formData.password && (
                                <div className="mt-2.5 sm:mt-3 space-y-1.5">
                                    <p className="text-xs sm:text-sm font-medium text-gray-700">Password Requirements:</p>
                                    <div className="grid grid-cols-1 gap-0.5 text-xs">
                                        <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            At least 8 characters
                                        </div>
                                        <div className={`flex items-center ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-400'}`}>
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            One uppercase letter
                                        </div>
                                        <div className={`flex items-center ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-400'}`}>
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            One lowercase letter
                                        </div>
                                        <div className={`flex items-center ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            One number
                                        </div>
                                        <div className={`flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            One special character
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400" strokeWidth={2} />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`w-full pl-11 pr-11 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${
                                        errors.confirmPassword
                                            ? 'border-red-300 focus:border-red-500 bg-red-50/50'
                                            : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                                    }`}
                                    placeholder="Re-enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" strokeWidth={2} /> : <Eye className="w-5 h-5" strokeWidth={2} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><span className="w-1 h-1 bg-red-600 rounded-full"></span>{errors.confirmPassword}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 sm:py-3.5 px-4 text-sm sm:text-base rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group mt-4 sm:mt-6"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Creating Account...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <span>Create Admin Account</span>
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

export default SignUp;