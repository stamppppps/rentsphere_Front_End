import ElectricIconImg from "@/assets/Electric.png";
import WaterIconImg from "@/assets/Water.png";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UtilitySetupCard from "../components/UtilitySetupCard";
import { api } from "@/shared/api/http";

const STEP_CONDO_ID_KEY = "add_condo_condoId";

type UtilityType = "water" | "electricity";
type BillingType = "METER" | "METER_MIN" | "FLAT";

type UtilityConfig = {
  billingType: BillingType;
  rate: number;
};

type UtilityDbRow = {
  id: string;
  condoId: string;
  utilityType: "WATER" | "ELECTRIC";
  billingType: BillingType;
  rate: string | number; 
};


type CondoDTO = {
  id: string;
  nameTh: string;
  nameEn?: string | null;
};

function toDbUtilityType(u: UtilityType): "WATER" | "ELECTRIC" {
  return u === "water" ? "WATER" : "ELECTRIC";
}

function fromDbUtilityType(u: "WATER" | "ELECTRIC"): UtilityType {
  return u === "WATER" ? "water" : "electricity";
}

function billingTypeLabel(bt: BillingType) {
  if (bt === "METER") return "คิดตามหน่วยจริงจากมิเตอร์";
  if (bt === "METER_MIN") return "คิดตามหน่วยจริงแบบมีขั้นต่ำ";
  return "เหมาจ่ายรายเดือน";
}

function utilityLabel(u: UtilityType) {
  return u === "water" ? "ค่าน้ำ" : "ค่าไฟ";
}

function UtilityConfigPopup({
  open,
  utilityType,
  initial,
  onClose,
  onSave,
  saving,
}: {
  open: boolean;
  utilityType: UtilityType | null;
  initial: UtilityConfig | null;
  onClose: () => void;
  onSave: (config: UtilityConfig) => void;
  saving: boolean;
}) {
  const [billingType, setBillingType] = useState<BillingType | "">("");
  const [rate, setRate] = useState("");

  useEffect(() => {
    if (!open) return;

 
    setBillingType(initial?.billingType ?? "");
    setRate(initial ? String(initial.rate) : "");
  }, [open, initial]);

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

  const canSave = billingType !== "" && Number.isFinite(rateNumber) && !saving;

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
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}

