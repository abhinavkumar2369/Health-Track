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
            <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/98 backdrop-blur-lg shadow-lg border-b border-gray-100' : 'bg-white/95 backdrop-blur-sm shadow-none border-b border-transparent'}`}>
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
            <section className="relative min-h-[100vh] md:min-h-[90vh] bg-white overflow-hidden flex justify-center items-center pt-[4.5rem] md:pt-[6rem]">
                {/* Background Decorative Elements */}
                <div className="absolute inset-0">
                    <div className="hidden sm:block absolute top-20 left-6 sm:left-20 w-56 sm:w-72 h-56 sm:h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="hidden sm:block absolute bottom-28 sm:bottom-40 right-4 sm:right-10 w-72 sm:w-96 h-72 sm:h-96 bg-green-200/25 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center min-h-[65vh] md:min-h-[75vh] py-8 sm:py-12 md:py-16">
                        {/* Left Content */}
                        <div className="space-y-4 sm:space-y-6 md:space-y-8">
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
                        {/* Right Visual - Enhanced Dashboard Mockup */}
                        <div className="relative w-full max-w-[19rem] sm:max-w-[26rem] mx-auto ml-8 sm:ml-16 lg:ml-32">
                          <div className="bg-gradient-to-r from-[#3b82f6] to-[#22c55e] rounded-3xl p-[1px]">
                            <div className="bg-[#fefdff] rounded-3xl p-3 sm:p-4 backdrop-blur-sm">
                              {/* Modern Header with Glassmorphism */}
                              <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-gray-300">
                                  <div className="flex items-center gap-3">
                                      <div className="w-8.5 h-8.5 bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 rounded-xl shadow-lg flex items-center justify-center">
                                          <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                      </div>
                                      <div>
                                          <span className="font-bold text-gray-900 text-sm">Health Track</span>
                                          <div className="flex items-center gap-1 mt-0.5">
                                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                              <span className="text-xs text-green-600 font-medium">Live</span>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="flex gap-1.5">
                                      <div className="w-2.5 h-2.5 bg-red-400 rounded-full hover:scale-110 transition-transform cursor-pointer"></div>
                                      <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full hover:scale-110 transition-transform cursor-pointer"></div>
                                      <div className="w-2.5 h-2.5 bg-green-400 rounded-full hover:scale-110 transition-transform cursor-pointer"></div>
                                  </div>
                              </div>
                              
                              {/* Enhanced Dashboard Content */}
                              <div className="space-y-3">
                                  {/* Modern Stats Cards with Animations */}
                                  <div className="grid grid-cols-2 gap-2.5">
                                      <div className="group relative bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-3 hover:-translate-y-1 overflow-hidden transition-all duration-300">
                                          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                                          <div className="relative z-10">
                                              <div className="flex items-center justify-between mb-2">
                                                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                                      <Heart className="w-4 h-4 text-white" fill="white" strokeWidth={2} />
                                                  </div>
                                                  <span className="text-xs font-semibold text-white/80">+12%</span>
                                              </div>
                                              <div className="text-xs text-white/90 font-medium mb-1">Total Patients</div>
                                              <div className="text-2xl font-bold text-white">2,847</div>
                                          </div>
                                      </div>
                                      
                                      <div className="group relative bg-gradient-to-br from-green-400 to-green-500 rounded-2xl p-3 hover:-translate-y-1 overflow-hidden transition-all duration-300">
                                          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                                          <div className="relative z-10">
                                              <div className="flex items-center justify-between mb-2">
                                                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                                      <Stethoscope className="w-4 h-4 text-white" strokeWidth={2} />
                                                  </div>
                                                  <span className="text-xs font-semibold text-white/80">+8</span>
                                              </div>
                                              <div className="text-xs text-white/90 font-medium mb-1">Active Doctors</div>
                                              <div className="text-2xl font-bold text-white">124</div>
                                          </div>
                                      </div>
                                  </div>
                                  
                                  {/* Sophisticated Chart Area */}
                                  <div className="bg-white rounded-2xl p-3.5 border border-gray-300">
                                      <div className="flex items-center justify-between mb-3">
                                          <div>
                                              <span className="font-bold text-gray-900 text-sm">Patient Analytics</span>
                                              <p className="text-xs text-gray-500 mt-0.5">Weekly Overview</p>
                                          </div>
                                          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
                                              <Activity className="w-3 h-3 text-green-600" strokeWidth={2.5} />
                                              <span className="text-xs font-semibold text-green-700">Active</span>
                                          </div>
                                      </div>
                                      <div className="h-16 relative">
                                          {/* Animated Bar Chart */}
                                          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2 h-full">
                                              <div className="flex-1 bg-gradient-to-t from-blue-400 to-blue-300 rounded-t-lg transition-all duration-500" style={{height: '45%'}}></div>
                                              <div className="flex-1 bg-gradient-to-t from-green-400 to-green-300 rounded-t-lg transition-all duration-500" style={{height: '70%'}}></div>
                                              <div className="flex-1 bg-gradient-to-t from-blue-400 to-blue-300 rounded-t-lg transition-all duration-500" style={{height: '55%'}}></div>
                                              <div className="flex-1 bg-gradient-to-t from-green-400 to-green-300 rounded-t-lg transition-all duration-500" style={{height: '85%'}}></div>
                                              <div className="flex-1 bg-gradient-to-t from-blue-400 to-blue-300 rounded-t-lg transition-all duration-500" style={{height: '65%'}}></div>
                                              <div className="flex-1 bg-gradient-to-t from-green-400 to-green-300 rounded-t-lg transition-all duration-500" style={{height: '95%'}}></div>
                                              <div className="flex-1 bg-gradient-to-t from-blue-400 to-blue-300 rounded-t-lg transition-all duration-500" style={{height: '75%'}}></div>
                                          </div>
                                      </div>
                                      <div className="flex items-center justify-center gap-4 mt-3 pt-2.5 border-t border-gray-200">
                                          <div className="flex items-center gap-1.5">
                                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                              <span className="text-xs text-gray-600">Visits</span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                              <span className="text-xs text-gray-600">Checkups</span>
                                          </div>
                                      </div>
                                  </div>
                                  
                                  {/* Modern Activity Feed */}
                                  <div className="space-y-2">
                                      <div className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 hover:border-green-200 transition-all duration-300">
                                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                              </svg>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                              <span className="text-xs font-semibold text-green-800 block">Appointment Confirmed</span>
                                              <span className="text-xs text-green-600">Dr. Sarah • 2:30 PM</span>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-200 transition-all duration-300">
                                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                              <FlaskConical className="w-4 h-4 text-white" strokeWidth={2.5} />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                              <span className="text-xs font-semibold text-blue-800 block">Lab Results Ready</span>
                                              <span className="text-xs text-blue-600">Blood Test • Review Now</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                            </div>
                          </div>
                            
                            {/* Removed glow effect */}
                        </div>
                    </div>
                </div>
            </section>
            
            {/* ========================================
                FEATURES OVERVIEW SECTION
                ======================================== */}
            <section className="py-20 sm:py-28 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white relative">
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
            <section className="py-20 sm:py-28 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white">
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
                FOOTER SECTION
                ======================================== */}
            <footer className="bg-white  py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
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
