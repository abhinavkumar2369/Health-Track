import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const customStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scaleX {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  
  .animate-scaleX {
    animation: scaleX 1s ease-out forwards;
  }
  
  .animation-delay-300 {
    animation-delay: 0.3s;
  }
  
  .animation-delay-600 {
    animation-delay: 0.6s;
  }
  
  .animation-delay-900 {
    animation-delay: 0.9s;
  }
  
  .animation-delay-1000 {
    animation-delay: 1s;
  }
  
  .animation-delay-1200 {
    animation-delay: 1.2s;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
`;

const HospitalIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z"/>
        <path d="M13 8h-2v2H9v2h2v2h2v-2h2v-2h-2V8z" fill="white"/>
    </svg>
);

const DoctorIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 16.5c0 .83-.67 1.5-1.5 1.5h-9c-.83 0-1.5-.67-1.5-1.5V11h2v1.5h7V11h2v7.5z"/>
        <path d="M12 6c-1.66 0-3 1.34-3 3v3c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V9c0-1.66-1.34-3-3-3z"/>
    </svg>
);

const PatientIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
);

const StethoscopeIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 8c-1.1 0-2 .9-2 2v.38L14.5 8.5c-.35-.35-.85-.5-1.35-.5-.5 0-.99.15-1.35.5L10 10.29c-.35.35-.5.85-.5 1.35s.15.99.5 1.35L12.64 15c.71.71 1.87.71 2.58 0L17 13.22V14c0 1.1.9 2 2 2s2-.9 2-2v-4c0-1.1-.9-2-2-2zm-5.91 8.15l-2.64-2.64c-.18-.18-.18-.47 0-.65l1.79-1.79c.18-.18.47-.18.65 0l2.64 2.64c.18.18.18.47 0 .65l-1.79 1.79c-.18.18-.47.18-.65 0z"/>
    </svg>
);

const HeartMonitorIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.5 6c-1.31 0-2.37.7-3.5 1.93C14.87 6.7 13.81 6 12.5 6s-2.37.7-3.5 1.93C7.87 6.7 6.81 6 5.5 6 3.01 6 1 8.01 1 10.5c0 .54.14 1.08.36 1.56l8.14 8.14 8.14-8.14c.22-.48.36-1.02.36-1.56C23 8.01 20.99 6 19.5 6z"/>
        <path d="M3 13h2l2-4 2 8 2-10 2 6h6" fill="none" stroke="white" strokeWidth="2"/>
    </svg>
);

const SecurityIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.1 16,12.7V16.7C16,17.3 15.4,17.9 14.8,17.9H9.2C8.6,17.9 8,17.3 8,16.7V12.7C8,12.1 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
    </svg>
);

const ChartIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/>
    </svg>
);

const PrescriptionIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        <path d="M16 11H8v2h8v-2zm0 4H8v2h8v-2z" fill="white"/>
    </svg>
);

const LabIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9,2V8H7.5A2.5,2.5 0 0,0 5,10.5V11.5A2.5,2.5 0 0,0 7.5,14H9V22H15V14H16.5A2.5,2.5 0 0,0 19,11.5V10.5A2.5,2.5 0 0,0 16.5,8H15V2H9M11,4H13V8H11V4M7.5,10H16.5A0.5,0.5 0 0,1 17,10.5V11.5A0.5,0.5 0 0,1 16.5,12H7.5A0.5,0.5 0 0,1 7,11.5V10.5A0.5,0.5 0 0,1 7.5,10Z"/>
    </svg>
);

const AIIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.5 14.33C18.29 14.33 18.96 14.7 19.38 15.28L21.1 13.57C21.91 12.76 21.91 11.45 21.1 10.64L19.38 8.92C18.96 9.5 18.29 9.87 17.5 9.87C16.12 9.87 15 8.75 15 7.37C15 6.58 15.37 5.91 15.95 5.49L14.24 3.78C13.43 2.97 12.12 2.97 11.31 3.78L9.59 5.5C10.17 5.92 10.54 6.59 10.54 7.38C10.54 8.76 9.42 9.88 8.04 9.88C7.25 9.88 6.58 9.51 6.16 8.93L4.45 10.65C3.64 11.46 3.64 12.77 4.45 13.58L6.17 15.3C6.59 14.72 7.26 14.35 8.05 14.35C9.43 14.35 10.55 15.47 10.55 16.85C10.55 17.64 10.18 18.31 9.6 18.73L11.32 20.45C12.13 21.26 13.44 21.26 14.25 20.45L15.97 18.73C15.39 18.31 15.02 17.64 15.02 16.85C15.02 15.47 16.14 14.35 17.52 14.35M12.04 15.5C10.89 15.5 9.96 14.57 9.96 13.42C9.96 12.27 10.89 11.34 12.04 11.34C13.19 11.34 14.12 12.27 14.12 13.42C14.12 14.57 13.19 15.5 12.04 15.5Z"/>
    </svg>
);

const RocketIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
            <linearGradient id="rg1" x1="0" x2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
        </defs>

        <path d="M12 2c1.2.1 3.6 1.8 6 4.2 2.4 2.4 4.1 4.8 4.2 6-.1 1.2-1.8 3.6-4.2 6-2.4 2.4-4.8 4.1-6 4.2-1.2-.1-3.6-1.8-6-4.2C3.4 20 1.7 17.6 1.6 16.4c.1-1.2 1.8-3.6 4.2-6C8.2 7.8 10.8 2.1 12 2z" fill="url(#rg1)"/>

        <circle cx="12" cy="9" r="1.6" fill="#ffffff" opacity="0.95" />

        <path d="M6 18c1 1 3 1.5 6 1.5s5-0.5 6-1.5" stroke="#0f766e" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95" />
    </svg>
);

function Homepage() {
    const navigate = useNavigate();
    const [activeRole, setActiveRole] = useState('overview');
    const [isVisible, setIsVisible] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = {
        hospitals: [
            { 
                icon: <DoctorIcon />, 
                title: 'Doctor Management', 
                desc: 'Add and manage healthcare professionals with comprehensive profiles',
                color: 'from-blue-500 to-blue-600'
            },
            { 
                icon: <PatientIcon />, 
                title: 'Patient Management', 
                desc: 'Comprehensive patient registration and tracking system',
                color: 'from-green-500 to-green-600'
            },
            { 
                icon: <ChartIcon />, 
                title: 'Data Visualization', 
                desc: 'Disease trends, statistics and healthcare analytics dashboard',
                color: 'from-purple-500 to-purple-600'
            },
            { 
                icon: <HospitalIcon />, 
                title: 'Hospital Administration', 
                desc: 'Complete facility management and operational control',
                color: 'from-red-500 to-red-600'
            }
        ],
        doctors: [
            { 
                icon: <PrescriptionIcon />, 
                title: 'Patient Records', 
                desc: 'Create and manage comprehensive patient medical records',
                color: 'from-teal-500 to-teal-600'
            },
            { 
                icon: <PrescriptionIcon />, 
                title: 'Prescription Management', 
                desc: 'Digital prescription and medication tracking system',
                color: 'from-orange-500 to-orange-600'
            },
            { 
                icon: <LabIcon />, 
                title: 'Lab Integration', 
                desc: 'Seamless laboratory report integration and analysis',
                color: 'from-pink-500 to-pink-600'
            },
            { 
                icon: <AIIcon />, 
                title: 'AI Scheduling', 
                desc: 'Intelligent appointment scheduling with optimization',
                color: 'from-indigo-500 to-indigo-600'
            }
        ],
        patients: [
            { 
                icon: <HeartMonitorIcon />, 
                title: 'Personal Health Record', 
                desc: 'Complete digital health history and medical timeline',
                color: 'from-emerald-500 to-emerald-600'
            },
            { 
                icon: <SecurityIcon />, 
                title: 'Insurance Integration', 
                desc: 'Seamless insurance claim processing and coverage tracking',
                color: 'from-cyan-500 to-cyan-600'
            },
            { 
                icon: <StethoscopeIcon />, 
                title: 'Vaccination Tracking', 
                desc: 'Immunization history and automated reminder system',
                color: 'from-violet-500 to-violet-600'
            },
            { 
                icon: <HeartMonitorIcon />, 
                title: 'Health Monitoring', 
                desc: 'BMI reports, vital signs and continuous health tracking',
                color: 'from-rose-500 to-rose-600'
            },
            { 
                icon: <PrescriptionIcon />, 
                title: 'Emergency Reports', 
                desc: 'Quick access health summaries for emergency situations',
                color: 'from-amber-500 to-amber-600'
            },
            { 
                icon: <AIIcon />, 
                title: 'Risk Assessment', 
                desc: 'AI-powered disease prediction and risk scoring algorithms',
                color: 'from-lime-500 to-lime-600'
            },
            { 
                icon: <ChartIcon />, 
                title: 'Health Recommendations', 
                desc: 'Personalized health tips and lifestyle guidance',
                color: 'from-sky-500 to-sky-600'
            },
            { 
                icon: <SecurityIcon />, 
                title: 'Allergy Management', 
                desc: 'Comprehensive allergy tracking and alert system',
                color: 'from-fuchsia-500 to-fuchsia-600'
            }
        ]
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100 relative overflow-hidden">

            {/* Enhanced Modern Header - Fixed on Mobile */}
            <header className={`fixed md:sticky top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/98 backdrop-blur-lg shadow-lg border-b border-blue-100/80' : 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-blue-100/60'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-[4.5rem] md:h-[5.5rem]">
                        {/* Left: Enhanced logo + name */}
                        <div className="flex items-center gap-4 group">
                            <div className="relative">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                    <HospitalIcon />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-75 animate-pulse"></div>
                            </div>
                            <div className="group-hover:translate-x-1 transition-transform duration-300">
                                <h1 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">Health Track</h1>
                                
                            </div>
                        </div>

                        {/* Desktop Navigation intentionally removed per request (keeps header minimal) */}

                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-3">
                                <button 
                                    onClick={() => navigate('/signin')}
                                    className="text-sm px-5 py-2.5 rounded-xl font-medium text-blue-700 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-sm"
                                >
                                    Sign In
                                </button>
                                <button 
                                    onClick={() => navigate('/signup')}
                                    className="text-sm px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-blue-200"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Modern Split Layout Hero Section */}
            <section className="relative min-h-[100vh] md:min-h-[90vh] bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden flex justify-center items-center pt-[4.5rem] md:pt-0">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    {/* Geometric Background */}
                    <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
                    
                    {/* Floating Orbs */}
                    <div className="hidden sm:block absolute top-20 left-6 sm:left-20 w-56 sm:w-72 h-56 sm:h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="hidden sm:block absolute bottom-28 sm:bottom-40 right-4 sm:right-10 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-400/15 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center min-h-[65vh] md:min-h-[75vh] py-8 sm:py-12 md:py-16">
                        {/* Left Content */}
                        <div className="space-y-4 sm:space-y-6 md:space-y-8">
                            {/* Status Badge */}
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span>🎓 Final Year Project</span>
                            </div>
                            
                            {/* Main Headline */}
                            <div className="space-y-3 sm:space-y-4">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                                    The Future of
                                    <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        Healthcare Management
                                    </span>
                                </h1>
                                <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
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
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 md:px-8 md:py-4 rounded-2xl font-semibold text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group w-full sm:w-auto sm:min-w-[280px] justify-center"
                                >
                                    <span>Get Started</span>
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                                <button aria-label="Watch Demo" className="inline-flex items-center gap-3 border-2 border-gray-300 text-gray-700 px-6 py-4 md:px-8 md:py-4 rounded-2xl font-semibold text-base hover:border-blue-300 hover:text-blue-600 transition-all duration-300 group w-full sm:w-auto sm:min-w-[280px] justify-center">
                                    {/* Simple filled play-in-circle icon (dark filled, inherits color) */}
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
                            <div className="relative bg-white rounded-2xl shadow-2xl p-4 sm:p-6 transform rotate-1 sm:rotate-3 hover:rotate-0 transition-transform duration-500">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg"></div>
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
                                        <div className="bg-blue-50 rounded-xl p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                                    <PatientIcon />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-600">Patients</div>
                                                    <div className="text-xl font-bold text-blue-600">2,847</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-indigo-50 rounded-xl p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                                                    <DoctorIcon />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-600">Doctors</div>
                                                    <div className="text-xl font-bold text-indigo-600">124</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Chart Area */}
                                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="font-semibold text-gray-800">Patient Flow</span>
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        </div>
                                        <div className="h-20 sm:h-24 bg-gradient-to-r from-blue-200 to-indigo-300 rounded-lg flex items-end justify-center">
                                            <div className="text-xs text-gray-600 mb-2">Real-time Analytics</div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Items */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                            <span className="text-sm text-green-700">New appointment scheduled</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                                            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                                            <span className="text-sm text-yellow-700">Lab results pending review</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Floating Elements - Adjusted for smaller mockup */}
                            <div className="hidden sm:flex absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-xl rotate-12 items-center justify-center">
                                <HeartMonitorIcon />
                            </div>
                            <div className="hidden sm:flex absolute -bottom-3 -left-3 w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg shadow-lg -rotate-12 items-center justify-center">
                                <SecurityIcon />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Powerful Features Overview */}
            <section className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-blue-50 relative">
                <div className="max-w-7xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                            Complete Healthcare Platform
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Everything you need to modernize
                            <span className="text-blue-600 block">healthcare delivery</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            From patient registration to AI-powered diagnostics, Health Track provides comprehensive tools for every healthcare stakeholder.
                        </p>
                    </div>
                    
                    {/* Feature Categories */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                        {/* For Hospitals */}
                        <div className="group bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-blue-100">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
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
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Resource Optimization</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Financial Analytics</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* For Doctors */}
                        <div className="group bg-gradient-to-br from-emerald-50 to-teal-100 rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-emerald-100">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <DoctorIcon />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Doctors</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">AI-enhanced clinical tools for better diagnoses and patient care.</p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Smart Medical Records</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">AI Diagnostic Support</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Prescription Management</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* For Patients */}
                        <div className="group bg-gradient-to-br from-purple-50 to-pink-100 rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-purple-100">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <PatientIcon />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Patients</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">Personalized health insights and seamless healthcare access.</p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Personal Health Records</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Health Monitoring</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Smart Recommendations</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Cutting-Edge Healthcare Technology
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Advanced features that set HDIMS apart from traditional healthcare systems
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {/* Row 1 - Core System Features */}
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
                        
                        {/* Row 2 - Management Features */}
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

            <section className="py-20 sm:py-28 lg:py-36 pb-24 lg:pb-48 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
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
                        <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
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
                            <div className="flex text-blue-400">
                                <span className="text-sm font-semibold bg-blue-100 px-3 py-1 rounded-full">React + Node.js</span>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
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
                            <div className="flex text-indigo-400">
                                <span className="text-sm font-semibold bg-indigo-100 px-3 py-1 rounded-full">AI/ML Features</span>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
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
                            <div className="flex text-green-400">
                                <span className="text-sm font-semibold bg-green-100 px-3 py-1 rounded-full">Secure Architecture</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            


            <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                        {/* Brand */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">H</span>
                                </div>
                                <span className="text-2xl font-bold">Health Track</span>
                            </div>
                            <p className="text-gray-400 leading-relaxed max-w-md mb-6">
                                Transforming healthcare with intelligent technology, seamless integration, and patient-centered solutions for the digital age.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300 cursor-pointer">
                                    <span className="text-sm">f</span>
                                </div>
                                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300 cursor-pointer">
                                    <span className="text-sm">t</span>
                                </div>
                                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300 cursor-pointer">
                                    <span className="text-sm">in</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Solutions</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Hospital Management</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Clinical Workflow</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Patient Portal</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">AI Analytics</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Mobile Health</a></li>
                            </ul>
                        </div>
    
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Resources</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Documentation</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">API Reference</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Case Studies</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Support</a></li>
                            </ul>
                        </div>
                        
                
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Company</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">About Us</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Careers</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
                        <p className="text-gray-400 text-sm">
                            © 2024  Health-Track.  All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 mt-4 md:mt-0 text-sm text-gray-400">
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