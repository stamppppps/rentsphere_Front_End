import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, Bell } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const navItems = [
    { to: '/tenant/home', icon: <Home size={24} />, label: 'หน้าแรก' },
    { to: '/tenant/history', icon: <History size={24} />, label: 'ประวัติ' },
    { to: '/tenant/notifications', icon: <Bell size={24} />, label: 'แจ้งเตือน' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-lg border-t border-gray-100 px-12 py-3 pb-8 z-50 flex justify-between items-center rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 transition-all duration-300 ${
              isActive ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          <div className="relative">
            {item.icon}
          </div>
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNavigation;

