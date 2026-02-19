import React from 'react';
import { PROFILE_TEXT } from '../constants/profileText';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 duration-300 max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">{PROFILE_TEXT.EDIT_PROFILE}</h3>
        
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{PROFILE_TEXT.LABEL_NAME}</label>
            <input 
              type="text" 
              defaultValue="คุณ กิตติเดช สุขศานต์"
              className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-blue-300 outline-none font-medium text-gray-700" 
              placeholder="กรอกชื่อ-นามสกุลของคุณ"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{PROFILE_TEXT.LABEL_PHONE}</label>
            <input 
              type="text" 
              defaultValue="081-234-5678"
              className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-blue-300 outline-none font-medium text-gray-700" 
              placeholder="กรอกเบอร์โทรศัพท์"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{PROFILE_TEXT.LABEL_EMAIL}</label>
            <input 
              type="email" 
              defaultValue="kittidet.s@example.com"
              className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-blue-300 outline-none font-medium text-gray-700" 
              placeholder="กรอกอีเมล"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl active:scale-95 transition-all"
          >
            {PROFILE_TEXT.CANCEL}
          </button>
          <button 
            onClick={onClose}
            className="flex-2 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-all px-8"
          >
            {PROFILE_TEXT.SAVE}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
