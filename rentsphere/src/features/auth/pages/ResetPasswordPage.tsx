import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import { CondoBackground, Meteors } from "@/features/auth/components/AuthBackground";
import { api } from "@/shared/api/http";
import toast from "react-hot-toast";

type ResetRes = { ok: true };

function isStrongEnough(pw: string) {
  const lengthOk = pw.length >= 8;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);
  const score = [lengthOk, hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

 
  const level =
    score <= 2 ? "weak" :
    score === 3 ? "medium" :
    "strong";

  return {
    lengthOk,
    hasLower,
    hasUpper,
    hasNumber,
    hasSymbol,
    score,
    level, 
  };
}

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  
  const basePath = "/auth/owner";

  const requestId = params.get("requestId") || "";
  const channel = (params.get("channel") as "EMAIL" | "PHONE" | null) || "EMAIL";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);


  const [codeErr, setCodeErr] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [cfErr, setCfErr] = useState("");
  const [formErr, setFormErr] = useState("");

  const strength = useMemo(() => isStrongEnough(password), [password]);

  const canSubmit = useMemo(() => {
    if (!requestId) return false;
    if (code.trim().length !== 6) return false;
    if (password.length < 8) return false;
    if (password !== confirm) return false;
    
    if (strength.level === "weak") return false;
    return true;
  }, [requestId, code, password, confirm, strength.level]);

  function validateNow() {
    let ok = true;

    setCodeErr("");
    setPwErr("");
    setCfErr("");
    setFormErr("");

    if (!requestId) {
      setFormErr("ลิงก์ไม่ถูกต้อง หรือไม่มี requestId กรุณาเริ่มใหม่จากหน้าลืมรหัสผ่าน");
      ok = false;
    }

    if (code.trim().length !== 6) {
      setCodeErr("กรุณากรอกรหัสยืนยัน 6 หลักให้ครบ");
      ok = false;
    }

    if (!password) {
      setPwErr("กรุณากรอกรหัสผ่านใหม่");
      ok = false;
    } else {
      if (password.length < 8) {
        setPwErr("รหัสผ่านต้องอย่างน้อย 8 ตัวอักษร");
        ok = false;
      } else if (strength.level === "weak") {
        setPwErr("รหัสผ่านยังอ่อนเกินไป (แนะนำมี A-z, 0-9 และสัญลักษณ์)");
        ok = false;
      }
    }

    if (!confirm) {
      setCfErr("กรุณายืนยันรหัสผ่านใหม่");
      ok = false;
    } else if (password !== confirm) {
      setCfErr("รหัสผ่านไม่ตรงกัน");
      ok = false;
    }

    return ok;
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault?.();
    if (loading) return;

    const ok = validateNow();
    if (!ok) {
      toast.error("กรุณาตรวจสอบข้อมูลให้ถูกต้อง");
      return;
    }

    try {
      setLoading(true);

      await api<ResetRes>("/auth/password/reset", {
        method: "POST",
        body: JSON.stringify({
          requestId,
          code: code.trim(),
          newPassword: password,
        }),
      });

      toast.success("เปลี่ยนรหัสผ่านสำเร็จ ✅");
      navigate(`${basePath}/login?reset=1`, { replace: true });
    } catch (e: any) {
      const msg = e?.message || "รีเซ็ตรหัสผ่านไม่สำเร็จ";
      setFormErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const strengthLabel =
    strength.level === "weak" ? "อ่อน" : strength.level === "medium" ? "ปานกลาง" : "แข็งแรง";

  const strengthClass =
    strength.level === "weak"
      ? "text-red-600"
      : strength.level === "medium"
      ? "text-amber-600"
      : "text-emerald-600";

  return (
    <div className="min-h-screen w-full relative overflow-hidden cosmic-gradient flex flex-col items-center justify-center p-6">
      <CondoBackground />
      <Meteors />

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
        <img
          src={rentsphereLogo}
          alt="RentSphere"
          className="w-28 md:w-40 lg:w-44 -mt-2 mb-3 drop-shadow-xl"
        />
        <h1 className="text-2xl font-bold text-blue-900 tracking-widest -mt-1 mb-6">
          RENTSPHERE
        </h1>

        <div className="w-full bg-white p-12 rounded-[3rem] shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
            โปรดตั้งรหัสผ่านใหม่
          </h3>

          <p className="text-center text-xs text-gray-500 mb-8">
            ระบบส่งรหัสยืนยัน 6 หลักทาง <span className="font-semibold">{channel}</span>
          </p>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* RequestId missing */}
            {!requestId && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                ลิงก์ไม่ถูกต้อง หรือหมดอายุ กรุณาเริ่มใหม่จากหน้า “ลืมรหัสผ่าน”
              </div>
            )}

            {/* Code */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2">
                รหัสยืนยัน 6 หลัก <span className="text-red-500">*</span>
              </label>
              <input
                value={code}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(v);
                  if (codeErr) setCodeErr("");
                  if (formErr) setFormErr("");
                }}
                inputMode="numeric"
                placeholder="123456"
                className={`w-full px-6 py-4 rounded-xl bg-slate-50 border outline-none focus:ring-2 ${
                  codeErr ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-blue-200"
                }`}
              />
              {codeErr && <p className="mt-2 text-sm text-red-600">{codeErr}</p>}
              <p className="mt-2 text-xs text-slate-500">
                * ถ้าไม่เห็นรหัส ให้เช็ค Spam/Promotions หรือกดส่งรหัสใหม่จากหน้าก่อนหน้า
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2">
                รหัสผ่านใหม่ <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="อย่างน้อย 8 ตัวอักษร"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (pwErr) setPwErr("");
                  if (cfErr && confirm) setCfErr(""); // พิมพ์ใหม่แล้วเคลียร์ mismatch รอเช็คตอน submit
                  if (formErr) setFormErr("");
                }}
                className={`w-full px-6 py-4 rounded-xl bg-slate-50 border outline-none focus:ring-2 ${
                  pwErr ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-blue-200"
                }`}
              />

              {/* Strength */}
              <div className="mt-2 flex items-center justify-between">
                <p className={`text-xs font-semibold ${strengthClass}`}>ความแข็งแรง: {strengthLabel}</p>
                <p className="text-[11px] text-slate-500">
                  แนะนำ: A-Z, a-z, 0-9, สัญลักษณ์
                </p>
              </div>

              {/* Requirements checklist */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <p className={strength.lengthOk ? "text-emerald-600" : "text-slate-500"}>• อย่างน้อย 8 ตัว</p>
                <p className={strength.hasUpper ? "text-emerald-600" : "text-slate-500"}>• มีตัวพิมพ์ใหญ่ (A-Z)</p>
                <p className={strength.hasLower ? "text-emerald-600" : "text-slate-500"}>• มีตัวพิมพ์เล็ก (a-z)</p>
                <p className={strength.hasNumber ? "text-emerald-600" : "text-slate-500"}>• มีตัวเลข (0-9)</p>
                <p className={strength.hasSymbol ? "text-emerald-600" : "text-slate-500"}>• มีสัญลักษณ์ (!@#)</p>
              </div>

              {pwErr && <p className="mt-2 text-sm text-red-600">{pwErr}</p>}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2">
                ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="พิมพ์ซ้ำให้ตรงกัน"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (cfErr) setCfErr("");
                  if (formErr) setFormErr("");
                }}
                className={`w-full px-6 py-4 rounded-xl bg-slate-50 border outline-none focus:ring-2 ${
                  cfErr ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-blue-200"
                }`}
              />
              {cfErr && <p className="mt-2 text-sm text-red-600">{cfErr}</p>}
            </div>

            {/* Form error */}
            {formErr && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 text-center">
                {formErr}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className={`w-full py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg ${
                !canSubmit || loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "กำลังบันทึก..." : "ยืนยัน"}
            </button>

            <button
              type="button"
              onClick={() => navigate(`${basePath}/login`)}
              className="w-full text-sm text-slate-500 underline underline-offset-4"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
