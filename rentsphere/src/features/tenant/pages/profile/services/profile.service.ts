import type { UserProfile } from '../types/profile.type';

export const getProfileData = async (): Promise<UserProfile> => {
  return {
    name: "",
    unit: "",
    condo: "",
    email: "",
    phone: ""
  };
};

export const updateProfileData = async (data: Partial<UserProfile>): Promise<boolean> => {
  console.log("Updating profile...", data);
  return true;
};
