import React from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center px-6 pt-8 pb-2">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-100 border border-white/20">
          RS
        </div>
        <div className="flex flex-col -gap-1">
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800 tracking-tight leading-none">
            RentSphere
          </span>
          <span className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase">
            Tenant Portal
          </span>
        </div>
      </div>
      
      <button 
        onClick={() => navigate('/profile')}
        className="relative group flex items-center justify-center p-0.5 rounded-full bg-gradient-to-tr from-blue-100 via-white to-purple-100 shadow-md transition-all hover:scale-105 active:scale-95"
      >
        <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white shadow-inner border-2 border-white">
          <User size={22} strokeWidth={2.5} />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
      </button>
    </div>
  );
};

export default Header;
