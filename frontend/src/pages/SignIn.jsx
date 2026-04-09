import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import authService from '../services/authService';
import { Crown, Stethoscope, User, Pill, Heart, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

const SignIn = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '', role: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const roles = [
        { value: 'admin', label: 'Admin', icon: Crown },
        { value: 'doctor', label: 'Doctor', icon: Stethoscope },
        { value: 'patient', label: 'Patient', icon: Heart },
        { value: 'pharmacist', label: 'Pharmacist', icon: Pill },
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address';
        if (!formData.password) newErrors.password = 'Password is required';
        if (!formData.role) newErrors.role = 'Please select a role';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            const response = await authAPI.login(formData.email, formData.password, formData.role);
            if (response.token && response.user) {
                authService.login(response.token, response.user);
                const routes = { admin: '/admin-dashboard', doctor: '/doctor-dashboard', patient: '/patient-dashboard', pharmacist: '/pharmacist-dashboard' };
                navigate(routes[response.user.role]);
            } else {
                setErrors({ general: 'Invalid credentials' });
            }
        } catch (error) {
            setErrors({ general: error.message || 'Sign in failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex flex-col items-center justify-center px-4 relative">

            {/* Top-left back button */}
            <button onClick={() => navigate('/')} className="absolute top-5 left-5 p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all" title="Back to Home">
                <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Health Track</span>
            </div>

            {/* Card */}
            <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-10">
                <h1 className="text-2xl font-bold text-slate-700 mb-6 text-center">Sign In</h1>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {errors.general && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errors.general}</p>
                    )}

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                        <div className="grid grid-cols-2 gap-3">
                            {roles.map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => { setFormData(p => ({ ...p, role: value })); setErrors(p => ({ ...p, role: '' })); }}
                                    className={`flex items-center gap-3 px-4 py-4 rounded-xl border text-sm font-medium transition-all ${
                                        formData.role === value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                                    {label}
                                    {formData.role === value && <CheckCircle2 className="w-4 h-4 ml-auto text-blue-500" />}
                                </button>
                            ))}
                        </div>
                        {errors.role && <p className="mt-1.5 text-xs text-red-500">{errors.role}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
                            <input
                                id="email" name="email" type="email" autoComplete="email"
                                value={formData.email} onChange={handleInputChange}
                                placeholder="you@example.com"
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
                                id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                                value={formData.password} onChange={handleInputChange}
                                placeholder="Your password"
                                className={`w-full pl-10 pr-10 py-3.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                                    errors.password ? 'border-red-300 bg-red-50/50' : 'border-slate-200 focus:border-blue-500 hover:border-slate-300'
                                }`}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit" disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-500 text-white py-3.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-1"
                    >
                        {isLoading ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Signing in</span></>
                        ) : (
                            <><span>Sign In</span><ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-5">
                    No account?{' '}
                    <button onClick={() => navigate('/sign-up')} className="font-semibold text-blue-600 hover:text-blue-700">Create one</button>
                </p>
            </div>


        </div>
    );
};

export default SignIn;
