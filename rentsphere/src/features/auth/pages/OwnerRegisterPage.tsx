import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import { CondoBackground, Meteors } from "@/features/auth/components/AuthBackground";
import { api } from "@/shared/api/http";
import { useOwnerRegisterStore } from "@/features/auth/ownerRegister.store";

type StartRegisterResponse = {
  requestId: string;
  channel: "EMAIL" | "PHONE";
  message: string;
};

type FieldErrors = Partial<Record<"name" | "email" | "phone" | "password" | "confirm", string>>;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPasswordScore(pw: string) {
  
  const lenOK = pw.length >= 8;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);

  let score = 0;
  if (lenOK) score++;
  if (hasLower && hasUpper) score++; // mixed case
  if (hasNumber) score++;
  if (hasSymbol) score++;

  return {
    score,
    lenOK,
    hasLower,
    hasUpper,
    hasNumber,
    hasSymbol,
  };
}

function strengthLabel(score: number) {
  if (score <= 1) return { label: "อ่อน", className: "text-red-300" };
  if (score === 2) return { label: "พอใช้", className: "text-yellow-200" };
  if (score === 3) return { label: "ดี", className: "text-sky-200" };
  return { label: "แข็งแรง", className: "text-emerald-200" };
}

const OwnerRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setStart = useOwnerRegisterStore((s) => s.setStart);

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [phone,setPhone] = useState("");

  const [password,setPassword] = useState("");
  const [confirm,setConfirm] = useState("");
  const [verifyChannel,setVerifyChannel] = useState<"EMAIL" | "PHONE">("EMAIL");

  const [loading, setLoading] = useState(false);

 
  const [errors, setErrors] = useState<FieldErrors>({});

  
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmRef = useRef<HTMLInputElement | null>(null);

  const pwMeta = useMemo(() => getPasswordScore(password), [password]);
  const pwStrength = useMemo(() => strengthLabel(pwMeta.score), [pwMeta.score]);

  function focusFirstError(nextErrors: FieldErrors) {
    if (nextErrors.name) return nameRef.current?.focus();
    if (nextErrors.email) return emailRef.current?.focus();
    if (nextErrors.phone) return phoneRef.current?.focus();
    if (nextErrors.password) return passwordRef.current?.focus();
    if (nextErrors.confirm) return confirmRef.current?.focus();
  }

  function validate(): { ok: boolean; payload?: any; nextErrors: FieldErrors } {
    const nextErrors: FieldErrors = {};

    const n = name.trim();
    const e = normalizeEmail(email);
    const p = normalizePhone(phone);

    if (!n) nextErrors.name = "กรุณากรอกชื่อ-นามสกุล";

    if (!e) nextErrors.email = "กรุณากรอกอีเมล";
    else if (!isValidEmail(e)) nextErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";

    if (!p) nextErrors.phone = "กรุณากรอกเบอร์โทร";
    else if (p.length < 9 || p.length > 10) nextErrors.phone = "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง";

    if (!password) nextErrors.password = "กรุณากรอกรหัสผ่าน";
    else {

      if (!pwMeta.lenOK) nextErrors.password = "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร";
      else if (!pwMeta.hasNumber) nextErrors.password = "รหัสผ่านควรมีตัวเลขอย่างน้อย 1 ตัว";
      else if (!pwMeta.hasLower || !pwMeta.hasUpper)
        nextErrors.password = "รหัสผ่านควรมีตัวพิมพ์เล็กและตัวพิมพ์ใหญ่อย่างน้อยอย่างละ 1 ตัว";
    }

    if (!confirm) nextErrors.confirm = "กรุณายืนยันรหัสผ่าน";
    else if (password !== confirm) nextErrors.confirm = "รหัสผ่านไม่ตรงกัน";

    const ok = Object.keys(nextErrors).length === 0;

    return {
      ok,
      nextErrors,
      payload: ok
        ? {
            name: n,
            email: e,
            phone: p,
            password,
            role: "OWNER",
            verifyChannel,
          }
        : undefined,
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setErrors({});
    const { ok, payload, nextErrors } = validate();

    if (!ok) {
      setErrors(nextErrors);
      toast.error("กรุณาตรวจสอบข้อมูลให้ครบถ้วน");
      focusFirstError(nextErrors);
      return;
    }

    try {
      setLoading(true);

      const data = await api<StartRegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setStart({
        requestId: data.requestId,
        email: payload.email,
        phone: payload.phone,
        channel: data.channel,
      });

      toast.success("สมัครสำเร็จ! กรุณายืนยันตัวตน");

      navigate(
        `/auth/owner/verify-method?requestId=${encodeURIComponent(data.requestId)}&channel=${encodeURIComponent(
          data.channel
        )}`,
        { replace: true }
      );
    } catch (err: any) {
    
      const msg = err?.message || "สมัครสมาชิกไม่สำเร็จ";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (field: keyof FieldErrors) =>
    `input-auth w-full ${errors[field] ? "border border-red-400 ring-2 ring-red-400/20" : ""}`;

  return (
    <div className="min-h-screen w-full relative overflow-hidden cosmic-gradient flex flex-col items-center justify-center p-6">
      <CondoBackground />
      <Meteors />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl px-10 py-10">
          <div className="flex flex-col items-center text-center">
            <img src={rentsphereLogo} alt="RentSphere" className="w-28 md:w-32 lg:w-36 -mt-2 mb-3 drop-shadow-xl" />
            <h1 className="text-2xl md:text-3xl font-semibold tracking-[0.22em] text-white/90 -mt-7">RENTSPHERE</h1>
            <p className="mt-2 text-sm text-white/60">สมัครสมาชิกเพื่อเข้าใช้งานระบบ</p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-3">
            <div>
              <input
                ref={nameRef}
                type="text"
                placeholder="ชื่อ - นามสกุล"
                className={inputClass("name")}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((s) => ({ ...s, name: "" }));
                }}
              />
              {errors.name && <p className="mt-1 text-xs text-red-200">{errors.name}</p>}
            </div>

            <div>
              <input
                ref={emailRef}
                type="email"
                placeholder="อีเมล"
                className={inputClass("email")}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((s) => ({ ...s, email: "" }));
                }}
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-xs text-red-200">{errors.email}</p>}
            </div>

            <div>
              <input
                ref={phoneRef}
                type="tel"
                placeholder="หมายเลขโทรศัพท์"
                className={inputClass("phone")}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((s) => ({ ...s, phone: "" }));
                }}
                autoComplete="tel"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-200">{errors.phone}</p>}
            </div>

           
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => setVerifyChannel("EMAIL")}
                className={`flex-1 py-3 rounded-2xl border text-sm font-semibold transition-all ${
                  verifyChannel === "EMAIL"
                    ? "bg-white text-slate-900 border-white"
                    : "bg-white/10 text-white/80 border-white/20 hover:bg-white/15"
                } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                ยืนยันด้วยอีเมล
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => setVerifyChannel("PHONE")}
                className={`flex-1 py-3 rounded-2xl border text-sm font-semibold transition-all ${
                  verifyChannel === "PHONE"
                    ? "bg-white text-slate-900 border-white"
                    : "bg-white/10 text-white/80 border-white/20 hover:bg-white/15"
                } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                ยืนยันด้วยเบอร์
              </button>
            </div>

            {/* password */}
            <div className="pt-1">
              <input
                ref={passwordRef}
                type="password"
                placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
                className={inputClass("password")}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((s) => ({ ...s, password: "" }));
                }}
                autoComplete="new-password"
              />

              {/* strength + checklist */}
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-white/70">
                  ความแข็งแรง: <span className={`font-semibold ${pwStrength.className}`}>{pwStrength.label}</span>
                </p>
                <p className="text-xs text-white/50">{password.length}/64</p>
              </div>

              <div className="mt-2 space-y-1 text-xs text-white/70">
                <p className={pwMeta.lenOK ? "text-emerald-200" : ""}>• อย่างน้อย 8 ตัวอักษร</p>
                <p className={pwMeta.hasNumber ? "text-emerald-200" : ""}>• มีตัวเลขอย่างน้อย 1 ตัว</p>
                <p className={pwMeta.hasLower ? "text-emerald-200" : ""}>• มีตัวพิมพ์เล็ก</p>
                <p className={pwMeta.hasUpper ? "text-emerald-200" : ""}>• มีตัวพิมพ์ใหญ่</p>
                <p className={pwMeta.hasSymbol ? "text-emerald-200" : "text-white/50"}>
                  • (แนะนำ) มีสัญลักษณ์ เช่น !@#$
                </p>
              </div>

              {errors.password && <p className="mt-2 text-xs text-red-200">{errors.password}</p>}
            </div>

            <div className="pt-1">
              <input
                ref={confirmRef}
                type="password"
                placeholder="ยืนยันรหัสผ่าน"
                className={inputClass("confirm")}
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (errors.confirm) setErrors((s) => ({ ...s, confirm: "" }));
                }}
                autoComplete="new-password"
              />
              {errors.confirm && <p className="mt-1 text-xs text-red-200">{errors.confirm}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-auth w-full mt-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "กำลังสมัคร..." : "ลงทะเบียน"}
            </button>

            <p className="text-center text-sm text-white/60 mt-4">
              เป็นสมาชิกอยู่แล้วใช่ไหม?{" "}
              <button
                type="button"
                disabled={loading}
                onClick={() => navigate("/auth/owner/login")}
                className={`text-sky-300 hover:text-sky-200 underline underline-offset-4 ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                เข้าสู่ระบบ
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OwnerRegisterPage;
