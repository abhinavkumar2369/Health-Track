const Footer = () => {
    return (
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
                        © 2025-26  Health-Track.  All rights reserved.
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
    );
};

export default Footer;
