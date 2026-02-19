// facility.service.ts
import type { CreateFacilityPayload } from "../CreateFacilityModal";


const API = "https://backendlinefacality.onrender.com";

function getAdminSecret() {
  return localStorage.getItem("adminSecret") || "";
}

export const facilityService = {
  async getFacilities() {
    const adminSecret = getAdminSecret();
    const r = await fetch(`${API}/admin/facilities`, {
      headers: { "x-admin-secret": adminSecret },
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error || "โหลดข้อมูลไม่สำเร็จ");

    // ถ้า backend ส่ง snake_case กลับมา ให้ map เป็น camelCase ตรงนี้ด้วย (ถ้าจำเป็น)
    return (data.items || []).map((x: any) => ({
      id: x.id,
      name: x.name,
      description: x.description ?? "",
      capacity: x.capacity,
      openTime: x.open_time,        // ✅ map
      closeTime: x.close_time,      // ✅ map
      slotMinutes: x.slot_minutes,  // ✅ map
      isAutoApprove: x.is_auto_approve ?? x.isAutoApprove ?? false, // กันไว้
      active: x.active ?? true,
      type: x.type,
    }));
  },

  async createFacility(payload: CreateFacilityPayload) {
    const adminSecret = getAdminSecret();

    // ✅ แปลง camelCase -> snake_case ให้ backend
    const body = {
      name: payload.name,
      type: payload.type,
      capacity: payload.capacity,
      open_time: payload.openTime,
      close_time: payload.closeTime,
      slot_minutes: payload.slotMinutes,
      is_auto_approve: payload.isAutoApprove,
      description: payload.description ?? null,
      active: payload.active ?? true,
      // dorm_id: "...", // ถ้า backend บังคับ dorm_id ค่อยใส่เพิ่ม
    };

    const r = await fetch(`${API}/admin/facilities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": adminSecret,
      },
      body: JSON.stringify(body),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error || "สร้างพื้นที่ไม่สำเร็จ");
    return data;
  },
};
