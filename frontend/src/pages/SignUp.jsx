import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import authService from '../services/authService';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const pwCheck = (p) => ({
        minLength: p.length >= 8,
        hasUpper: /[A-Z]/.test(p),
        hasLower: /[a-z]/.test(p),
        hasNumber: /\d/.test(p),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(p),
    });

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address';
        const pw = pwCheck(formData.password);
        if (!formData.password) newErrors.password = 'Password is required';
        else if (!Object.values(pw).every(Boolean)) newErrors.password = 'Password does not meet requirements';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            const response = await authAPI.signUp(formData.fullName, formData.email, formData.password);
            if (response.token && response.user) {
                authService.login(response.token, response.user);
                navigate('/admin-dashboard', { replace: true });
            } else {
                setErrors({ general: response.message || 'Registration failed' });
            }
        } catch (error) {
            setErrors({ general: error.message || 'Registration failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const pw = pwCheck(formData.password);
    const requirements = [
        { key: 'minLength', label: '8+ characters' },
        { key: 'hasUpper', label: 'Uppercase' },
        { key: 'hasLower', label: 'Lowercase' },
        { key: 'hasNumber', label: 'Number' },
        { key: 'hasSpecial', label: 'Special char' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex flex-col items-center justify-center px-4 py-10 relative">

            {/* Top-left back button */}
            <button onClick={() => navigate('/')} className="absolute top-5 left-5 p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all" title="Back to Home">
                <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-5 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Health Track</span>
            </div>

            {/* Card */}
            <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-10">
                <h1 className="text-2xl font-bold text-slate-700 mb-6 text-center">Admin Sign Up</h1>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {errors.general && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errors.general}</p>
                    )}

                    {/* Full Name */}
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
                            <input
                                id="fullName" name="fullName" type="text" autoComplete="name"
                                value={formData.fullName} onChange={handleInputChange}
                                placeholder="Your full name"
                                className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                                    errors.fullName ? 'border-red-300 bg-red-50/50' : 'border-slate-200 focus:border-blue-500 hover:border-slate-300'
                                }`}
                            />
                        </div>
                        {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
                            <input
                                id="email" name="email" type="email" autoComplete="email"
                                value={formData.email} onChange={handleInputChange}
                                placeholder="admin@hospital.com"
                                className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                                    errors.email ? 'border-red-300 bg-red-50/50' : 'border-slate-200 focus:border-blue-500 hover:border-slate-300'
                                }`}
                            />
                        </div>
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
                            <input
                                id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                                value={formData.password} onChange={handleInputChange}
                                placeholder="Create a password"
                                className={`w-full pl-10 pr-10 py-3.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                                    errors.password ? 'border-red-300 bg-red-50/50' : 'border-slate-200 focus:border-blue-500 hover:border-slate-300'
                                }`}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                        {formData.password && (
                            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                                {requirements.map(({ key, label }) => (
                                    <div key={key} className={`flex items-center gap-1.5 text-xs ${pw[key] ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        <Check className={`w-3 h-3 flex-shrink-0 ${pw[key] ? 'text-emerald-500' : 'text-slate-300'}`} strokeWidth={2.5} />
                                        {label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
                            <input
                                id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password"
                                value={formData.confirmPassword} onChange={handleInputChange}
                                placeholder="Re-enter password"
                                className={`w-full pl-10 pr-10 py-3.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                                    errors.confirmPassword ? 'border-red-300 bg-red-50/50'
                                    : formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-emerald-400'
                                    : 'border-slate-200 focus:border-blue-500 hover:border-slate-300'
                                }`}
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit" disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-500 text-white py-3.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-1"
                    >
                        {isLoading ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Creating</span></>
                        ) : (
                            <><span>Create Account</span><ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-5">
                    Already have an account?{' '}
                    <button onClick={() => navigate('/sign-in')} className="font-semibold text-blue-600 hover:text-blue-700">Sign in</button>
                </p>
            </div>


        </div>
    );
};

export default SignUp;
