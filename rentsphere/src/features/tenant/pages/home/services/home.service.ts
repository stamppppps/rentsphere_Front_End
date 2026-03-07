import type { Resident, Activity } from '../types/home.types';
import { FeatureType } from '../types/home.types';

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getAuthHeadersAndQuery = () => {
  const lineUserId = localStorage.getItem("lineUserId");
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const query = lineUserId ? `?lineUserId=${encodeURIComponent(lineUserId)}` : '';

  return { headers, query, hasAuth: !!(lineUserId || token) };
};

export const getResidentData = async (): Promise<Resident> => {
  try {
    const { headers, query, hasAuth } = getAuthHeadersAndQuery();
    if (!hasAuth) throw new Error("No auth");

    const res = await fetch(`${API}/dorm/status${query}`, { headers });
    if (!res.ok) throw new Error("Failed to fetch status");

    const data = await res.json();
    return {
      name: data.tenantName || "ผู้เช่า",
      condo: data.condoName || "ไม่พบข้อมูลโครงการ",
      unit: data.roomNo ? `ห้อง ${data.roomNo}` : "ไม่พบข้อมูลห้องพัก"
    };
  } catch (e) {
    console.error(e);
    return { name: "Guest", condo: "Unknown Location", unit: "Unknown Room" };
  }
};

export const getLatestActivities = async (): Promise<Activity[]> => {
  try {
    const { headers, query, hasAuth } = getAuthHeadersAndQuery();
    if (!hasAuth) return [];

    // Fetch repairs
    const repairRes = await fetch(`${API}/repair/my${query}`, { headers });
    let repairs: any[] = [];
    if (repairRes.ok) {
      const data = await repairRes.json();
      repairs = data.items || [];
    }

    // Map to activities
    const activities: Activity[] = repairs.map(r => ({
      id: r.id,
      title: r.problem_type,
      date: new Date(r.created_at).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' }),
      type: FeatureType.MAINTENANCE,
      status: (r.status === 'DONE' ? 'completed' : r.status === 'OPEN' ? 'pending' : 'in-progress') as any,
      description: r.description || ''
    }));

    return activities.slice(0, 3);
  } catch (e) {
    console.error(e);
    return [];
  }
};
