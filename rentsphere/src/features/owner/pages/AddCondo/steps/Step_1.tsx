import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/shared/api/http";

const STEP0_DRAFT_KEY = "add_condo_step0_draft";
const STEP_CONDO_ID_KEY = "add_condo_condoId"; 

type VariableType = "NONE" | "WATER" | "ELECTRIC" | "BOTH";

type CondoService = {
  id: string;
  condoId?: string;
  name: string;
  price: number; 
  isVariable: boolean;
  variableType: VariableType | string;
};

type Step1NavState = {
  condoId?: string;
  condoName?: string;
};

function readCondoNameFromDraft(): string | undefined {
  try {
    const raw = sessionStorage.getItem(STEP0_DRAFT_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    const name = String(parsed?.nameTh ?? "").trim();
    return name || undefined;
  } catch {
    return undefined;
  }
}

function normalizeService(s: any): CondoService {
  return {
    id: String(s?.id ?? ""),
    condoId: s?.condoId ? String(s.condoId) : undefined,
    name: String(s?.name ?? "").trim(),
    price: Number(s?.price ?? 0),
    isVariable: Boolean(s?.isVariable ?? false),
    variableType: String(s?.variableType ?? "NONE") as any,
  };
}

const Step_1: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const st = (location.state ?? {}) as Step1NavState;

  
  const condoId = useMemo(() => {
    const fromQuery = params.get("condoId");
    const fromState = st.condoId;
    const fromStorage = localStorage.getItem(STEP_CONDO_ID_KEY);
    const id = String(fromQuery ?? fromState ?? fromStorage ?? "").trim();
    if (id) localStorage.setItem(STEP_CONDO_ID_KEY, id);
    return id;
  }, [params, st.condoId]);

  const condoName =
    (st.condoName?.trim() ? st.condoName.trim() : undefined) ||
    readCondoNameFromDraft() ||
    (condoId ? `คอนโด #${condoId.slice(0, 8)}` : "ตั้งค่าคอนโดมิเนียม");


  const [services, setServices] = useState<CondoService[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);


  const [serviceName, setServiceName] = useState("");
  const [priceText, setPriceText] = useState("");
  const [isVariable, setIsVariable] = useState(false);
  const [useWater, setUseWater] = useState(false);
  const [useElectric, setUseElectric] = useState(false);

  const priceNumber = useMemo(() => {
    const raw = String(priceText).replace(/,/g, "").trim();
    if (raw === "") return NaN;
    const v = Number(raw);
    return Number.isFinite(v) ? v : NaN;
  }, [priceText]);

  const canAdd = serviceName.trim().length > 0 && !Number.isNaN(priceNumber) && priceNumber >= 0;

  const variableType: VariableType =
    !isVariable
      ? "NONE"
      : useWater && useElectric
        ? "BOTH"
        : useWater
          ? "WATER"
          : useElectric
            ? "ELECTRIC"
            : "NONE";


  useEffect(() => {
    if (!condoId) return;

    let alive = true;
    (async () => {
      setLoading(true);
      setApiError(null);
      try {
        const list = await api<any[]>(`/owner/condos/${condoId}/services`, { method: "GET" });
        if (!alive) return;
        setServices((list ?? []).map(normalizeService));
      } catch (e: any) {
        if (!alive) return;
        setApiError(e?.message ?? "โหลดค่าบริการไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [condoId]);

  const refreshServices = async () => {
    if (!condoId) return;
    const list = await api<any[]>(`/owner/condos/${condoId}/services`, { method: "GET" });
    setServices((list ?? []).map(normalizeService));
  };

  const handleAdd = async () => {
    if (!condoId) return;
    const cleanName = serviceName.trim();
    if (!cleanName) return;

    const dup = services.some((s) => s.name.trim().toLowerCase() === cleanName.toLowerCase());
    if (dup) {
      setApiError("มีชื่อค่าบริการนี้แล้ว");
      return;
    }

    setLoading(true);
    setApiError(null);
    try {
      await api(`/owner/condos/${condoId}/services`, {
        method: "POST",
        body: JSON.stringify({
          name: cleanName,
          price: priceNumber,
          isVariable,
          variableType,
        }),
      });

 
      setServiceName("");
      setPriceText("");
      setIsVariable(false);
      setUseWater(false);
      setUseElectric(false);

      await refreshServices();
    } catch (e: any) {
      setApiError(e?.message ?? "เพิ่มค่าบริการไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

 
  const handleRemove = async (serviceId: string) => {
    if (!condoId) return;

    setLoading(true);
    setApiError(null);
    try {
      await api(`/owner/condos/${condoId}/services/${serviceId}`, { method: "DELETE" });
      await refreshServices();
    } catch (e: any) {
      setApiError(e?.message ?? "ลบค่าบริการไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    nav("../step-0", { state: { condoId, condoName } });
  };


  const goNext = () => {
    nav(`../step-2?condoId=${encodeURIComponent(condoId)}`, { state: { condoId, condoName } });
  };

  return (
    <div className="w-full max-w-[1120px] mx-auto flex flex-col gap-[18px] pb-[110px]">
      <div className="text-center mb-[6px] mt-[6px]">
        <h1 className="text-[34px] font-extrabold text-black/85 tracking-[0.2px]">ตั้งค่าคอนโดมิเนียม</h1>
        <div className="mt-2 inline-flex items-center px-4 py-2 rounded-full bg-white shadow-sm border border-blue-100/60 text-sm font-extrabold text-gray-800">
          {condoName}
        </div>
      </div>

      {apiError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700 font-extrabold">
          {apiError}
        </div>
      )}

      <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden">
        <div className="flex items-center gap-3 px-8 py-5 bg-[#f3f7ff] border-b border-blue-100/60">
          <div className="h-9 w-1.5 rounded-full bg-[#5b86ff]" />
          <div>
            <div className="text-xl font-extrabold text-gray-900 tracking-tight">ค่าบริการเพิ่มเติม</div>
            <div className="mt-1 text-sm font-bold text-gray-600">ค่าอินเตอร์เน็ต, ค่าฟิตเนส และค่าบริการอื่น ๆ ที่เรียกเก็บเพิ่ม</div>
          </div>
        </div>

        <div className="px-8 py-7 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-6">
              <label className="block text-sm font-extrabold text-gray-800 mb-2">
                ชื่อค่าบริการ <span className="text-rose-600">*</span>
              </label>
              <input
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="เช่น ค่าอินเตอร์เน็ต / ค่าฟิตเนส"
                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 shadow-sm
                           focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300"
              />
            </div>

            <div className="lg:col-span-5">
              <label className="block text-sm font-extrabold text-gray-800 mb-2">
                ราคาต่อหน่วย <span className="text-rose-600">*</span>
              </label>
              <div className="flex items-center">
                <input
                  value={priceText}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (!/^[0-9,]*$/.test(next)) return;
                    setPriceText(next);
                  }}
                  inputMode="numeric"
                  placeholder="0"
                  className="w-full h-12 rounded-l-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 shadow-sm
                             focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300"
                />
                <div className="h-12 px-4 rounded-r-xl border border-l-0 border-gray-200 bg-slate-50 text-sm font-extrabold text-gray-600 flex items-center">
                  บาท
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 flex lg:justify-end">
              <button
                type="button"
                onClick={handleAdd}
                disabled={!canAdd || !condoId || loading}
                className={[
                  "h-12 px-6 rounded-xl font-extrabold text-sm shadow-[0_12px_22px_rgba(0,0,0,0.12)] transition",
                  "focus:outline-none focus:ring-4 focus:ring-blue-200/60 active:scale-[0.98]",
                  canAdd && condoId && !loading
                    ? "bg-[#93C5FD] hover:bg-[#7fb4fb] text-white"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none",
                ].join(" ")}
              >
                {loading ? "กำลังบันทึก..." : "เพิ่ม"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden">
            <label className="flex items-center gap-3 px-6 py-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isVariable}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsVariable(checked);
                  if (!checked) {
                    setUseWater(false);
                    setUseElectric(false);
                  }
                }}
                className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-extrabold text-black-900">ประเภทแปรผันตามมิเตอร์</span>
            </label>

            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: isVariable ? "200px" : "0px", opacity: isVariable ? 1 : 0 }}
            >
              <div className="px-6 pb-5 space-y-2">
                <div className="text-sm font-extrabold text-black-800 mb-3">คำนวณตามการใช้งาน</div>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useWater}
                    onChange={(e) => setUseWater(e.target.checked)}
                    className="h-5 w-5 rounded border-black-300 text-black-600 focus:ring-black-500"
                  />
                  <span className="text-sm font-bold text-gray-700">
                    จำนวนหน่วยการใช้ - <span className="font-extrabold text-black-900">ค่าน้ำ</span>
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useElectric}
                    onChange={(e) => setUseElectric(e.target.checked)}
                    className="h-5 w-5 rounded border-black-300 text-black-600 focus:ring-black-500"
                  />
                  <span className="text-sm font-bold text-gray-700">
                    จำนวนหน่วยการใช้ - <span className="font-extrabold text-black-900">ค่าไฟ</span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="h-px bg-blue-100/60" />

          <div className="rounded-2xl border border-blue-100/60 overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-50 px-6 py-4 text-sm font-extrabold text-gray-700">
              <div className="col-span-7">รายการ</div>
              <div className="col-span-3">คำนวณตาม</div>
              <div className="col-span-2 text-right">ราคา</div>
            </div>

            {!condoId ? (
              <div className="px-6 py-10 text-center text-sm font-bold text-amber-700 bg-amber-50">
                ⚠️ ไม่พบ condoId แนะนำกลับไป Step0 แล้วสร้างคอนโดก่อน
              </div>
            ) : loading && services.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm font-bold text-gray-500 bg-white">กำลังโหลด...</div>
            ) : services.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm font-bold text-gray-500 bg-white">ยังไม่มีรายการค่าบริการ</div>
            ) : (
              <div className="bg-white">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="grid grid-cols-12 px-6 py-4 text-sm border-t border-blue-100/40 items-center"
                  >
                    <div className="col-span-7 font-extrabold text-gray-900">{s.name}</div>
                    <div className="col-span-3 font-bold text-gray-600">
                      {s.isVariable
                        ? s.variableType === "BOTH"
                          ? "มิเตอร์ (น้ำ+ไฟ)"
                          : s.variableType === "WATER"
                            ? "มิเตอร์ (น้ำ)"
                            : s.variableType === "ELECTRIC"
                              ? "มิเตอร์ (ไฟ)"
                              : "มิเตอร์"
                        : "คงที่"}
                    </div>

                    <div className="col-span-2 text-right flex items-center justify-end gap-3">
                      <div className="font-extrabold text-gray-900">{Number(s.price).toLocaleString()} บาท</div>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleRemove(s.id)}
                        className="px-3 py-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 font-extrabold text-xs hover:bg-rose-100 disabled:opacity-60"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!condoId && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800 font-extrabold">
              ⚠️ ไม่พบ condoId (เข้าหน้านี้โดยตรง) แนะนำกลับไป Step0 แล้วกด “สร้าง” ใหม่
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-[14px] flex-wrap pt-4">
        <button
          type="button"
          onClick={goBack}
          className="h-[46px] px-6 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
                         focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          ย้อนกลับ
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={!condoId}
          className={[
            "h-[46px] w-24 rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition",
            "!bg-[#93C5FD] hover:!bg-[#7fb4fb] active:scale-[0.98] cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-blue-300",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100",
          ].join(" ")}
        >
          ต่อไป
        </button>
      </div>
    </div>
  );
};

export default Step_1;