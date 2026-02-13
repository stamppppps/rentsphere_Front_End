import { type AuditLog, AuditAction } from '../types/audit';

const MOCK_AUDITS: AuditLog[] = [
  {
    id: 'a1',
    action: AuditAction.FACILITY_CREATE,
    performedBy: 'Owner Admin',
    performedByRole: 'owner',
    targetType: 'facility',
    targetId: 'f1',
    details: 'สร้างพื้นที่ส่วนกลาง: Fitness Center',
    timestamp: '2024-03-15T09:00:00Z'
  },
  {
    id: 'a2',
    action: AuditAction.BOOKING_CREATE,
    performedBy: 'System',
    performedByRole: 'system',
    targetType: 'booking',
    targetId: 'b1',
    details: 'บันทึกคำขอการจองพื้นที่ใหม่จากลูกบ้าน',
    timestamp: '2024-03-20T10:00:00Z'
  }
];

// In-memory store for session logs
const localLogs = [...MOCK_AUDITS];

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
