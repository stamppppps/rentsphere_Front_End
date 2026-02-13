import React from 'react';
import { MeterRecording } from '../components/MeterRecording';

// Building icon
const BuildingIcon = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    <rect x="12" y="16" width="40" height="44" rx="4" fill="url(#buildingGrad)" opacity="0.9" />
    <rect x="20" y="24" width="8" height="6" rx="1" fill="white" opacity="0.8" />
    <rect x="36" y="24" width="8" height="6" rx="1" fill="white" opacity="0.8" />
    <rect x="20" y="36" width="8" height="6" rx="1" fill="white" opacity="0.8" />
    <rect x="36" y="36" width="8" height="6" rx="1" fill="white" opacity="0.8" />
    <rect x="28" y="48" width="8" height="12" rx="1" fill="white" opacity="0.9" />
  </svg>
);

// Users icon
const UsersIcon = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="usersGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="20" r="10" fill="url(#usersGrad)" opacity="0.9" />
    <path d="M8 52c0-10 8-16 16-16s16 6 16 16" fill="url(#usersGrad)" opacity="0.7" />
    <circle cx="44" cy="24" r="8" fill="url(#usersGrad)" opacity="0.8" />
    <path d="M36 52c4-8 8-12 16-12 6 0 10 4 10 12" fill="url(#usersGrad)" opacity="0.6" />
  </svg>
);

// Logo icon
const LogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" fill="url(#logoGrad)" />
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
    </defs>
    <path d="M10 20 L16 10 L22 20 Z" fill="white" opacity="0.9" />
  </svg>
);

const Check_Mitre: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'linear-gradient(180deg, #e9d5ff 0%, #ddd6fe 50%, #c4b5fd 100%)' }}>

      {/* Header / Navbar */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoIcon />
          <span className="text-xl font-bold text-indigo-600">RentSphere</span>
        </div>
        <div className="text-gray-700 font-medium">
          Mr. Kittidet Suksarn
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-purple-900">คอนโดมิเนียม</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-8 mb-6">
          <div className="flex flex-col items-center gap-2">
            <BuildingIcon />
            <span className="font-medium text-sm text-purple-600">จัดการคอนโดมิเนียม</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <UsersIcon />
            <span className="font-medium text-sm text-purple-800">จัดการผู้ใช้งาน</span>
          </div>
        </div>

        {/* Add Button */}
        <div className="flex justify-center mb-6">
          <button
            className="px-8 py-3 rounded-full font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
            style={{ background: 'linear-gradient(90deg, #f472b6 0%, #c084fc 100%)' }}
          >
            เพิ่มคอนโดมิเนียม
          </button>
        </div>

        {/* Main Content Component */}
        <div className="bg-white/80 rounded-2xl backdrop-blur-sm overflow-hidden">
          <MeterRecording />
        </div>
      </main>
    </div>
  );
};

export default Check_Mitre;