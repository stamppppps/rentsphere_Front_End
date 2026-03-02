import { type AuditLog } from '../types/audit';

// In-memory store for session logs
const localLogs: AuditLog[] = [];

export const auditService = {
  /**
   * Fetches logs for a specific target (e.g., a specific booking).
   */
  getLogs: async (targetId?: string): Promise<AuditLog[]> => {
    const filtered = targetId
      ? localLogs.filter(a => a.targetId === targetId)
      : localLogs;

    // Return newest logs first for the timeline
    const sorted = [...filtered].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return new Promise((resolve) => setTimeout(() => resolve(sorted), 300));
  },

  /**
   * Creates a new audit entry. Usually called by other services.
   */
  createLog: async (log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> => {
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    localLogs.push(newLog);
    return newLog;
  }
};
