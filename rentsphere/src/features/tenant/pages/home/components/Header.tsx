import React from 'react';

const Header: React.FC = () => {
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
      
      {/* Menu button removed as per user request */}
      <div className="w-11"></div> 
    </div>
  );
};

export default Header;
