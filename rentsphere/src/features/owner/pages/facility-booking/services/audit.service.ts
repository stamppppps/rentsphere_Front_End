import { type AuditLog } from "../types/audit";

export const auditService = {
  async getLogs(_targetId?: string): Promise<AuditLog[]> {
    return [];
  },

  async createLog(log: Omit<AuditLog, "id" | "timestamp">): Promise<AuditLog> {
    return {
      ...log,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  },
};