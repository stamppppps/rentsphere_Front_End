import { useState, useEffect } from 'react';
import type { UserProfile } from '../types/profile.type';
import { getProfileData } from '../services/profile.service';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfileData();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const toggleEditModal = () => setIsEditModalOpen(!isEditModalOpen);
  const toggleLogoutModal = () => setIsLogoutModalOpen(!isLogoutModalOpen);
  const toggleSupportModal = () => setIsSupportModalOpen(!isSupportModalOpen);

  const handleLogout = () => {
    console.log("Processing logout...");
    // Logic สำหรับการ Logout จริงๆ จะอยู่ตรงนี้
    window.location.href = '#/home'; 
  };

  return {
    profile,
    loading,
    isEditModalOpen,
    isLogoutModalOpen,
    isSupportModalOpen,
    toggleEditModal,
    toggleLogoutModal,
    toggleSupportModal,
    handleLogout
  };
};
