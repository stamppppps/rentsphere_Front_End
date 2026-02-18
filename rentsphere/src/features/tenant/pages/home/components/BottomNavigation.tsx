import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, Bell, User } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const navItems = [
    { to: '/home', icon: <Home size={22} />, label: 'หน้าแรก' },
    { to: '/history', icon: <History size={22} />, label: 'ประวัติ' },
    { to: '/notifications', icon: <Bell size={22} />, label: 'แจ้งเตือน' },
    { to: '/profile', icon: <User size={22} />, label: 'โปรไฟล์' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-xl border-t border-gray-100 px-2 py-3 pb-8 z-50 flex justify-around items-center rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 flex-1 transition-all duration-300 ${
              isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          <div className="relative flex flex-col items-center">
            {item.icon}
            <span className="text-[10px] font-semibold mt-1">{item.label}</span>
            <div className={`h-1 w-1 rounded-full bg-blue-600 mt-0.5 transition-all duration-300 opacity-0 scale-0 active-indicator`}></div>
          </div>
        </NavLink>
      ))}
      <style>{`
        .active-indicator {
          transition: all 0.3s ease;
        }
        a.active .active-indicator {
          opacity: 1;
          scale: 1.5;
        }
      `}</style>
    </nav>
  );
};

export default BottomNavigation;
