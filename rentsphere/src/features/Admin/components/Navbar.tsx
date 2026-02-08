import React from 'react';
import { Home, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wide">RentSphere</span>
          </div>

          {/* User Profile Section */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Mr. Kittidet Suksarn</span>
            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};