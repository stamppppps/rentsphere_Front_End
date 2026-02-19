import React from 'react';
import { UserCircle, HelpCircle, LogOut } from 'lucide-react';
import { PROFILE_TEXT } from '../constants/profileText';

interface ProfileActionListProps {
  onEdit: () => void;
  onLogout: () => void;
  onSupport: () => void;
}

const ProfileActionList: React.FC<ProfileActionListProps> = ({ onEdit, onLogout, onSupport }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 space-y-2">
        <button 
          onClick={onEdit}
          className="w-full flex items-center gap-3 p-4 bg-[#EBF3FF] rounded-3xl text-[#2B5797] transition-all active:scale-[0.98] hover:bg-blue-100/50 text-left"
        >
          <UserCircle size={22} />
          <span className="font-bold text-sm">{PROFILE_TEXT.EDIT_PROFILE}</span>
        </button>

        <button 
          onClick={onSupport}
          className="w-full flex items-center gap-3 p-4 bg-white rounded-3xl text-gray-700 transition-all active:scale-[0.98] hover:bg-gray-50 text-left"
        >
          <HelpCircle size={22} />
          <span className="font-bold text-sm">{PROFILE_TEXT.HELP_SUPPORT}</span>
        </button>
      </div>

      <div className="border-t border-gray-100 mx-4"></div>

      <div className="p-4">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 p-4 bg-blue-600 rounded-3xl text-white transition-all active:scale-[0.98] shadow-lg shadow-blue-100 hover:bg-blue-700"
        >
          <LogOut size={24} strokeWidth={2.5} />
          <span className="font-bold text-lg">{PROFILE_TEXT.LOGOUT}</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileActionList;
