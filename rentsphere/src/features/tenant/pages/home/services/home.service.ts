import type { Resident, Activity } from '../types/home.types';

export const getResidentData = async (): Promise<Resident> => {
  return {
    name: "",
    condo: "",
    unit: ""
  };
};

export const getLatestActivities = async (): Promise<Activity[]> => {
  return [];
};
