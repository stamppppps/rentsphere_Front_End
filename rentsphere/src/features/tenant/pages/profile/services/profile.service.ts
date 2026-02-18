import type { UserProfile } from '../types/profile.type';

export const getProfileData = async (): Promise<UserProfile> => {
  // จำลองการดึงข้อมูลจาก API
  return {
    name: "คุณ กิตติเดช สุขศานต์",
    unit: "Unit A-301",
    condo: "Condo ABC",
    email: "kittidet.s@example.com",
    phone: "081-234-5678"
  };
};

export const updateProfileData = async (data: Partial<UserProfile>): Promise<boolean> => {
  console.log("Updating profile...", data);
  return true;
};
