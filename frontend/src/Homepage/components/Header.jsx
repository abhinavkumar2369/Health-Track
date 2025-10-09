import { useNavigate } from 'react-router-dom';

const Header = ({ isScrolled }) => {
    const navigate = useNavigate();

    return (
        <header className={`fixed md:sticky top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/98 backdrop-blur-lg shadow-lg border-b border-gray-100' : 'bg-white/95 backdrop-blur-sm shadow-none border-b border-transparent'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-[4.5rem] md:h-[5.5rem]">
                    {/* Left: Enhanced logo + name */}
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

                    {/* Right: Auth Buttons */}
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
    );
};

export default Header;
