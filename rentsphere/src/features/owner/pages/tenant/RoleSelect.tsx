import React from "react";
import { Shield, User, ArrowRight } from "lucide-react";

export default function RoleSelect() {
  const go = (to: string) => {
    window.history.pushState({}, "", to);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="w-screen h-screen bg-[#E9E6FF] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="mb-6">
          <div className="text-4xl font-black text-slate-900">RentSphere</div>
          <div className="text-slate-600 font-semibold mt-1">
            เลือกโหมดการใช้งาน: ผู้เช่า (Tenant) หรือ แอดมิน (Admin)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tenant */}
          <button
            onClick={() => go("/owner/line-login")}
            className="group text-left bg-white rounded-3xl border border-indigo-100 shadow-xl p-7 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-200">
                <User size={24} />
              </div>
              <div className="text-indigo-500 group-hover:translate-x-1 transition-transform flex items-center gap-2 font-black">
                เริ่มใช้งาน <ArrowRight size={18} />
              </div>
            </div>

            <div className="mt-5">
              <div className="text-2xl font-black text-slate-900">Tenant</div>
              <div className="text-slate-500 mt-1 font-medium">
                Login LINE → ใส่โค้ดหอ → ใช้งานแจ้งซ่อม/ดู ticket ของตัวเอง
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2 text-sm text-slate-600 font-semibold">
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                • แจ้งซ่อม + แนบรูป
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                • ดูสถานะงานของฉัน
              </div>
            </div>
          </button>

          {/* Admin */}
          <button
            onClick={() => go("/owner/admin-login")}
            className="group text-left bg-white rounded-3xl border border-indigo-100 shadow-xl p-7 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-lg shadow-slate-200">
                <Shield size={24} />
              </div>
              <div className="text-slate-700 group-hover:translate-x-1 transition-transform flex items-center gap-2 font-black">
                ไปหน้าแอดมิน <ArrowRight size={18} />
              </div>
            </div>

            <div className="mt-5">
              <div className="text-2xl font-black text-slate-900">Admin</div>
              <div className="text-slate-500 mt-1 font-medium">
                ดูรายการแจ้งซ่อมทั้งหมด + รับเรื่อง/ปิดงาน + แจ้งพัสดุ
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2 text-sm text-slate-600 font-semibold">
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                • จัดการ Repair Requests
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                • แจ้งพัสดุ + แนบรูป + ส่ง LINE
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 text-center text-slate-500 text-sm font-semibold">
          * ถ้าเป็นผู้เช่า ให้เลือก Tenant แล้วระบบจะพาไป Login LINE ให้อัตโนมัติ
        </div>
      </div>
    </div>
  );
}
