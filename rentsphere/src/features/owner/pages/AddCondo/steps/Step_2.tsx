import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UtilitySetupCard from "../components/UtilitySetupCard";

type UtilityType = "water" | "electricity";

const WaterIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_101_2)">
      <path
        d="M50 8C26.8 8 8 28.1 8 50.5C8 71.5 35.7 92 50 92C64.3 92 92 71.5 92 50.5C92 28.1 73.2 8 50 8Z"
        fill="url(#paint0_linear_101_2)"
      />
    </g>
    <path
      d="M50 22C38.4 22 29 31.9 29 42.7C29 52.9 44.28 68 50 68C55.72 68 71 52.9 71 42.7C71 31.9 61.6 22 50 22Z"
      fill="white"
      fillOpacity="0.5"
    />
    <defs>
      <filter id="filter0_d_101_2" x="0" y="0" width="100" height="100" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset />
        <feGaussianBlur stdDeviation="4" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.490196 0 0 0 0 0.701961 0 0 0 0 0.933333 0 0 0 0.5 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_101_2" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_101_2" result="shape" />
      </filter>
      <linearGradient id="paint0_linear_101_2" x1="50" y1="8" x2="50" y2="92" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A8B5FF" />
        <stop offset="1" stopColor="#818CF8" />
      </linearGradient>
    </defs>
  </svg>
);

const ElectricityIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_101_3)">
      <path
        d="M50 8C26.8 8 8 28.1 8 50.5C8 71.5 35.7 92 50 92C64.3 92 92 71.5 92 50.5C92 28.1 73.2 8 50 8Z"
        fill="url(#paint0_linear_101_3)"
      />
    </g>
    <path d="M57.5 29L40 50.6H51L45.5 67L63 43.4H52L57.5 29Z" fill="white" fillOpacity="0.7" />
    <defs>
      <filter id="filter0_d_101_3" x="0" y="0" width="100" height="100" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset />
        <feGaussianBlur stdDeviation="4" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.988235 0 0 0 0 0.8 0 0 0 0 0.564706 0 0 0 0.5 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_101_3" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_101_3" result="shape" />
      </filter>
      <linearGradient id="paint0_linear_101_3" x1="50" y1="8" x2="50" y2="92" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDBA74" />
        <stop offset="1" stopColor="#FB923C" />
      </linearGradient>
    </defs>
  </svg>
);

