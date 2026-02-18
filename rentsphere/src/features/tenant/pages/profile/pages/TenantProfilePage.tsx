import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { PROFILE_TEXT } from '../constants/profileText';
import ProfileCard from '../components/ProfileCard';
import ProfileActionList from '../components/ProfileActionList';
import EditProfileModal from '../components/EditProfileModal';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import SupportModal from '../components/SupportModal';

const TenantProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    profile, 
    loading, 
    isEditModalOpen, 
    isLogoutModalOpen, 
    isSupportModalOpen,
    toggleEditModal, 
    toggleLogoutModal, 
    toggleSupportModal,
    handleLogout 
  } = useProfile();

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f7ff] via-[#f0f5ff] to-white pb-32">
      {/* Header with Back Button and Centered Title */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/home')} 
          className="p-2 rounded-xl bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">{PROFILE_TEXT.TITLE}</h1>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Profile Info */}
      <div className="px-6 mb-8">
        <ProfileCard profile={profile} />
      </div>

      {/* Actions */}
      <div className="px-6">
        <ProfileActionList 
          onEdit={toggleEditModal} 
          onLogout={toggleLogoutModal} 
          onSupport={toggleSupportModal}
        />
      </div>

      {/* Version Tag */}
      <p className="text-center text-[10px] text-gray-300 font-medium mt-10 pb-6 uppercase tracking-widest">
        {PROFILE_TEXT.VERSION}
      </p>

      {/* Modals */}
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={toggleEditModal} 
      />
      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen} 
        onClose={toggleLogoutModal} 
        onConfirm={handleLogout} 
      />
      <SupportModal 
        isOpen={isSupportModalOpen} 
        onClose={toggleSupportModal} 
      />
    </div>
  );
};

export default TenantProfilePage;
