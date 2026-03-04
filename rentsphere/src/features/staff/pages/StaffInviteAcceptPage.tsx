// src/features/staff/StaffInviteAcceptPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/shared/api/http";

type InviteInfo = {
  token: string;
  condoId?: string;
  condoName?: string;
  email?: string | null;
  phone?: string | null;
  staffPosition?: string | null;
  expiresAt?: string;
  status?: string; 
};

function inputPill() {
  return [
    "w-full h-[54px] px-6 rounded-full",
    "bg-[#EEF3FF] border border-blue-100/60",
    "text-gray-900 font-bold shadow-inner",
    "focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300",
  ].join(" ");
}

function primaryBtn(disabled?: boolean) {
  return [
    "h-[44px] px-10 rounded-xl border-0 text-white font-extrabold",
    "shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition",
    "!bg-[#93C5FD] hover:!bg-[#7fb4fb] active:scale-[0.98]",
    disabled ? "opacity-60 cursor-not-allowed hover:!bg-[#93C5FD] active:scale-100" : "",
  ].join(" ");
}

function secondaryBtn() {
  return [
    "h-[44px] px-10 rounded-xl bg-white border border-gray-200 text-gray-700 font-extrabold",
    "shadow-sm hover:bg-gray-50 active:scale-[0.98] transition",
  ].join(" ");
}

function formatExpire(s?: string) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString();
}

function isExpiredInvite(info?: InviteInfo | null) {
  if (!info?.expiresAt) return false;
  const t = new Date(info.expiresAt).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() > t;
}