function UtilityConfigPopup({
  open,
  utilityType,
  onClose,
  onSave,
}: {
  open: boolean;
  utilityType: UtilityType | null;
  onClose: () => void;
  onSave: (config: { billingType: string; rate: number }) => void;
}) {
  const [billingType, setBillingType] = useState("");
  const [rate, setRate] = useState("");

  useEffect(() => {
    if (!open) return;
    setBillingType("");
    setRate("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const title = useMemo(() => {
    if (utilityType === "water") return "ค่าน้ำ";
    if (utilityType === "electricity") return "ค่าไฟ";
    return "ตั้งค่า";
  }, [utilityType]);

  const canSave = billingType.trim().length > 0 && rate.trim().length > 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="close"
        className="absolute inset-0 bg-[#EEF4FF]/85 backdrop-blur-[6px]"
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white border border-blue-100/70 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <div className="flex items-center gap-3 px-6 py-5 bg-[#f3f7ff] border-b border-blue-100/70">
          <div className="h-9 w-1.5 rounded-full bg-[#5b86ff]" />
          <div>
            <div className="text-lg font-extrabold text-gray-900">{title}</div>
            <div className="text-sm font-bold text-gray-600 mt-0.5">กำหนดรูปแบบการคิดเงินและราคา</div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-extrabold text-gray-800 mb-2">
              ประเภทการคิดเงิน <span className="text-rose-600">*</span>
            </label>
            <select
              value={billingType}
              onChange={(e) => setBillingType(e.target.value)}
              className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 shadow-sm
                         focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300"
            >
              <option value="">เลือกประเภท</option>
              <option value="METER">คิดตามหน่วยจริงจากมิเตอร์</option>
              <option value="METER_MIN">คิดตามหน่วยจริงแบบมีขั้นต่ำ</option>
              <option value="FLAT">เหมาจ่ายรายเดือน</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-gray-800 mb-2">
              บาท / ยูนิต <span className="text-rose-600">*</span>
            </label>
            <input
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 shadow-sm
                         focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300"
            />
          </div>
        </div>

        <div className="px-6 py-5 bg-white border-t border-blue-100/70 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-[44px] px-6 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition"
          >
            ปิด
          </button>

          <button
            type="button"
            onClick={() =>
              onSave({
                billingType,
                rate: Number(String(rate).replace(/,/g, "")),
              })
            }
            disabled={!canSave}
            className={[
              "h-[44px] px-7 rounded-xl font-black text-sm transition shadow-[0_12px_22px_rgba(0,0,0,0.14)]",
              "focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-[0.98]",
              canSave ? "bg-[#93C5FD] hover:bg-[#7fb4fb] text-white" : "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none",
            ].join(" ")}
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

const Step_2: React.FC = () => {
  const nav = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [currentUtility, setCurrentUtility] = useState<UtilityType | null>(null);

  const handleOpenModal = (utility: UtilityType) => {
    setCurrentUtility(utility);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentUtility(null);
  };

  const handleSave = (config: { billingType: string; rate: number }) => {
    console.log("Saving config:", { utility: currentUtility, ...config });
    handleCloseModal();
  };

  return (
    <div className="w-full max-w-[1120px] mx-auto flex flex-col gap-[18px] pb-[110px]">
      <h1 className="text-center text-[34px] font-extrabold text-black/85 tracking-[0.2px] mb-[6px] mt-[6px]">
        ตั้งค่าคอนโดมิเนียม
      </h1>

      <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden">
        <div className="flex items-center gap-3 px-8 py-5 bg-[#f3f7ff] border-b border-blue-100/60">
          <div className="h-9 w-1.5 rounded-full bg-[#5b86ff]" />
          <div>
            <div className="text-xl font-extrabold text-gray-900 tracking-tight">การคิดค่าน้ำ / ค่าไฟ</div>
            <div className="mt-1 text-sm font-bold text-gray-600">กำหนดรูปแบบการคิด พร้อมตั้งค่าเงื่อนไขและราคา</div>
          </div>
        </div>

        <div className="px-8 py-7 space-y-6">
          <div className="rounded-2xl border border-blue-100/60 bg-white p-6">
            <div className="text-sm font-extrabold text-gray-900 mb-2">รูปแบบการกำหนดค่าน้ำค่าไฟ</div>
            <ul className="list-disc pl-6 text-sm font-bold text-gray-600 space-y-1">
              <li>คิดตามหน่วยจริงจากมิเตอร์</li>
              <li>คิดตามหน่วยจริงแบบมีขั้นต่ำ</li>
              <li>คิดแบบเหมาจ่ายรายเดือน</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UtilitySetupCard icon={<WaterIcon />} onConfigure={() => handleOpenModal("water")} buttonText="ระบุการคิดค่าน้ำ" />
            <UtilitySetupCard
              icon={<ElectricityIcon />}
              onConfigure={() => handleOpenModal("electricity")}
              buttonText="ระบุการคิดค่าไฟ"
            />
          </div>
        </div>
      </div>

      <div className="fixed left-0 right-0 bottom-0 z-40 w-full bg-[rgba(238,244,255,0.9)] backdrop-blur-[8px] border-t border-[rgba(147,197,253,0.45)] py-[18px]">
        <div className="w-full max-w-[1120px] mx-auto px-6">
          <div className="flex items-center justify-end gap-[14px] flex-wrap">
            <button
              type="button"
              onClick={() => nav("../step-1")}
              className="h-[46px] px-6 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition"
            >
              ย้อนกลับ
            </button>

            <button
              type="button"
              onClick={() => nav("../step-3")}
              className="h-[46px] w-24 rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition
                         bg-[#93C5FD] hover:bg-[#7fb4fb] active:scale-[0.98] cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              ต่อไป
            </button>
          </div>
        </div>
      </div>

      <UtilityConfigPopup open={modalOpen} utilityType={currentUtility} onClose={handleCloseModal} onSave={handleSave} />
    </div>
  );
};

export default Step_2;