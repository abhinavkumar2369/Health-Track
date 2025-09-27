// Additional sections for Homepage
export const AdvancedFeaturesSection = () => {
    const advancedFeatures = [
        { icon: '🗺️', title: 'Disease Heatmap', desc: 'Regional disease trend visualization' },
        { icon: '🎤', title: 'Voice Assistant', desc: 'Speech-enabled patient interactions' },
        { icon: '🔐', title: 'Blockchain Security', desc: 'Tamper-proof medical record verification' },
        { icon: '⌚', title: 'IoT Integration', desc: 'Wearable device data synchronization' },
        { icon: '🤖', title: 'AI Health Chatbot', desc: 'Intelligent health query assistance' },
        { icon: '📈', title: 'Predictive Analytics', desc: 'Hospital resource and patient flow prediction' }
    ];

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">Advanced Features</h3>
                    <p className="text-lg text-gray-600">Cutting-edge technology for next-generation healthcare</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {advancedFeatures.map((feature, index) => (
                        <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 hover:border-blue-400 transition-all">
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h4 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h4>
                            <p className="text-gray-600">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export const BenefitsSection = () => (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-white mb-12">Why Choose HDIMS?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                    <div className="text-5xl mb-4">🚀</div>
                    <h4 className="text-xl font-semibold text-white mb-2">Enhanced Efficiency</h4>
                    <p className="text-blue-100">Streamlined workflows and automated processes reduce administrative burden</p>
                </div>
                <div className="text-center">
                    <div className="text-5xl mb-4">🛡️</div>
                    <h4 className="text-xl font-semibold text-white mb-2">Data Security</h4>
                    <p className="text-blue-100">HIPAA-compliant security with blockchain verification options</p>
                </div>
                <div className="text-center">
                    <div className="text-5xl mb-4">💡</div>
                    <h4 className="text-xl font-semibold text-white mb-2">AI-Powered Insights</h4>
                    <p className="text-blue-100">Machine learning analytics for better patient outcomes and predictions</p>
                </div>
            </div>
        </div>
    </section>
);

export const CTASection = () => (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Ready to Transform Healthcare?</h3>
            <p className="text-xl text-gray-600 mb-8">
                Join the future of healthcare management with our comprehensive HDIMS platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg">
                    Start Free Trial
                </button>
                <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors">
                    Schedule Demo
                </button>
            </div>
        </div>
    </section>
);

export const FooterSection = () => (
    <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                    <div className="text-3xl font-bold text-blue-400">🏥</div>
                    <div className="ml-3">
                        <h4 className="text-2xl font-bold">HDIMS</h4>
                        <p className="text-gray-400">Health Data & Information Management System</p>
                    </div>
                </div>
                <p className="text-gray-400 mb-4">
                    Empowering healthcare through technology, data, and innovation
                </p>
                <div className="border-t border-gray-700 pt-6">
                    <p className="text-sm text-gray-500">
                        © 2025 HDIMS Health-Track. All rights reserved. | HL7 FHIR Compliant | HIPAA Secure
                    </p>
                </div>
            </div>
        </div>
    </footer>
);