import ElectricIconImg from "@/assets/Electric.png";
import WaterIconImg from "@/assets/Water.png";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UtilitySetupCard from "../components/UtilitySetupCard";

type UtilityType = "water" | "electricity";
type BillingType = "METER" | "METER_MIN" | "FLAT";

type UtilityConfig = {
  billingType: BillingType;
  rate: number;
};

function UtilityConfigPopup({
  open,
  utilityType,
  onClose,
  onSave,
}: {
  open: boolean;
  utilityType: UtilityType | null;
  onClose: () => void;
  onSave: (config: UtilityConfig) => void;
}) {
  const [billingType, setBillingType] = useState<BillingType | "">("");
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

  const rateNumber = useMemo(() => {
    const raw = String(rate).replace(/,/g, "").trim();
    if (!raw) return NaN;
    const v = Number(raw);
    return Number.isFinite(v) ? v : NaN;
  }, [rate]);

  const canSave = billingType !== "" && Number.isFinite(rateNumber);

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
            <div className="text-sm font-bold text-gray-600 mt-0.5">
              กำหนดรูปแบบการคิดเงินและราคา
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-extrabold text-gray-800 mb-2">
              ประเภทการคิดเงิน <span className="text-rose-600">*</span>
            </label>
            <select
              value={billingType}
              onChange={(e) => setBillingType(e.target.value as BillingType)}
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
              onChange={(e) => {
                const next = e.target.value;
                if (!/^[0-9.,]*$/.test(next)) return;
                setRate(next);
              }}
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
            onClick={() => {
              if (billingType === "" || !Number.isFinite(rateNumber)) return;
              onSave({ billingType, rate: rateNumber });
            }}
            disabled={!canSave}
            className={[
              "h-[44px] px-7 rounded-xl font-black text-sm transition shadow-[0_12px_22px_rgba(0,0,0,0.14)]",
              "focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-[0.98]",
              canSave
                ? "bg-[#93C5FD] hover:bg-[#7fb4fb] text-white"
                : "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none",
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

  const [utilityConfig, setUtilityConfig] = useState<
    Record<UtilityType, UtilityConfig | null>
  >({
    water: null,
    electricity: null,
  });

  const handleOpenModal = (utility: UtilityType) => {
    setCurrentUtility(utility);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentUtility(null);
  };

  const handleSave = (config: UtilityConfig) => {
    if (!currentUtility) return;
    setUtilityConfig((prev) => ({ ...prev, [currentUtility]: config }));
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
            <div className="text-xl font-extrabold text-gray-900 tracking-tight">
              การคิดค่าน้ำ / ค่าไฟ
            </div>
            <div className="mt-1 text-sm font-bold text-gray-600">
              กำหนดรูปแบบการคิด พร้อมตั้งค่าเงื่อนไขและราคา
            </div>
          </div>
        </div>

        <div className="px-8 py-7 space-y-6">
          <div className="rounded-2xl border border-blue-100/60 bg-white p-6">
            <div className="text-sm font-extrabold text-gray-900 mb-2">
              รูปแบบการกำหนดค่าน้ำค่าไฟ
            </div>
            <ul className="list-disc pl-6 text-sm font-bold text-gray-600 space-y-1">
              <li>คิดตามหน่วยจริงจากมิเตอร์</li>
              <li>คิดตามหน่วยจริงแบบมีขั้นต่ำ</li>
              <li>คิดแบบเหมาจ่ายรายเดือน</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UtilitySetupCard
              icon={
                <img
                  src={WaterIconImg}
                  alt="Water"
                  className="w-[80px] h-[80px] object-contain drop-shadow-lg"
                />
              }
              onConfigure={() => handleOpenModal("water")}
              buttonText={
                utilityConfig.water
                  ? `ตั้งค่าแล้ว: ${utilityConfig.water.billingType} (${utilityConfig.water.rate.toLocaleString()} บาท)`
                  : "ระบุการคิดค่าน้ำ"
              }
            />

            <UtilitySetupCard
              icon={
                <img
                  src={ElectricIconImg}
                  alt="Electric"
                  className="w-[80px] h-[80px] object-contain drop-shadow-lg"
                />
              }
              onConfigure={() => handleOpenModal("electricity")}
              buttonText={
                utilityConfig.electricity
                  ? `ตั้งค่าแล้ว: ${utilityConfig.electricity.billingType} (${utilityConfig.electricity.rate.toLocaleString()} บาท)`
                  : "ระบุการคิดค่าไฟ"
              }
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-[14px] flex-wrap pt-4">
        <button
          type="button"
          onClick={() => nav("../step-1")}
          className="h-[46px] px-6 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
                         focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          ย้อนกลับ
        </button>

        <button
          type="button"
          onClick={() => nav("../step-3")}
          className="h-[46px] w-24 rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition
                         !bg-[#93C5FD] hover:!bg-[#7fb4fb] active:scale-[0.98] cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          ต่อไป
        </button>
      </div>

      <UtilityConfigPopup
        open={modalOpen}
        utilityType={currentUtility}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  );
};

export default Step_2;