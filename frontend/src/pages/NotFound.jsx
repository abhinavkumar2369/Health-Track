import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, FileQuestion } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="text-center max-w-md">

                {/* Error Code */}
                <h1 className="text-7xl sm:text-8xl font-bold text-gray-900 mb-8">
                    404
                </h1>

                {/* Error Message */}
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3">
                    Page Not Found
                </h2>
                <p className="text-gray-500 mb-8 text-sm sm:text-base">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg text-gray-700 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 rounded-lg text-white font-medium transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
