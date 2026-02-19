import React from 'react';
import { Phone, Mail, MessageCircle, X } from 'lucide-react';
import { PROFILE_TEXT } from '../constants/profileText';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-1 text-gray-300 hover:text-gray-500 transition-colors"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-gray-800 text-center mb-8">
          {PROFILE_TEXT.HELP_SUPPORT}
        </h3>
        
        <div className="space-y-5 mb-8">
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100/50">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">โทรศัพท์</p>
              <p className="font-bold text-gray-700">{PROFILE_TEXT.SUPPORT_PHONE}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100/50">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm">
              <MessageCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Line</p>
              <p className="font-bold text-gray-700">{PROFILE_TEXT.SUPPORT_LINE}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-100/50">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Email</p>
              <p className="font-bold text-gray-700 text-sm">{PROFILE_TEXT.SUPPORT_EMAIL}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-2xl active:scale-95 transition-transform"
        >
          {PROFILE_TEXT.CLOSE}
        </button>
      </div>
    </div>
  );
};

export default SupportModal;