const Step_2: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();

  //condoId from state OR localStorage
  const condoId: string = useMemo(() => {
    const fromState = (location.state as any)?.condoId;
    const fromStorage = localStorage.getItem(STEP_CONDO_ID_KEY);
    return String(fromState ?? fromStorage ?? "");
  }, [location.state]);

  useEffect(() => {
    if (condoId) localStorage.setItem(STEP_CONDO_ID_KEY, condoId);
  }, [condoId]);


  useEffect(() => {
    if (!condoId) nav("/owner/add-condo/step-0");
  }, [condoId, nav]);

  
  const [condoName, setCondoName] = useState<string>("");


  useEffect(() => {
    if (!condoId) return;

    let alive = true;

    (async () => {
      try {
        const condo = await api<CondoDTO>(`/owner/condos/${condoId}`, {
          method: "GET",
        });

        if (!alive) return;

        const name =
          String(condo?.nameTh ?? "").trim() ||
          String(condo?.nameEn ?? "").trim();

        setCondoName(name);
      } catch (e) {
        if (!alive) return;
        setCondoName("");
      }
    })();

    return () => {
      alive = false;
    };
  }, [condoId]);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentUtility, setCurrentUtility] = useState<UtilityType | null>(null);

  const [utilityConfig, setUtilityConfig] = useState<
    Record<UtilityType, UtilityConfig | null>
  >({
    water: null,
    electricity: null,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

 
  useEffect(() => {
    if (!condoId) return;

    const run = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const list = await api<UtilityDbRow[]>(
          `/owner/condos/${condoId}/utilities`,
          {
            method: "GET",
          }
        );

        const next: Record<UtilityType, UtilityConfig | null> = {
          water: null,
          electricity: null,
        };

        (list ?? []).forEach((row) => {
          const u = fromDbUtilityType(row.utilityType);
          const rateNum =
            typeof row.rate === "string" ? Number(row.rate) : Number(row.rate);

          next[u] = {
            billingType: row.billingType,
            rate: Number.isFinite(rateNum) ? rateNum : 0,
          };
        });

        setUtilityConfig(next);
      } catch (e: any) {
        setApiError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [condoId]);

  const handleOpenModal = (utility: UtilityType) => {
    setCurrentUtility(utility);
    setModalOpen(true);
    setApiError(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentUtility(null);
  };

  const handleSave = async (config: UtilityConfig) => {
    if (!currentUtility || !condoId) return;

    setSaving(true);
    setApiError(null);

    try {
      await api(`/owner/condos/${condoId}/utilities`, {
        method: "POST",
        body: JSON.stringify({
          utilityType: toDbUtilityType(currentUtility),
          billingType: config.billingType,
          rate: config.rate,
        }),
      });

      setUtilityConfig((prev) => ({ ...prev, [currentUtility]: config }));
      handleCloseModal();
    } catch (e: any) {
      setApiError(e?.message ?? "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const canNext = Boolean(utilityConfig.water && utilityConfig.electricity);

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

            
            {condoId && (
              <div className="mt-2 inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-extrabold text-slate-700 border border-blue-100/70">
                คอนโด: {condoName ? condoName : `#${condoId.slice(0, 8)}...`}
              </div>
            )}
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

          {apiError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700 font-extrabold">
              {apiError}
            </div>
          )}

          {loading && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-blue-700 font-extrabold">
              กำลังโหลดข้อมูล...
            </div>
          )}

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
                  ? `ตั้งค่าแล้ว: ${billingTypeLabel(
                      utilityConfig.water.billingType
                    )} (${utilityConfig.water.rate.toLocaleString()} บาท)`
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
                  ? `ตั้งค่าแล้ว: ${billingTypeLabel(
                      utilityConfig.electricity.billingType
                    )} (${utilityConfig.electricity.rate.toLocaleString()} บาท)`
                  : "ระบุการคิดค่าไฟ"
              }
            />
          </div>

          <div className="rounded-2xl border border-blue-100/60 bg-white p-6">
            <div className="text-sm font-extrabold text-gray-900 mb-2">สรุป</div>
            <div className="text-sm font-bold text-gray-700 space-y-1">
              <div>
                {utilityLabel("water")}:{" "}
                {utilityConfig.water
                  ? `${billingTypeLabel(utilityConfig.water.billingType)} ${utilityConfig.water.rate.toLocaleString()}`
                  : "ยังไม่ตั้งค่า"}
              </div>
              <div>
                {utilityLabel("electricity")}:{" "}
                {utilityConfig.electricity
                  ? `${billingTypeLabel(
                      utilityConfig.electricity.billingType
                    )}  ${utilityConfig.electricity.rate.toLocaleString()}`
                  : "ยังไม่ตั้งค่า"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-[14px] flex-wrap pt-4">
        <button
          type="button"
          onClick={() => nav("../step-1", { state: { condoId } })}
          className="h-[46px] px-6 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
                         focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          ย้อนกลับ
        </button>

        <button
          type="button"
          disabled={!canNext}
          onClick={() => nav("../step-3", { state: { condoId } })}
          className={[
            "h-[46px] w-24 rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition",
            "focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-[0.98]",
            canNext
              ? "!bg-[#93C5FD] hover:!bg-[#7fb4fb] cursor-pointer"
              : "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none",
          ].join(" ")}
        >
          ต่อไป
        </button>
      </div>

      <UtilityConfigPopup
        open={modalOpen}
        utilityType={currentUtility}
        initial={currentUtility ? utilityConfig[currentUtility] : null}
        onClose={handleCloseModal}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
};

export default Step_2;