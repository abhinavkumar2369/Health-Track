import { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import customStyles from './styles/customStyles';

function Homepage() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            <style>{customStyles}</style>
            
            <Header isScrolled={isScrolled} />
            <HeroSection />
            <FeaturesSection />
            
            {/* Technology Features Section - Kept inline for now */}
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Technology feature cards would go here */}
                        {/* This section can be further componentized if needed */}
                    </div>
                </div>
            </section>

            {/* Academic Project Section - Kept inline for now */}
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
                        {/* Academic project cards would go here */}
                        {/* This section can be further componentized if needed */}
                    </div>
                </div>
            </section>
            
            <Footer />
        </div>
    );
}

export default Homepage;
