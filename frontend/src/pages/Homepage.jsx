import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Building2, 
    Stethoscope, 
    Heart, 
    Activity, 
    Shield, 
    TrendingUp,
    FileText,
    FlaskConical,
    Brain
} from 'lucide-react';

/* ========================================
   ICON COMPONENTS
   ======================================== */

const HospitalIcon = () => (
    <Building2 className="w-8 h-8 text-white" strokeWidth={2.5} />
);

const DoctorIcon = () => (
    <Stethoscope className="w-8 h-8 text-white" strokeWidth={2.5} />
);

const PatientIcon = () => (
    <Heart className="w-8 h-8 text-white" strokeWidth={2.5} fill="white" />
);

const HeartMonitorIcon = () => (
    <Activity className="w-full h-full" strokeWidth={2} />
);

const SecurityIcon = () => (
    <Shield className="w-full h-full" strokeWidth={2} />
);

const ChartIcon = () => (
    <TrendingUp className="w-full h-full" strokeWidth={2} />
);

const PrescriptionIcon = () => (
    <FileText className="w-full h-full" strokeWidth={2} />
);

const LabIcon = () => (
    <FlaskConical className="w-full h-full" strokeWidth={2} />
);

const AIIcon = () => (
    <Brain className="w-full h-full" strokeWidth={2} />
);

/* ========================================
   MAIN HOMEPAGE COMPONENT
   ======================================== */

