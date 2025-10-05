import { HospitalIcon, DoctorIcon, PatientIcon } from './Icons';

const FeaturesSection = () => {
    return (
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
    );
};

export default FeaturesSection;
