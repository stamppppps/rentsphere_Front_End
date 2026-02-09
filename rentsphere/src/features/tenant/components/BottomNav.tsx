
import React from 'react';
import { Home, LayoutGrid, MessageCircle, Megaphone, User } from 'lucide-react';

interface BottomNavProps {
  active: 'dashboard' | 'services' | 'profile';
  onNavigate: (screen: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ active, onNavigate }) => {
  return (
    <div className="absolute bottom-10 left-8 right-8 h-20 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex items-center justify-around px-2 z-50">
        <button 
          onClick={() => onNavigate('dashboard')} 
          className={`relative p-3 transition-all duration-300 ${active === 'dashboard' ? 'text-blue-600 scale-110' : 'text-slate-300'}`}
        >
          <Home size={24} strokeWidth={active === 'dashboard' ? 2.5 : 1.5} />
          {active === 'dashboard' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>}
        </button>
        
        <button 
          onClick={() => onNavigate('services')} 
          className={`relative p-3 transition-all duration-300 ${active === 'services' ? 'text-blue-600 scale-110' : 'text-slate-300'}`}
        >
          <LayoutGrid size={24} strokeWidth={active === 'services' ? 2.5 : 1.5} />
          {active === 'services' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>}
        </button>
        
        <div className="relative -mt-14">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
            <button className="relative w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center shadow-2xl border-4 border-white transition-transform active:scale-90">
                <MessageCircle size={26} fill="white" className="text-white" />
            </button>
        </div>

        <button className="p-3 text-slate-300">
          <Megaphone size={24} strokeWidth={1.5} />
        </button>
        
        <button className="p-3 text-slate-300">
          <User size={24} strokeWidth={1.5} />
        </button>
    </div>
  );
};

export default BottomNav;
