import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import { CondoBackground, Meteors } from "@/features/auth/components/AuthBackground";
import { useOwnerRegisterStore } from "@/features/auth/ownerRegister.store";

const OwnerVerifyMethodPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const storeRequestId = useOwnerRegisterStore((s) => s.requestId);
  const email = useOwnerRegisterStore((s) => s.email);
  const phone = useOwnerRegisterStore((s) => s.phone);
  const storeChannel = useOwnerRegisterStore((s) => s.channel);
  const setRequestId = useOwnerRegisterStore((s) => s.setRequestId);

  const requestIdFromUrl = params.get("requestId") || "";
  const channelFromUrl = (params.get("channel") as "EMAIL" | "PHONE" | null) || null;
  const requestId = storeRequestId || requestIdFromUrl;
  const channel = storeChannel || channelFromUrl || "EMAIL";

  React.useEffect(() => {
    if (!storeRequestId && requestIdFromUrl) setRequestId(requestIdFromUrl);
  }, [storeRequestId, requestIdFromUrl, setRequestId]);

  const goEmail = () => {
    if (!requestId) return navigate("/auth/owner/register");
    navigate(`/auth/owner/verify-email?requestId=${encodeURIComponent(requestId)}`);
  };

  const goOtp = () => {
    if (!requestId) return navigate("/auth/owner/register");
    navigate(`/auth/owner/verify-phone?requestId=${encodeURIComponent(requestId)}`);
  };

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
            <p className="mt-2 text-sm text-white/60">เลือกวิธียืนยันตัวตน (OWNER)</p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white/80 text-sm">
              <div className="font-semibold text-white/90 mb-1">ข้อมูลที่ใช้สมัคร</div>
              <div>อีเมล: <span className="font-semibold">{email || "—"}</span></div>
              <div>เบอร์: <span className="font-semibold">{phone || "—"}</span></div>
            </div>

            <button
              type="button"
              className={`btn-auth w-full ${channel !== "EMAIL" ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={channel === "EMAIL" ? goEmail : undefined}
            >
              ยืนยันอีเมล (กรอกรหัส 6 หลักจากอีเมล)
            </button>

            <button
              type="button"
              className={`btn-auth w-full ${channel !== "PHONE" ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={channel === "PHONE" ? goOtp : undefined}
            >
              ยืนยันเบอร์ (กรอก OTP 6 หลัก)
            </button>

            <p className="text-xs text-white/60 leading-relaxed">
              ช่องทางที่คุณเลือกตอนสมัครคือ: <span className="font-semibold text-white/80">{channel}</span>
              <br />
              หมายเหตุ (Production): สมัคร → ยืนยันช่องทางที่เลือก → จากนั้นล็อกอินได้เลย
            </p>

            <div className="pt-2 text-center">
              <button
                type="button"
                className="text-sky-300 hover:text-sky-200 underline underline-offset-4 text-sm"
                onClick={() => navigate("/auth/owner/register")}
              >
                กลับไปหน้า สมัครสมาชิก
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerVerifyMethodPage;
