import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  User, 
  HelpCircle, 
  LogOut,
  Mail,
  Phone,
  UserCircle
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-10 bg-[#FDF8FF]">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-xl bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">โปรไฟล์</h1>
        <div className="w-10"></div> {/* Spacer to keep title centered */}
      </div>

      {/* Profile Card (Top) */}
      <div className="px-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
          {/* Background Decorative Element removed as per request */}
          
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full border-4 border-white/30 flex items-center justify-center mb-4 shadow-lg">
              <User size={48} className="text-white" />
            </div>
            
            <h2 className="text-2xl font-bold">คุณ กิตติเดช สุขศานต์</h2>
            <p className="text-blue-100 text-sm font-medium mt-1 mb-4">Unit A-301 • Condo ABC</p>
            
            {/* Contact Details */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2 text-blue-50/80 text-sm">
                <Mail size={14} className="opacity-70" />
                <span>kittidet.s@example.com</span>
              </div>
              <div className="flex items-center gap-2 text-blue-50/80 text-sm">
                <Phone size={14} className="opacity-70" />
                <span>081-234-5678</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Card */}
      <div className="px-6">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 space-y-2">
            {/* Edit Profile Item */}
            <button className="w-full flex items-center gap-3 p-4 bg-[#EBF3FF] rounded-2xl text-[#2B5797] transition-all active:scale-[0.98] hover:bg-blue-100/50">
              <div className="text-[#2B5797]">
                <UserCircle size={22} />
              </div>
              <span className="font-bold text-sm">แก้ไขโปรไฟล์</span>
            </button>

            {/* Help & Support Item */}
            <button className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl text-gray-700 transition-all active:scale-[0.98] hover:bg-gray-50">
              <div className="text-gray-800">
                <HelpCircle size={22} />
              </div>
              <span className="font-bold text-sm">ความช่วยเหลือและสนับสนุน</span>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mx-4"></div>

          <div className="p-4">
            {/* Logout Item - Styled with theme purple and Thai text */}
            <button className="w-full flex items-center gap-4 p-4 bg-blue-600 rounded-2xl text-white transition-all active:scale-[0.98] shadow-lg shadow-blue-100 hover:bg-blue-700">
              <div className="flex items-center justify-center">
                <LogOut size={24} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Version Tag */}
      <p className="text-center text-[10px] text-gray-300 font-medium mt-10 pb-6 uppercase tracking-widest">
        RentSphere Tenant Portal v1.0.6
      </p>
    </div>
  );
};

export default ProfilePage;
