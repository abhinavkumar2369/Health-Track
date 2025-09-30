import { useNavigate } from 'react-router-dom';
import { PatientIcon, DoctorIcon, HeartMonitorIcon, SecurityIcon } from './Icons';

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-[100vh] md:min-h-[90vh] bg-white overflow-hidden flex justify-center items-center pt-[4.5rem] md:pt-0">
            {/* Background Elements */}
            <div className="absolute inset-0">
                {/* Floating Orbs - matching sign-in/sign-up style */}
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
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                                The Future of
                                <span className="block mt-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                    Healthcare Management
                                </span>
                            </h1>
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
                                onClick={() => navigate('/signin')}
                                aria-label="Get Started" 
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-4 md:px-8 md:py-4 rounded-2xl font-semibold text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group w-full sm:w-auto sm:min-w-[280px] justify-center"
                            >
                                <span>Get Started</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </button>
                            <button aria-label="Watch Demo" className="inline-flex items-center gap-3 border-2 border-gray-300 text-gray-700 px-6 py-4 md:px-8 md:py-4 rounded-2xl font-semibold text-base hover:border-blue-300 hover:text-blue-600 hover:bg-white transition-all duration-300 group w-full sm:w-auto sm:min-w-[280px] justify-center">
                                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
                                </svg>
                                <span>Watch Demo</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Visual */}
                    <div className="relative w-full max-w-[20rem] sm:max-w-md mx-auto">
                        {/* Main Dashboard Mockup - Wider Size */}
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
                        
                        {/* Floating Elements - Adjusted for smaller mockup */}
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
    );
};

export default HeroSection;
