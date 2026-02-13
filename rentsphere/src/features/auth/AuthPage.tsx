import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthStep, UserRole } from "@/types";
import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import condoBg from "@/assets/brand/condo.png";

import { api } from "@/shared/api/http";
import { useAuthStore } from "@/features/auth/auth.store";

type LoginRes = { user: any; token: string };

type RequestOtpRes = {
  otpRef: string;
  expiresAt?: string;
  // dev บางระบบอาจส่ง otp กลับมาเพื่อเทส (ถ้ามี)
  otp?: string;
};

const AuthPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<AuthStep>(AuthStep.LOGIN);
  const [forgotMethod, setForgotMethod] = useState<"email" | "phone">("email");

  // ====== Common UI state ======
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ====== LOGIN state ======
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ====== REGISTER state (UI step REGISTER_PHONE) ======
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [inviteCode, setInviteCode] = useState(""); // TENANT ใช้

  // ====== OTP state ======
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6 digits
  const [otpRef, setOtpRef] = useState<string | null>(null);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);

  // เก็บว่า OTP verify ผ่านแล้ว (ไป step REGISTER_DETAIL)
  const [otpVerified, setOtpVerified] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);

  const userRole: UserRole =
    role?.toUpperCase() === "OWNER" ? UserRole.OWNER : UserRole.TENANT;

  const backendRole = useMemo(() => {
    return userRole === UserRole.OWNER ? "OWNER" : "TENANT";
  }, [userRole]);

  const handleNextStep = (next: AuthStep) => {
    setError(null);
    setStep(next);
  };

  // ====== OTP countdown ======
  useEffect(() => {
    if (otpSecondsLeft <= 0) return;
    const t = setInterval(() => setOtpSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [otpSecondsLeft]);

  // ====== Styles (เดิมของเธอ) ======
  const inputSaaS =
    "w-full px-5 py-4 rounded-2xl bg-white/90 border border-indigo-100 shadow-sm " +
    "text-slate-800 placeholder:text-slate-400 " +
    "focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 " +
    "outline-none transition-all";

  const cardSaaS =
    "w-full max-w-xl rounded-3xl bg-white/65 backdrop-blur-xl border border-white/60 " +
    "shadow-[0_24px_60px_rgba(15,23,42,0.18)] p-10";

  // Meteor elements
  const Meteors = () => (
    <div className="stars-container">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="meteor"
          style={{
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 150 + 60}px`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );

  const CondoBackground = () => (
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${condoBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.18,
        }}
      />
      <div className="absolute inset-0 bg-[#0b1020]/70" />
    </>
  );

  const SaaSBackground = () => (
    <>
      <div className="absolute inset-0 bg-[#eaf3ff]" />
      <div className="absolute -top-24 -right-28 w-[560px] h-[560px] bg-blue-300/35 blur-[110px] rounded-full" />
      <div className="absolute -bottom-28 -left-28 w-[560px] h-[560px] bg-indigo-300/30 blur-[110px] rounded-full" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/55 via-transparent to-indigo-50/70" />
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(99,102,241,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.25) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </>
  );

  // ====== API: LOGIN ======
  async function handleLogin() {
    try {
      setLoading(true);
      setError(null);

      const data = await api<LoginRes>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      setAuth(data.token, data.user);

      if (data.user.role === "OWNER") navigate("/owner");
      else if (data.user.role === "TENANT") navigate("/tenant");
      else navigate("/admin");
    } catch (e: any) {
      setError(e.message || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  // ====== API: REGISTER request OTP ======
  async function handleRegisterRequestOtp() {
    try {
      setLoading(true);
      setError(null);

      // Validate minimal
      if (!regName.trim()) throw new Error("กรุณากรอกชื่อ-นามสกุล");
      if (!regEmail.trim()) throw new Error("กรุณากรอกอีเมล");
      if (!regPhone.trim()) throw new Error("กรุณากรอกเบอร์โทรศัพท์");
      if (!regPassword) throw new Error("กรุณากรอกรหัสผ่าน");
      if (regPassword !== regConfirm) throw new Error("รหัสผ่านไม่ตรงกัน");

      // TENANT ต้องมี invite code (ตาม requirement โปรเจกต์)
      if (backendRole === "TENANT" && !inviteCode.trim()) {
        throw new Error("ผู้เช่าต้องกรอกโค้ดจากเจ้าของ (Invite Code)");
      }

      const data = await api<RequestOtpRes>("/auth/register/request-otp", {
        method: "POST",
        body: JSON.stringify({
          phone: regPhone.trim(),
          role: backendRole, // "OWNER" | "TENANT"
        }),
      });

      setOtpRef(data.otpRef);
      setOtp(["", "", "", "", "", ""]);
      setOtpVerified(false);

      // ตั้งเวลา OTP (ถ้า backend ส่ง expiresAt มา)
      // ถ้าไม่ส่ง ให้ตั้งเป็น 30 วิ (ปรับเองได้)
      if (data.expiresAt) {
        const ms = new Date(data.expiresAt).getTime() - Date.now();
        setOtpSecondsLeft(Math.max(0, Math.floor(ms / 1000)));
      } else {
        setOtpSecondsLeft(30);
      }

      handleNextStep(AuthStep.OTP_VERIFY);
    } catch (e: any) {
      setError(e.message || "ขอ OTP ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  // ====== API: OTP verify ======
  async function handleVerifyOtp() {
    try {
      setLoading(true);
      setError(null);

      if (!otpRef) throw new Error("ไม่พบ otpRef (ลองขอ OTP ใหม่)");
      const otpCode = otp.join("");
      if (otpCode.length !== 6) throw new Error("กรุณากรอก OTP ให้ครบ 6 หลัก");

      await api<{ ok?: boolean }>("/auth/register/verify-otp", {
        method: "POST",
        body: JSON.stringify({ otpRef, otp: otpCode }),
      });

      setOtpVerified(true);
      handleNextStep(AuthStep.REGISTER_DETAIL);
    } catch (e: any) {
      setError(e.message || "OTP ไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  }

  // ====== API: REGISTER complete ======
  async function handleRegisterComplete() {
    try {
      setLoading(true);
      setError(null);

      if (!otpRef) throw new Error("ไม่พบ otpRef (ลองขอ OTP ใหม่)");
      if (!otpVerified) throw new Error("กรุณายืนยัน OTP ก่อน");

      const payload: any = {
        otpRef,
        email: regEmail.trim(),
        password: regPassword,
        name: regName.trim(),
      };

      if (backendRole === "TENANT") payload.inviteCode = inviteCode.trim();

      const data = await api<LoginRes>("/auth/register/complete", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setAuth(data.token, data.user);

      if (data.user.role === "OWNER") navigate("/owner");
      else if (data.user.role === "TENANT") navigate("/tenant");
      else navigate("/admin");
    } catch (e: any) {
      setError(e.message || "สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  // ====== API: resend OTP ======
  async function handleResendOtp() {
    try {
      setLoading(true);
      setError(null);

      const data = await api<RequestOtpRes>("/auth/register/request-otp", {
        method: "POST",
        body: JSON.stringify({
          phone: regPhone.trim(),
          role: backendRole,
        }),
      });

      setOtpRef(data.otpRef);
      setOtp(["", "", "", "", "", ""]);
      setOtpVerified(false);

      if (data.expiresAt) {
        const ms = new Date(data.expiresAt).getTime() - Date.now();
        setOtpSecondsLeft(Math.max(0, Math.floor(ms / 1000)));
      } else {
        setOtpSecondsLeft(30);
      }
    } catch (e: any) {
      setError(e.message || "ส่ง OTP ใหม่ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  const renderStep = () => {
    switch (step) {
      // ===================== LOGIN =====================
      case AuthStep.LOGIN:
        return (
          <div className="flex flex-col md:flex-row min-h-screen w-full">
            {/* Left Branding */}
            <div className="hidden md:flex w-7/12 cosmic-gradient flex-col items-center justify-center relative overflow-hidden">
              <CondoBackground />
              <Meteors />

              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full" />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full" />

              <div className="relative z-10 flex flex-col items-center">
                <img
                  src={rentsphereLogo}
                  alt="RentSphere"
                  className="w-56 md:w-64 lg:w-72 mb-7 drop-shadow-xl"
                />
                <h1 className="text-6xl font-bold text-white tracking-[0.3em] mt-[-84px]">
                  RENTSPHERE
                </h1>
                <p className="mt-5 text-white/70 tracking-wide text-sm">
                  Modern Condo Management Platform
                </p>
              </div>
            </div>

            {/* Right Login Form */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8">
              <SaaSBackground />

              <div className={`relative ${cardSaaS}`}>
                <h2 className="text-5xl font-bold text-slate-900 mb-2">
                  ลงชื่อเข้าใช้
                </h2>

                <p className="text-xs text-slate-600 mb-8 leading-relaxed">
                  ยินดีต้อนรับสู่{" "}
                  <span className="text-indigo-600 font-bold">RentSphere</span>
                  <br />
                  เมื่อคุณลงชื่อเข้าใช้ แสดงว่าคุณยอมรับ
                  <a
                    href="#"
                    className="text-blue-600 underline ml-1 underline-offset-2"
                  >
                    เงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว
                  </a>
                </p>

                <div className="space-y-4">
                  <input
                    type="email"
                    className={inputSaaS}
                    placeholder="อีเมล"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <input
                    type="password"
                    className={inputSaaS}
                    placeholder="รหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <div className="flex items-center gap-2 px-1">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      id="remember"
                    />
                    <label htmlFor="remember" className="text-xs text-slate-600">
                      จดจำรหัสผ่าน
                    </label>
                  </div>

                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className={`w-full max-w-md py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                  </button>

                  {error && <p className="text-red-600 text-sm">{error}</p>}

                  <div className="flex items-center justify-between text-[11px] pt-4 border-t border-slate-200">
                    <div className="text-slate-600">
                      สมาชิกใหม่?{" "}
                      <button
                        onClick={() => handleNextStep(AuthStep.REGISTER_PHONE)}
                        className="text-blue-700 font-bold"
                      >
                        สมัครลงทะเบียนทันที
                      </button>
                    </div>
                    <button
                      onClick={() => handleNextStep(AuthStep.REGISTER_DETAIL)}
                      className="text-blue-700"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      // ===================== REGISTER_PHONE (ขอ OTP) =====================
      case AuthStep.REGISTER_PHONE:
        return (
          <div className="min-h-screen w-full relative overflow-hidden cosmic-gradient flex flex-col items-center justify-center p-6">
            <CondoBackground />
            <Meteors />

            <div className="relative z-10 w-full max-w-md">
              <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl px-10 py-10">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={rentsphereLogo}
                    alt="RentSphere"
                    className="w-28 md:w-32 lg:w-36 -mt-2 mb-3 drop-shadow-xl"
                  />
                  <h1 className="text-2xl md:text-3xl font-semibold tracking-[0.22em] text-white/90 -mt-7">
                    RENTSPHERE
                  </h1>
                  <p className="mt-2 text-sm text-white/60">
                    สมัครสมาชิกเพื่อเข้าใช้งานระบบ ({backendRole})
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <input
                    type="text"
                    placeholder="ชื่อ - นามสกุล"
                    className="input-auth w-full"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />

                  <input
                    type="email"
                    placeholder="อีเมล"
                    className="input-auth w-full"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />

                  <input
                    type="tel"
                    placeholder="หมายเลขโทรศัพท์"
                    className="input-auth w-full"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                  />

                  {backendRole === "TENANT" && (
                    <input
                      type="text"
                      placeholder="Invite Code (จากเจ้าของ)"
                      className="input-auth w-full"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                    />
                  )}

                  <input
                    type="password"
                    placeholder="รหัสผ่าน"
                    className="input-auth w-full"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />

                  <input
                    type="password"
                    placeholder="ยืนยันรหัสผ่าน"
                    className="input-auth w-full"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                  />

                  <button
                    onClick={handleRegisterRequestOtp}
                    disabled={loading}
                    className={`btn-auth w-full mt-2 ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "กำลังส่ง OTP..." : "ลงทะเบียน"}
                  </button>

                  {error && <p className="text-red-200 text-sm">{error}</p>}

                  <p className="text-center text-sm text-white/60 mt-4">
                    เป็นสมาชิกอยู่แล้วใช่ไหม?{" "}
                    <button
                      onClick={() => handleNextStep(AuthStep.LOGIN)}
                      className="text-sky-300 hover:text-sky-200 underline underline-offset-4"
                    >
                      เข้าสู่ระบบ
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      // ===================== OTP_VERIFY =====================
      case AuthStep.OTP_VERIFY:
        return (
          <div className="min-h-screen w-full relative overflow-hidden cosmic-gradient flex flex-col items-center justify-center p-6">
            <CondoBackground />
            <Meteors />

            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
              <img
                src={rentsphereLogo}
                alt="RentSphere"
                className="w-28 md:w-32 lg:w-36 -mt-2 mb-3 drop-shadow-xl"
              />
              <h1 className="text-2xl font-bold text-blue-900 tracking-widest mb-12">
                RENTSPHERE
              </h1>

              <div className="w-full flex flex-col items-center">
                <h3 className="text-2xl font-bold text-white mb-6">
                  กรอกรหัสยืนยันตัวตน
                </h3>
                <p className="text-center text-sm text-gray-200 mb-10 leading-relaxed">
                  กรุณากรอกรหัสยืนยัน 6 หลักที่ส่งไปยัง
                  <br />
                  หมายเลขโทรศัพท์ {regPhone || "-"}
                </p>

                <div className="flex justify-center gap-4 mb-6">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-14 h-16 md:w-20 md:h-24 text-center text-4xl font-bold rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                      value={digit}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, ""); // digits only
                        const newOtp = [...otp];
                        newOtp[i] = v;
                        setOtp(newOtp);
                        if (v && i < 5) {
                          const nextInput = document.getElementById(`otp-${i + 1}`);
                          nextInput?.focus();
                        }
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className={`w-full max-w-md py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "กำลังตรวจสอบ..." : "ยืนยัน"}
                </button>

                {error && <p className="text-red-200 text-sm mt-3">{error}</p>}

                <div className="mt-8 text-center">
                  <p className="text-xs text-gray-200">
                    ยังไม่ได้รับรหัสใช่ไหม?{" "}
                    <button
                      className={`font-bold text-white underline ${
                        otpSecondsLeft > 0 || loading ? "opacity-60" : ""
                      }`}
                      disabled={otpSecondsLeft > 0 || loading}
                      onClick={handleResendOtp}
                    >
                      ส่งรหัสอีกครั้ง
                    </button>
                  </p>

                  <p className="text-xs text-gray-300 mt-1">
                    {otpSecondsLeft > 0
                      ? `ขอรหัสใหม่ได้ใน 00:${String(otpSecondsLeft).padStart(2, "0")} วินาที`
                      : "สามารถขอ OTP ใหม่ได้แล้ว"}
                  </p>

                  <button
                    className="mt-6 text-xs text-white/80 underline"
                    onClick={() => handleNextStep(AuthStep.REGISTER_PHONE)}
                  >
                    แก้ไขข้อมูลสมัครสมาชิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      // ===================== REGISTER_DETAIL (ยืนยัน + สร้างบัญชีจริง) =====================
      case AuthStep.REGISTER_DETAIL:
        // NOTE: เดิมของเธอใช้เป็น "ลืมรหัสผ่าน"
        // ตอนนี้เราทำให้เป็น "สรุปข้อมูลสมัคร + กดสร้างบัญชี" หลัง OTP ผ่าน
        // ถ้ายังไม่ได้ OTP verified จะโชว์ UI ลืมรหัสผ่านเหมือนเดิม
        if (!otpRef || !otpVerified) {
          // === UI ลืมรหัสผ่าน (เดิม) ===
          return (
            <div className="min-h-screen w-full relative overflow-hidden cosmic-gradient flex flex-col items-center justify-center p-6">
              <CondoBackground />
              <Meteors />

              <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
                <img
                  src={rentsphereLogo}
                  alt="RentSphere"
                  className="w-28 md:w-32 lg:w-36 -mt-2 mb-3 drop-shadow-xl"
                />
                <h1 className="text-2xl font-bold text-blue-900 tracking-widest mb-12">
                  RENTSPHERE
                </h1>

                <div className="w-full bg-white p-10 rounded-[3rem] shadow-xl flex flex-col items-center">
                  <h3 className="text-xl font-medium text-gray-800 mb-8">
                    โปรดระบุช่องทางสำหรับตั้งรหัสผ่านใหม่
                  </h3>

                  <div className="flex w-full gap-4 mb-6">
                    <button
                      onClick={() => setForgotMethod("email")}
                      className={`flex-1 py-3 rounded-xl border transition-all font-medium ${
                        forgotMethod === "email"
                          ? "border-blue-400 text-blue-600"
                          : "border-gray-200 text-gray-400"
                      }`}
                    >
                      อีเมล
                    </button>
                    <button
                      onClick={() => setForgotMethod("phone")}
                      className={`flex-1 py-3 rounded-xl border transition-all font-medium ${
                        forgotMethod === "phone"
                          ? "border-blue-400 text-blue-600"
                          : "border-gray-200 text-gray-400"
                      }`}
                    >
                      เบอร์โทรศัพท์
                    </button>
                  </div>

                  <div className="w-full mb-8">
                    <label className="block text-[10px] font-bold text-gray-400 mb-1 ml-1 uppercase">
                      {forgotMethod === "email" ? "อีเมล" : "เบอร์โทรศัพท์"}
                    </label>
                    <input
                      type={forgotMethod === "email" ? "email" : "tel"}
                      className="w-full px-5 py-3 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder={
                        forgotMethod === "email" ? "example@mail.com" : "08X-XXX-XXXX"
                      }
                    />
                  </div>

                  <button
                    onClick={() => handleNextStep(AuthStep.OTP_VERIFY)}
                    className="w-full max-w-md py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg"
                  >
                    {forgotMethod === "email" ? "ส่งอีเมลรีเซ็ตรหัสผ่าน" : "ขอ OTP"}
                  </button>

                  <button
                    className="mt-6 text-xs text-blue-700 underline"
                    onClick={() => handleNextStep(AuthStep.LOGIN)}
                  >
                    กลับไปหน้าเข้าสู่ระบบ
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // === UI ยืนยันข้อมูลสมัคร + กดสร้างบัญชีจริง ===
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

              <div className="w-full bg-white p-10 rounded-[3rem] shadow-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                  ยืนยันข้อมูลสมัครสมาชิก
                </h3>

                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">บทบาท</span>
                    <span className="font-semibold">{backendRole}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">ชื่อ</span>
                    <span className="font-semibold">{regName || "-"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">อีเมล</span>
                    <span className="font-semibold">{regEmail || "-"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">เบอร์โทร</span>
                    <span className="font-semibold">{regPhone || "-"}</span>
                  </div>
                  {backendRole === "TENANT" && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Invite Code</span>
                      <span className="font-semibold">{inviteCode || "-"}</span>
                    </div>
                  )}
                </div>

                {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => handleNextStep(AuthStep.REGISTER_PHONE)}
                    className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-700 font-bold"
                    disabled={loading}
                  >
                    แก้ไข
                  </button>

                  <button
                    onClick={handleRegisterComplete}
                    disabled={loading}
                    className={`flex-1 py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
                  </button>
                </div>

                <button
                  className="mt-6 text-xs text-slate-500 underline"
                  onClick={() => handleNextStep(AuthStep.LOGIN)}
                >
                  ยกเลิกและกลับไปหน้าเข้าสู่ระบบ
                </button>
              </div>
            </div>
          </div>
        );

      // ===================== SET_PASSWORD (คง UI เดิมไว้) =====================
      case AuthStep.SET_PASSWORD:
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
                <h3 className="text-xl font-bold text-gray-800 mb-8 text-center">
                  โปรดตั้งรหัสผ่านใหม่
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-2">
                      รหัสผ่านใหม่ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-2">
                      ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => handleNextStep(AuthStep.LOGIN)}
                      className="w-full max-w-md py-4 btn-auth text-white rounded-2xl font-bold text-lg shadow-lg"
                    >
                      ยืนยัน
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="min-h-screen w-full">{renderStep()}</div>;
};

export default AuthPage;
