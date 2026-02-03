import React from 'react';

const RentSphereLogo: React.FC = () => (
    <div className="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
        </svg>
        <span className="text-2xl font-bold text-white tracking-wide">RentSphere</span>
    </div>
);


const Navbar: React.FC = () => {
  return (
    <nav className="bg-sky-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <RentSphereLogo />
          </div>
          <div className="text-white font-medium">
            Mr. Kittidet Suksarn
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
