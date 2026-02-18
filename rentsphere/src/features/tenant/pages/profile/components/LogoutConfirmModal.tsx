import React from 'react';
import { PROFILE_TEXT } from '../constants/profileText';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xs rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
          {PROFILE_TEXT.LOGOUT_CONFIRM_TITLE}
        </h3>
        <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed">
          {PROFILE_TEXT.LOGOUT_CONFIRM_DESC}
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            className="w-full py-3.5 bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-100 active:scale-95 transition-transform"
          >
            {PROFILE_TEXT.CONFIRM}
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3.5 bg-gray-50 text-gray-500 font-bold rounded-2xl active:scale-95 transition-transform"
          >
            {PROFILE_TEXT.CANCEL}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
