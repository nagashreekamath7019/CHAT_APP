import React from 'react';

const SplashScreen = ({ logo }) => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-9999 animate-fadeIn">
            {/* Logo with a slight pulse animation */}
            <div className="w-32 h-32 mb-4 animate-pulse">
                <img src={logo} alt="ChatterNode Logo" className="w-full h-full object-contain" />
            </div>
            
            {/* Brand Name */}
            <h1 className="text-3xl font-bold text-sky-600 tracking-wider">
                CHATTER<span className="text-gray-800">NODE</span>
            </h1>
            
            {/* Optional: Small loading bar or spinner */}
            <div className="mt-6">
                <span className="loading loading-dots loading-md text-gray-300"></span>
            </div>
        </div>
    );
};

export default SplashScreen;
