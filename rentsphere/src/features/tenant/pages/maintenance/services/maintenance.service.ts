import type { RepairRequest } from '../types/maintenance.types';

export const maintenanceService = {
  getRequests: (): RepairRequest[] => {
    // Waiting for backend integration.
    return [];
  },

  getRequestById: (id: string): RepairRequest | undefined => {
    if (!id) return undefined;
    // Waiting for backend integration.
    return undefined;
  },

  updateRequest: (_id: string, _data: Partial<RepairRequest>): void => {
    // Waiting for backend integration.
  },

  deleteRequest: (_id: string): boolean => {
    // Waiting for backend integration.
    return false;
  },

  saveRequest: (_request: Partial<RepairRequest>): void => {
    // Waiting for backend integration.
  },
};