function Homepage() {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">

            {/* ========================================
                HEADER SECTION
                ======================================== */}
            <header className={`fixed md:sticky top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/98 backdrop-blur-lg shadow-lg border-b border-gray-100' : 'bg-white/95 backdrop-blur-sm shadow-none border-b border-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-[4.5rem] md:h-[5.5rem]">
                        {/* Logo */}
                        <div className="flex items-center gap-4 group">
                            <div className="relative">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                    <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="group-hover:translate-x-1 transition-transform duration-300">
                                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-green-700 transition-all duration-300">Health Track</h1>
                            </div>
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-3">
                                <button 
                                    onClick={() => navigate('/sign-in')}
                                    className="text-sm px-5 py-2.5 rounded-xl font-medium text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-300 hover:scale-105"
                                >
                                    Sign In
                                </button>
                                <button 
                                    onClick={() => navigate('/sign-up')}
                                    className="text-sm px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            {/* ========================================
                HERO SECTION
                ======================================== */}
            <section className="relative min-h-[100vh] md:min-h-[90vh] bg-white overflow-hidden flex justify-center items-center pt-[4.5rem] md:pt-0">
                {/* Background Decorative Elements */}
                <div className="absolute inset-0">
                    <div className="hidden sm:block absolute top-20 left-6 sm:left-20 w-56 sm:w-72 h-56 sm:h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="hidden sm:block absolute bottom-28 sm:bottom-40 right-4 sm:right-10 w-72 sm:w-96 h-72 sm:h-96 bg-green-200/25 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center min-h-[65vh] md:min-h-[75vh] py-8 sm:py-12 md:py-16">
                        {/* Left Content */}
                        <div className="space-y-4 sm:space-y-6 md:space-y-8">
                            {/* Status Badge */}
                            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 shadow-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>🎓 Final Year Project</span>
                            </div>
                            
                            {/* Main Headline */}
                            <div className="space-y-3 sm:space-y-4">
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                                    The Future of
                                    <span className="block mt-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                        Healthcare Management
                                    </span>
                                </h2>
                                <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-green-600 rounded-full"></div>
                            </div>
                            
                            {/* Description */}
                            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                                Revolutionize healthcare with our intelligent platform that seamlessly integrates 
                                patient care, clinical workflows, and data analytics for superior medical outcomes.
                            </p>
                            
                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button 
                                    onClick={() => navigate('/sign-in')}
                                    aria-label="Get Started" 
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group w-auto justify-center"
                                >
                                    <span>Get Started</span>
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                                <button 
                                    aria-label="Watch Demo" 
                                    className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold text-sm hover:border-blue-300 hover:text-blue-600 hover:bg-white transition-all duration-300 group w-auto justify-center"
                                >
                                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
                                    </svg>
                                    <span>Watch Demo</span>
                                </button>
                            </div>
                        </div>

                        {/* Right Visual - Dashboard Mockup */}
                        <div className="relative w-full max-w-[20rem] sm:max-w-md mx-auto">
                            <div className="relative bg-white rounded-2xl shadow-2xl p-4 sm:p-6 transform rotate-1 sm:rotate-3 hover:rotate-0 transition-transform duration-500 border border-gray-100">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg"></div>
                                        <span className="font-bold text-gray-900">Health Track</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    </div>
                                </div>
                                
                                {/* Dashboard Content */}
                                <div className="space-y-4">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                                    <PatientIcon />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-600">Patients</div>
                                                    <div className="text-xl font-bold text-blue-600">2,847</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                                    <DoctorIcon />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-600">Doctors</div>
                                                    <div className="text-xl font-bold text-green-600">124</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Chart Area */}
                                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="font-semibold text-gray-800">Patient Flow</span>
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        </div>
                                        <div className="h-20 sm:h-24 bg-gradient-to-r from-blue-200 to-green-200 rounded-lg flex items-end justify-center">
                                            <div className="text-xs text-gray-600 mb-2">Real-time Analytics</div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Items */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                            <span className="text-sm text-green-700">New appointment scheduled</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm text-blue-700">Lab results pending review</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Floating Accent Elements */}
                            <div className="hidden sm:flex absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl shadow-xl rotate-12 items-center justify-center">
                                <HeartMonitorIcon />
                            </div>
                            <div className="hidden sm:flex absolute -bottom-3 -left-3 w-14 h-14 bg-gradient-to-br from-green-400 to-green-500 rounded-lg shadow-lg -rotate-12 items-center justify-center">
                                <SecurityIcon />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* ========================================
                FEATURES OVERVIEW SECTION
                ======================================== */}
            <section className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-white relative">
                <div className="max-w-7xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-green-50 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gray-200">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-full animate-pulse"></div>
                            Complete Healthcare Platform
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Everything you need to modernize
                            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent block">healthcare delivery</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            From patient registration to AI-powered diagnostics, Health Track provides comprehensive tools for every healthcare stakeholder.
                        </p>
                    </div>
                    
                    {/* Feature Categories */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                        {/* For Hospitals */}
                        <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-blue-200">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <HospitalIcon />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Hospitals</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">Complete administrative control with advanced analytics and streamlined operations.</p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Doctor & Staff Management</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Resource Optimization</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-700 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Financial Analytics</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* For Doctors */}
                        <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-green-200">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <DoctorIcon />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Doctors</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">AI-enhanced clinical tools for better diagnoses and patient care.</p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Smart Medical Records</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                    <span className="text-sm text-gray-700">AI Diagnostic Support</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-700 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Prescription Management</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* For Patients */}
                        <div className="group bg-gradient-to-br from-red-50 to-rose-100 rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-rose-200">
                            <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <PatientIcon />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Patients</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">Personalized health insights and seamless healthcare access.</p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Personal Health Records</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Health Monitoring</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-rose-600 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Smart Recommendations</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================
                TECHNOLOGY FEATURES SECTION
                ======================================== */}
            <section className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Cutting-Edge Healthcare Technology
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Advanced features that set Health Track apart from traditional healthcare systems
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {/* Core System Features */}
                        <div className="group bg-gradient-to-br from-emerald-50 to-teal-100 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-emerald-200">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 text-white">
                                <SecurityIcon />
                            </div>
                            <h4 className="text-lg font-bold mb-2 text-gray-900">JWT Security</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">Advanced token-based authentication with multi-layer security</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-blue-200">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 text-white">
                                <PrescriptionIcon />
                            </div>
                            <h4 className="text-lg font-bold mb-2 text-gray-900">Smart EHR</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">Intelligent Electronic Health Records with predictive analytics</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-purple-50 to-violet-100 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-purple-200">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 text-white">
                                <AIIcon />
                            </div>
                            <h4 className="text-lg font-bold mb-2 text-gray-900">AI Diagnostics</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">Machine learning-powered diagnostic assistance and insights</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-orange-50 to-red-100 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-orange-200">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 text-white">
                                <ChartIcon />
                            </div>
                            <h4 className="text-lg font-bold mb-2 text-gray-900">Smart Analytics</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">Real-time health data visualization and trend analysis</p>
                        </div>
                        
                        {/* Management Features */}
                        <div className="group bg-gradient-to-br from-cyan-50 to-blue-100 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-cyan-200">
                            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 text-white">
                                <HospitalIcon />
                            </div>
                            <h4 className="text-lg font-bold mb-2 text-gray-900">Hospital Admin</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">Complete facility management with operational intelligence</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-teal-50 to-emerald-100 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-teal-200">
                            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 text-white">
                                <DoctorIcon />
                            </div>
                            <h4 className="text-lg font-bold mb-2 text-gray-900">Doctor Portal</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">Comprehensive clinical workflow and patient management</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-pink-50 to-rose-100 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-pink-200">
                            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 text-white">
                                <PatientIcon />
                            </div>
                            <h4 className="text-lg font-bold mb-2 text-gray-900">Patient Care</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">Personalized health management and care coordination</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-yellow-50 to-amber-100 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-yellow-200">
                            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 text-white">
                                <LabIcon />
                            </div>
                            <h4 className="text-lg font-bold mb-2 text-gray-900">Lab Integration</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">Seamless laboratory systems and diagnostic reporting</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================
                ACADEMIC PROJECT SECTION
                ======================================== */}
            <section className="py-20 sm:py-28 lg:py-36 pb-24 lg:pb-48 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Academic Project Showcase
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Developed as part of Final Year Project, demonstrating modern healthcare technology solutions
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-blue-100">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-bold text-gray-900">Full Stack Development</h4>
                                    <p className="text-gray-600 text-sm">Frontend & Backend</p>
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Built with React.js frontend and Node.js backend, featuring modern UI components and robust API architecture for seamless healthcare management.
                            </p>
                            <div className="flex">
                                <span className="text-sm font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">React + Node.js</span>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-green-100">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-bold text-gray-900">AI Integration</h4>
                                    <p className="text-gray-600 text-sm">Machine Learning</p>
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Incorporates AI-powered features for patient diagnosis assistance, health analytics, and predictive healthcare insights using modern ML algorithms.
                            </p>
                            <div className="flex">
                                <span className="text-sm font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">AI/ML Features</span>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-rose-200">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-bold text-gray-900">Security & Privacy</h4>
                                    <p className="text-gray-600 text-sm">Data Protection</p>
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Implements robust security measures including JWT authentication, encrypted data storage, and role-based access control for healthcare data protection.
                            </p>
                            <div className="flex">
                                <span className="text-sm font-semibold bg-rose-200 text-rose-700 px-3 py-1 rounded-full">Secure Architecture</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================
                FOOTER SECTION
                ======================================== */}
            <footer className="bg-white border-t border-gray-200 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                        {/* Brand */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Health Track</span>
                            </div>
                            <p className="text-gray-600 leading-relaxed max-w-md mb-6">
                                Transforming healthcare with intelligent technology, seamless integration, and patient-centered solutions for the digital age.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 cursor-pointer text-blue-600">
                                    <span className="text-sm">f</span>
                                </div>
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 cursor-pointer text-blue-600">
                                    <span className="text-sm">t</span>
                                </div>
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 cursor-pointer text-blue-600">
                                    <span className="text-sm">in</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-gray-900">Solutions</h4>
                            <ul className="space-y-3 text-gray-600">
                                <li><a href="#" className="hover:text-blue-600 transition-colors duration-300">Hospital Management</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors duration-300">Clinical Workflow</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors duration-300">Patient Portal</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors duration-300">AI Analytics</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors duration-300">Mobile Health</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-gray-900">Resources</h4>
                            <ul className="space-y-3 text-gray-600">
                                <li><a href="#" className="hover:text-blue-600 transition-colors duration-300">Documentation</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors duration-300">API Reference</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors duration-300">Case Studies</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors duration-300">Support</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-gray-900">Company</h4>
                            <ul className="space-y-3 text-gray-600">
                                <li><a href="#" className="hover:text-blue-600 transition-colors duration-300">About Us</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors duration-300">Careers</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors duration-300">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors duration-300">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors duration-300">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between">
                        <p className="text-gray-600 text-sm">
                            © 2025-26 Health-Track. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 mt-4 md:mt-0 text-sm text-gray-600">
                            <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                System Operational
                            </span>
                            <span>Version 1.0.0</span>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
}

export default Homepage;
