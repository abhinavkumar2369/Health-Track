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
            setIsScrolled(window.scrollY > 24);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { label: 'Platform', href: '#platform' },
        { label: 'Features', href: '#platform' },
        { label: 'Intelligence', href: '#insights' },
        { label: 'Trust', href: '#trust' }
    ];

    const capabilityCards = [
        {
            title: 'Unified Operations Hub',
            description: 'Orchestrate appointments, bed capacity, pharmacy, and billing in a single live command center.',
            background: 'from-blue-50 to-blue-100',
            border: 'border-blue-200',
            pill: 'Hospitals',
            icon: HospitalIcon
        },
        {
            title: 'Clinician Workspace',
            description: 'Surface contextual patient stories, AI scribes, and smart orders without switching tabs.',
            background: 'from-emerald-50 to-teal-100',
            border: 'border-emerald-200',
            pill: 'Doctors',
            icon: DoctorIcon
        },
        {
            title: 'Patient Companion',
            description: 'Give patients proactive nudges, transparent results, and virtual follow-ups in one secure app.',
            background: 'from-rose-50 to-orange-100',
            border: 'border-rose-200',
            pill: 'Patients',
            icon: PatientIcon
        },
        {
            title: 'Insight Automation',
            description: 'Blend clinical, operational, and financial signals to highlight bottlenecks before they happen.',
            background: 'from-violet-50 to-slate-100',
            border: 'border-violet-200',
            pill: 'Leadership',
            icon: ChartIcon
        }
    ];

    const journeySteps = [
        {
            title: 'Connected Intake',
            description: 'Digital registration, eligibility checks, and AI coding suggestions happen before arrival.',
            badge: 'Step 01'
        },
        {
            title: 'Intelligent Care Plan',
            description: 'Multidisciplinary teams collaborate on shared care boards and real-time vitals.',
            badge: 'Step 02'
        },
        {
            title: 'Precision Follow-up',
            description: 'Remote monitoring, medication reminders, and escalations feed physicians instantly.',
            badge: 'Step 03'
        },
        {
            title: 'Revenue & Compliance',
            description: 'Automated documentation, audits, and reimbursement analytics close every loop.',
            badge: 'Step 04'
        }
    ];

    const insightCards = [
        {
            title: 'Zero Trust Security',
            description: 'Role-based encryption, JWT rotation, and anomaly detection shield every identity.',
            icon: SecurityIcon,
            accent: 'from-emerald-500 to-teal-500'
        },
        {
            title: 'Cognitive Diagnostics',
            description: 'AI differentials compare symptoms, labs, and histories to suggest next-best actions.',
            icon: AIIcon,
            accent: 'from-sky-500 to-indigo-500'
        },
        {
            title: 'Interoperable Labs',
            description: 'FHIR-ready lab bridges push structured data and alerts into the clinician workspace.',
            icon: LabIcon,
            accent: 'from-amber-500 to-orange-500'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-gray-900">
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-slate-200' : 'bg-white/70 backdrop-blur-md border-b border-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-[4.5rem] md:h-[5.25rem]">
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
                        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
                            {navItems.map((item) => (
                                <a key={item.label} href={item.href} className="hover:text-slate-900 transition-colors">
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/sign-in')} className="hidden md:inline-flex items-center px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all">
                                Sign In
                            </button>
                            <button onClick={() => navigate('/sign-up')} className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-emerald-500 shadow-lg shadow-blue-500/30 hover:translate-y-[-2px] transition-all">
                                Create Account
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-[4.5rem] sm:pt-[5rem] lg:pt-[5rem]">
                <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 sm:from-slate-950 sm:via-blue-950 sm:to-emerald-900 text-white">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#22d3ee,_transparent_50%)]"></div>
                        <div className="absolute -bottom-20 -left-10 w-80 h-80 bg-emerald-500/10 blur-3xl"></div>
                        <div className="absolute -top-10 -right-10 w-96 h-96 bg-blue-500/10 blur-3xl"></div>
                    </div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-12 sm:py-28 lg:py-22 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <div className="space-y-4 sm:space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/20 text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-200">
                                Next-gen Healthcare OS
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-semibold leading-tight">
                                Design, deliver, and scale care from a single intelligent screen.
                            </h1>
                            <p className="text-base sm:text-base text-slate-200 max-w-xl">
                                Health Track unifies clinical workflows, revenue operations, lab systems, and patient engagement with AI copilots built for regulated healthcare teams.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={() => navigate('/sign-in')} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl sm:rounded-2xl bg-white text-slate-900 font-semibold text-sm shadow-lg shadow-white/20">
                                    Launch Platform
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                                <button className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl border border-white/40 text-sm font-semibold text-white/90 hover:bg-white/10 transition">
                                    Explore Live Demo
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 7v10l6-5-6-5z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="relative flex justify-center mt-8 lg:mt-0">
                            <div className="w-full max-w-sm">
                            <div className="absolute -top-8 -left-6 w-36 h-36 bg-emerald-400/40 blur-3xl"></div>
                            <div className="relative rounded-[24px] border border-white/20 bg-white/5 p-4 backdrop-blur-2xl shadow-2xl">
                                <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
                                    <div>
                                        <p className="text-xs text-white/70 font-medium">Healthcare Dashboard</p>
                                        <p className="text-xl font-semibold mt-1">Live Overview</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        <span className="text-xs text-white/70 font-medium">Active</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    <div className="rounded-xl bg-gradient-to-br from-blue-500/80 to-blue-400/40 p-4 border border-white/10 hover:scale-105 transition-transform">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                                <Heart className="w-4 h-4 text-white" fill="white" strokeWidth={2} />
                                            </div>
                                            <span className="text-xs font-semibold text-white/90 bg-white/20 px-2 py-1 rounded-full">+15%</span>
                                        </div>
                                        <p className="text-xs text-white/90 font-medium mb-1">Active Patients</p>
                                        <p className="text-2xl font-bold text-white">2,847</p>
                                    </div>
                                    <div className="rounded-xl bg-gradient-to-br from-emerald-500/80 to-emerald-400/40 p-4 border border-white/10 hover:scale-105 transition-transform">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                                <Stethoscope className="w-4 h-4 text-white" strokeWidth={2} />
                                            </div>
                                            <span className="text-xs font-semibold text-white/90 bg-white/20 px-2 py-1 rounded-full">+8</span>
                                        </div>
                                        <p className="text-xs text-white/90 font-medium mb-1">Doctors Online</p>
                                        <p className="text-2xl font-bold text-white">124</p>
                                    </div>
                                </div>
                                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="font-semibold text-white text-sm">Weekly Analytics</p>
                                            <p className="text-xs text-white/60 mt-0.5">Patient flow trends</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30">
                                            <Activity className="w-3 h-3 text-emerald-300" strokeWidth={2.5} />
                                            <span className="text-xs font-semibold text-emerald-200">Trending Up</span>
                                        </div>
                                    </div>
                                    <div className="h-16 relative mb-3">
                                        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2 h-full">
                                            <div className="flex-1 bg-gradient-to-t from-blue-400 to-blue-300 rounded-t-lg transition-all duration-500 hover:from-blue-300 hover:to-blue-200" style={{height: '50%'}}></div>
                                            <div className="flex-1 bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-lg transition-all duration-500 hover:from-emerald-300 hover:to-emerald-200" style={{height: '75%'}}></div>
                                            <div className="flex-1 bg-gradient-to-t from-blue-400 to-blue-300 rounded-t-lg transition-all duration-500 hover:from-blue-300 hover:to-blue-200" style={{height: '60%'}}></div>
                                            <div className="flex-1 bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-lg transition-all duration-500 hover:from-emerald-300 hover:to-emerald-200" style={{height: '90%'}}></div>
                                            <div className="flex-1 bg-gradient-to-t from-blue-400 to-blue-300 rounded-t-lg transition-all duration-500 hover:from-blue-300 hover:to-blue-200" style={{height: '70%'}}></div>
                                            <div className="flex-1 bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-lg transition-all duration-500 hover:from-emerald-300 hover:to-emerald-200" style={{height: '100%'}}></div>
                                            <div className="flex-1 bg-gradient-to-t from-blue-400 to-blue-300 rounded-t-lg transition-all duration-500 hover:from-blue-300 hover:to-blue-200" style={{height: '80%'}}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-5 pt-3 border-t border-white/10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
                                            <span className="text-xs text-white/80 font-medium">Check-ups</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></div>
                                            <span className="text-xs text-white/80 font-medium">Consultations</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2.5">
                                    <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg border border-emerald-400/30 hover:border-emerald-400/50 transition-all">
                                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-white">Appointment Scheduled</p>
                                            <p className="text-xs text-white/70 mt-0.5">Dr. Sarah Johnson • 3:00 PM</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg border border-blue-400/30 hover:border-blue-400/50 transition-all">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <FlaskConical className="w-4 h-4 text-white" strokeWidth={2.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-white">Lab Results Available</p>
                                            <p className="text-xs text-white/70 mt-0.5">Blood Test • Review now</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="platform" className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="space-y-3 sm:space-y-4 text-center mb-8 sm:mb-12">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-green-50 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-gray-200">
                                <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-full animate-pulse"></div>
                                Complete Healthcare Platform
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                                Everything you need to modernize
                                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent block mt-1 sm:mt-2">healthcare delivery</span>
                            </h2>
                            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2">
                                From patient registration to AI-powered diagnostics, Health Track provides comprehensive tools for every healthcare stakeholder.
                            </p>
                        </div>
                        
                        {/* Main Feature Categories */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                            {/* For Hospitals */}
                            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-6 border-2 border-blue-200 shadow-lg shadow-blue-100/50">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-5 lg:mb-4 shadow-md">
                                    <HospitalIcon />
                                </div>
                                <h3 className="text-xl sm:text-2xl lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Hospital Operations</h3>
                                <p className="text-gray-600 mb-4 sm:mb-5 lg:mb-4 leading-relaxed text-sm sm:text-base">Comprehensive administrative control with real-time analytics and intelligent resource management.</p>
                                <div className="space-y-3 sm:space-y-3.5">
                                    <div className="flex items-start gap-3 text-left">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                        <span className="text-sm sm:text-base text-gray-700">Centralized staff & doctor management</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-left">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                        <span className="text-sm sm:text-base text-gray-700">Advanced resource optimization</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-left">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                        <span className="text-sm sm:text-base text-gray-700">Real-time financial insights</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* For Doctors */}
                            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-6 border-2 border-green-200 shadow-lg shadow-green-100/50">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-5 lg:mb-4 shadow-md">
                                    <DoctorIcon />
                                </div>
                                <h3 className="text-xl sm:text-2xl lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Clinical Excellence</h3>
                                <p className="text-gray-600 mb-4 sm:mb-5 lg:mb-4 leading-relaxed text-sm sm:text-base">AI-powered tools designed to enhance diagnostic accuracy and streamline patient care delivery.</p>
                                <div className="space-y-3 sm:space-y-3.5">
                                    <div className="flex items-start gap-3 text-left">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                        <span className="text-sm sm:text-base text-gray-700">Intelligent medical record system</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-left">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                        <span className="text-sm sm:text-base text-gray-700">AI-assisted diagnostic insights</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-left">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                        <span className="text-sm sm:text-base text-gray-700">Seamless prescription workflow</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* For Patients */}
                            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-6 border-2 border-rose-200 shadow-lg shadow-rose-100/50">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-14 lg:h-14 bg-gradient-to-br from-rose-400 to-rose-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-5 lg:mb-4 shadow-md">
                                    <PatientIcon />
                                </div>
                                <h3 className="text-xl sm:text-2xl lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Patient Empowerment</h3>
                                <p className="text-gray-600 mb-4 sm:mb-5 lg:mb-4 leading-relaxed text-sm sm:text-base">Personalized health tracking with actionable insights for proactive wellness management.</p>
                                <div className="space-y-3 sm:space-y-3.5">
                                    <div className="flex items-start gap-3 text-left">
                                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                        <span className="text-sm sm:text-base text-gray-700">Secure personal health records</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-left">
                                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                        <span className="text-sm sm:text-base text-gray-700">Continuous health monitoring</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-left">
                                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                        <span className="text-sm sm:text-base text-gray-700">Smart health recommendations</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="insights" className="py-20 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col gap-2.5 sm:gap-4 mb-8 sm:mb-16 text-center pb-6 sm:pb-8">
                            <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] text-emerald-300">INTELLIGENCE LAYER</p>
                            <h2 className="text-2xl sm:text-4xl font-bold">AI copilots custom-built for healthcare regulation.</h2>
                            <p className="text-sm sm:text-lg text-white/70 max-w-3xl mx-auto">Compliance-locked automations analyze billions of data points daily to surface the next best action for every role.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
                            {insightCards.map((insight) => {
                                const Icon = insight.icon;
                                return (
                                    <div key={insight.title} className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5">
                                        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${insight.accent} flex items-center justify-center text-white mb-4 sm:mb-6`}>
                                            <Icon />
                                        </div>
                                        <h3 className="text-base sm:text-xl font-semibold mb-2 sm:mb-3">{insight.title}</h3>
                                        <p className="text-sm sm:text-base text-white/80 leading-relaxed">{insight.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section id="trust" className="py-20 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-8 bg-gradient-to-br from-slate-900 to-blue-900 text-white max-w-4xl mx-auto">
                            <p className="text-sm font-semibold tracking-[0.3em] text-emerald-300 mb-6">PROOF OF TRUST</p>
                            <ul className="space-y-6 text-white/90">
                                <li className="flex items-center justify-between text-lg font-semibold">
                                    SOC 2 Type II & ISO 27001 ready <span className="text-sm text-emerald-300">Audited quarterly</span>
                                </li>
                                <li className="flex items-center justify-between text-lg font-semibold">
                                    99.99% uptime <span className="text-sm text-emerald-300">Multi-cloud active-active</span>
                                </li>
                                <li className="flex items-center justify-between text-lg font-semibold">
                                    6-week average launch <span className="text-sm text-emerald-300">Dedicated concierge</span>
                                </li>
                                <li className="flex items-center justify-between text-lg font-semibold">
                                    HIPAA, GDPR, NDHM aligned <span className="text-sm text-emerald-300">Audit trails baked-in</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="bg-white border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                    {/* Mobile view */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="w-full block md:hidden mb-3">
                            <p className="text-sm font-semibold text-slate-900 text-center">© 2025 Health Track</p>
                        </div>
                        <div className="w-full flex md:hidden justify-around items-center gap-0 text-sm text-slate-800">
                            <span className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Platform live
                            </span>
                            <span>Version 2.0</span>
                        </div>
                        {/* Desktop view */}
                        <div className="hidden md:block">
                            <p className="text-sm font-semibold text-slate-900">© 2025 Health Track</p>
                        </div>
                        <div className="hidden md:flex flex-wrap items-center gap-6 text-sm text-slate-800">
                            <span className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Platform live
                            </span>
                            <span>Version 2.0</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Homepage;