export default function StaffInviteAcceptPage() {
  const nav = useNavigate();
  const { token = "" } = useParams<{ token: string }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [invite, setInvite] = useState<InviteInfo | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);

  const canSubmit = useMemo(() => {
    if (!token) return false;
    if (!password || !confirm) return false;
    if (password !== confirm) return false;
    if (password.length < 8) return false;
    if (isExpiredInvite(invite)) return false;
    // ถ้า backend ส่ง status มาและไม่ใช่ PENDING ก็ห้าม
    if (invite?.status && invite.status !== "PENDING") return false;
    return true;
  }, [token, password, confirm, invite]);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setError("ลิงก์ไม่ถูกต้อง (ไม่มี token)");
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);


        const data = await api<any>(`/staff-invites/${token}`, { method: "GET" });


        const info: InviteInfo = (data?.invite ?? data) as InviteInfo;
        setInvite(info);

    
        if (isExpiredInvite(info)) {
          setError("ลิงก์หมดอายุแล้ว กรุณาขอให้ผู้ดูแลส่งลิงก์ใหม่");
        } else if (info?.status && info.status !== "PENDING") {
          setError("ลิงก์นี้ถูกใช้งานไปแล้ว หรือไม่สามารถใช้งานได้");
        }
      } catch (e: any) {
        setInvite(null);
        setError(e?.message ?? "โหลดข้อมูลลิงก์ไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [token]);

  const onAccept = async () => {
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      setError(null);

      await api<any>(`/staff-invites/${token}/accept`, {
        method: "POST",
        body: JSON.stringify({ password }),
      });

     
      nav("/auth/owner/login");
    } catch (e: any) {
      setError(e?.message ?? "ตั้งรหัสผ่านไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF4FF] px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl bg-white shadow-[0_18px_55px_rgba(0,0,0,0.12)] border border-blue-100/60 overflow-hidden">
          <div className="px-10 py-7 border-b border-gray-200/80 bg-[#f3f7ff]">
            <div className="text-2xl font-extrabold text-gray-900">ตั้งรหัสผ่านสำหรับเจ้าหน้าที่</div>
            <div className="mt-1 text-sm font-bold text-gray-600">
              สร้างรหัสผ่านเพื่อเข้าใช้งานระบบ (ใช้ Email หรือ เบอร์โทรในการล็อกอินได้)
            </div>
          </div>

          <div className="px-10 py-8">
            {loading ? (
              <div className="text-center text-gray-500 font-bold py-10">กำลังโหลดข้อมูลลิงก์...</div>
            ) : (
              <>
                {/* Info box */}
                <div className="rounded-2xl border border-blue-100/60 bg-white px-6 py-5 shadow-sm">
                  <div className="text-sm font-extrabold text-gray-700">ข้อมูลบัญชี</div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-[#EEF3FF] border border-blue-100/60 px-4 py-3">
                      <div className="text-xs font-extrabold text-gray-500">อีเมล</div>
                      <div className="mt-1 font-extrabold text-gray-900">{invite?.email ?? "—"}</div>
                    </div>

                    <div className="rounded-xl bg-[#EEF3FF] border border-blue-100/60 px-4 py-3">
                      <div className="text-xs font-extrabold text-gray-500">เบอร์โทร</div>
                      <div className="mt-1 font-extrabold text-gray-900">{invite?.phone ?? "—"}</div>
                    </div>

                    <div className="rounded-xl bg-[#EEF3FF] border border-blue-100/60 px-4 py-3">
                      <div className="text-xs font-extrabold text-gray-500">ตำแหน่ง</div>
                      <div className="mt-1 font-extrabold text-gray-900">{invite?.staffPosition ?? "—"}</div>
                    </div>

                    <div className="rounded-xl bg-[#EEF3FF] border border-blue-100/60 px-4 py-3">
                      <div className="text-xs font-extrabold text-gray-500">หมดอายุ</div>
                      <div className="mt-1 font-extrabold text-gray-900">{formatExpire(invite?.expiresAt)}</div>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 shadow-sm">
                    <div className="font-extrabold text-rose-700">ทำรายการไม่ได้</div>
                    <div className="mt-1 text-sm font-bold text-rose-600">{error}</div>
                  </div>
                )}

                {/* Form */}
                <div className="mt-8">
                  <div className="text-sm font-extrabold text-gray-800 mb-3">รหัสผ่านใหม่</div>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputPill()}
                      placeholder="อย่างน้อย 8 ตัวอักษร"
                      disabled={Boolean(error) || submitting}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-blue-700 hover:text-blue-800"
                      onClick={() => setShowPass((s) => !s)}
                      disabled={Boolean(error) || submitting}
                    >
                      {showPass ? "ซ่อน" : "แสดง"}
                    </button>
                  </div>

                  <div className="mt-6 text-sm font-extrabold text-gray-800 mb-3">ยืนยันรหัสผ่าน</div>
                  <input
                    type={showPass ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={inputPill()}
                    placeholder="พิมพ์รหัสผ่านซ้ำ"
                    disabled={Boolean(error) || submitting}
                  />

                  {/* Inline hints */}
                  <div className="mt-3 text-xs font-bold text-gray-500">
                    • แนะนำให้ใช้ตัวอักษรผสม ตัวเลข และสัญลักษณ์ เพื่อความปลอดภัย
                    <br />
                    • รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร
                    {password && confirm && password !== confirm && (
                      <div className="mt-2 text-rose-600 font-extrabold">รหัสผ่านไม่ตรงกัน</div>
                    )}
                  </div>

                  <div className="mt-10 flex items-center justify-end gap-4">
                    <button type="button" className={secondaryBtn()} onClick={() => nav("/login")} disabled={submitting}>
                      ไปหน้าเข้าสู่ระบบ
                    </button>

                    <button type="button" className={primaryBtn(!canSubmit || submitting)} onClick={onAccept} disabled={!canSubmit || submitting}>
                      {submitting ? "กำลังบันทึก..." : "ตั้งรหัสผ่าน"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 text-center text-xs font-bold text-gray-400">
          หากลิงก์หมดอายุ ให้ติดต่อผู้ดูแลระบบเพื่อส่งลิงก์ใหม่
        </div>
      </div>
    </div>
  );
}