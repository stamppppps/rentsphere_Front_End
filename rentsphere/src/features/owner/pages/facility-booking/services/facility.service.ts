import { type Facility, FacilityStatus } from '../types/facility';

// Memory storage to simulate persistence during session
const localStore: Facility[] = [];

export const facilityService = {
  getFacilities: async (): Promise<Facility[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(localStore), 500));
  },

  getFacilityById: async (id: string): Promise<Facility | null> => {
    const f = localStore.find(f => f.id === id);
    return new Promise((resolve) => setTimeout(() => resolve(f ? { ...f } : null), 300));
  },

  createFacility: async (facility: Partial<Facility>): Promise<Facility> => {
    const newFacility: Facility = {
      ...facility,
      id: `f${Date.now()}`,
      status: facility.status || FacilityStatus.AVAILABLE,
    } as Facility;
    localStore.push(newFacility);
    return new Promise((resolve) => setTimeout(() => resolve(newFacility), 800));
  },

  updateFacility: async (id: string, data: Partial<Facility>): Promise<Facility> => {
    const index = localStore.findIndex(f => f.id === id);
    if (index !== -1) {
      // Ensure specific fields aren't accidentally wiped if they are null in data
      localStore[index] = { ...localStore[index], ...data };
      return new Promise((resolve) => setTimeout(() => resolve({ ...localStore[index] }), 500));
    }
    throw new Error('Facility not found');
  }
};
