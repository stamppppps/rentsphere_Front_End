import { api } from "@/shared/api/http";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import CondoInfoSection from "../components/CondoInfoSection";
import OtherDetailsSection from "../components/OtherDetailsSection";
import PaymentSection from "../components/PaymentSection";

const STEP0_DRAFT_KEY = "add_condo_step0_draft";

interface Step0FormData {
  nameTh: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  addressTh: string;
  nameEn: string;
  subdistrictEn: string;
  districtEn: string;
  provinceEn: string;
  postalCodeEn: string;
  addressEn: string;
  phoneNumber: string;
  taxId: string;
  dueDay: string;
  finePerDay: string;
  acceptFine: boolean;
}

type CreateCondoPayload = {
  nameTh: string;
  subdistrictTh?: string | null;
  districtTh?: string | null;
  provinceTh?: string | null;
  postalCodeTh?: string | null;
  addressTh: string;

  nameEn?: string | null;
  subdistrictEn?: string | null;
  districtEn?: string | null;
  provinceEn?: string | null;
  postalCodeEn?: string | null;
  addressEn?: string | null;

  phoneNumber?: string | null;
  taxId?: string | null;
  billing: {
    dueDay: number;
    acceptFine: boolean;
    finePerDay?: number | null;
  };
};

type CondoDetailResponse = {
  id: string;
  nameTh?: string | null;
  subdistrictTh?: string | null;
  districtTh?: string | null;
  provinceTh?: string | null;
  postalCodeTh?: string | null;
  addressTh?: string | null;

  nameEn?: string | null;
  subdistrictEn?: string | null;
  districtEn?: string | null;
  provinceEn?: string | null;
  postalCodeEn?: string | null;
  addressEn?: string | null;

  phoneNumber?: string | null;
  taxId?: string | null;
  billingSetting?: {
    dueDay?: number | null;
    acceptFine?: boolean | null;
    finePerDay?: number | null;
  } | null;
};

type LocationState = {
  condoId?: string;
  condoName?: string;
} | null;

const emptyForm: Step0FormData = {
  nameTh: "",
  subdistrict: "",
  district: "",
  province: "",
  postalCode: "",
  addressTh: "",
  nameEn: "",
  subdistrictEn: "",
  districtEn: "",
  provinceEn: "",
  postalCodeEn: "",
  addressEn: "",
  phoneNumber: "",
  taxId: "",
  dueDay: "",
  finePerDay: "",
  acceptFine: false,
};

const normalizeMoney = (v: string) => {
  const raw = String(v ?? "").replace(/,/g, "").trim();
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
};

const asOpt = (v: string) => (v?.trim() ? v.trim() : null);

function toDueDay(dueDay: string): number | null {
  const n = Number(String(dueDay ?? "").trim());
  if (!Number.isFinite(n)) return null;
  const day = Math.trunc(n);
  return day >= 1 && day <= 28 ? day : null;
}

function buildCreateCondoJson(form: Step0FormData): CreateCondoPayload {
  const dueDay = toDueDay(form.dueDay);
  if (!dueDay) throw new Error("กรุณาเลือกวันครบกำหนดชำระ (1-28)");

  const acceptFine = Boolean(form.acceptFine);
  const fine = normalizeMoney(form.finePerDay);

  if (acceptFine && fine == null) {
    throw new Error("กรุณากรอกค่าปรับ/วัน เมื่อเปิดใช้งานค่าปรับ");
  }

  return {
    nameTh: form.nameTh.trim(),
    subdistrictTh: asOpt(form.subdistrict),
    districtTh: asOpt(form.district),
    provinceTh: asOpt(form.province),
    postalCodeTh: asOpt(form.postalCode),
    addressTh: form.addressTh.trim(),

    nameEn: asOpt(form.nameEn),
    subdistrictEn: asOpt(form.subdistrictEn),
    districtEn: asOpt(form.districtEn),
    provinceEn: asOpt(form.provinceEn),
    postalCodeEn: asOpt(form.postalCodeEn),
    addressEn: asOpt(form.addressEn),

    phoneNumber: asOpt(form.phoneNumber),
    taxId: asOpt(form.taxId),
    billing: {
      dueDay,
      acceptFine,
      finePerDay: acceptFine ? fine! : null,
    },
  };
}

async function createCondo(form: Step0FormData): Promise<{ condoId: string }> {
  const payload = buildCreateCondoJson(form);

  const data = await api<any>("/owner/condos", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const condoId = String(data?.id ?? data?.condoId ?? "");
  if (!condoId) throw new Error("สร้างคอนโดไม่สำเร็จ (ไม่ได้รับ condoId)");
  return { condoId };
}

async function fetchCondoById(condoId: string): Promise<CondoDetailResponse> {
  return await api<CondoDetailResponse>(
    `/owner/condos/${encodeURIComponent(condoId)}`
  );
}

async function updateCondo(condoId: string, form: Step0FormData): Promise<void> {
  const payload = buildCreateCondoJson(form);

  await api(`/owner/condos/${encodeURIComponent(condoId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

function mapCondoToForm(data: CondoDetailResponse): Step0FormData {
  const billing = data?.billingSetting;

  return {
    nameTh: String(data?.nameTh ?? ""),
    subdistrict: String(data?.subdistrictTh ?? ""),
    district: String(data?.districtTh ?? ""),
    province: String(data?.provinceTh ?? ""),
    postalCode: String(data?.postalCodeTh ?? ""),
    addressTh: String(data?.addressTh ?? ""),

    nameEn: String(data?.nameEn ?? ""),
    subdistrictEn: String(data?.subdistrictEn ?? ""),
    districtEn: String(data?.districtEn ?? ""),
    provinceEn: String(data?.provinceEn ?? ""),
    postalCodeEn: String(data?.postalCodeEn ?? ""),
    addressEn: String(data?.addressEn ?? ""),

    phoneNumber: String(data?.phoneNumber ?? ""),
    taxId: String(data?.taxId ?? ""),
    dueDay: billing?.dueDay != null ? String(billing.dueDay) : "",
    finePerDay:
      billing?.finePerDay != null ? String(Number(billing.finePerDay)) : "",
    acceptFine: Boolean(billing?.acceptFine ?? false),
  };
}

function CardShell({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden">
      <div className="flex items-center justify-between px-8 py-5 bg-[#f3f7ff] border-b border-blue-100/60">
        <div className="flex items-center gap-3">
          <div className="h-9 w-1.5 rounded-full bg-[#5b86ff]" />
          <div>
            <div className="text-xl font-extrabold text-gray-900">{title}</div>
            {hint && (
              <div className="mt-1 text-sm font-bold text-gray-600">{hint}</div>
            )}
          </div>
        </div>
      </div>
      <div className="px-8 py-7">{children}</div>
    </div>
  );
}

export default function Step_0() {
  const nav = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const state = (location.state ?? null) as LocationState;

  const isSettingsPath = location.pathname.startsWith("/owner/settings");
  const mode =
    searchParams.get("mode") === "edit" || isSettingsPath ? "edit" : "create";

  const condoId = searchParams.get("condoId") ?? state?.condoId ?? "";

  const [formData, setFormData] = useState<Step0FormData>(() => {
    try {
      if (mode === "edit") return emptyForm;

      const raw = sessionStorage.getItem(STEP0_DRAFT_KEY);
      if (!raw) return emptyForm;

      const parsed = JSON.parse(raw);
      return {
        nameTh: String(parsed?.nameTh ?? ""),
        subdistrict: String(parsed?.subdistrict ?? ""),
        district: String(parsed?.district ?? ""),
        province: String(parsed?.province ?? ""),
        postalCode: String(parsed?.postalCode ?? ""),
        addressTh: String(parsed?.addressTh ?? ""),
        nameEn: String(parsed?.nameEn ?? ""),
        subdistrictEn: String(parsed?.subdistrictEn ?? ""),
        districtEn: String(parsed?.districtEn ?? ""),
        provinceEn: String(parsed?.provinceEn ?? ""),
        postalCodeEn: String(parsed?.postalCodeEn ?? ""),
        addressEn: String(parsed?.addressEn ?? ""),
        phoneNumber: String(parsed?.phoneNumber ?? ""),
        taxId: String(parsed?.taxId ?? ""),
        dueDay: String(parsed?.dueDay ?? ""),
        finePerDay: String(parsed?.finePerDay ?? ""),
        acceptFine: Boolean(parsed?.acceptFine ?? false),
      };
    } catch {
      return emptyForm;
    }
  });

  const [loadingInitial, setLoadingInitial] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "create") return;
    sessionStorage.setItem(STEP0_DRAFT_KEY, JSON.stringify(formData));
  }, [formData, mode]);

  useEffect(() => {
    if (mode !== "edit" || !condoId) {
      setLoadingInitial(false);
      return;
    }

    let cancelled = false;

    const loadCondo = async () => {
      try {
        setLoadingInitial(true);
        setSubmitError(null);

        const data = await fetchCondoById(condoId);
        if (cancelled) return;

        setFormData(mapCondoToForm(data));
      } catch (e: any) {
        if (cancelled) return;
        setSubmitError(e?.message ?? "โหลดข้อมูลคอนโดไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoadingInitial(false);
      }
    };

    loadCondo();

    return () => {
      cancelled = true;
    };
  }, [mode, condoId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (!name) return;

    setSuccessMsg(null);

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        ...(name === "acceptFine" && !checked ? { finePerDay: "" } : {}),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const canSubmit = useMemo(() => {
    const hasBasic =
      formData.nameTh.trim() &&
      formData.addressTh.trim() &&
      formData.phoneNumber.trim();

    if (!hasBasic) return false;

    const dueDay = toDueDay(formData.dueDay);
    if (!dueDay) return false;

    if (formData.acceptFine) {
      const fine = normalizeMoney(formData.finePerDay);
      if (fine == null) return false;
    }

    return true;
  }, [formData]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setSuccessMsg(null);

    try {
      if (mode === "edit") {
        if (!condoId) {
          throw new Error("ไม่พบ condoId สำหรับการแก้ไข");
        }

        await updateCondo(condoId, formData);
        setSuccessMsg("บันทึกข้อมูลคอนโดเรียบร้อยแล้ว");
        return;
      }

      const { condoId: createdCondoId } = await createCondo(formData);

      nav("/owner/add-condo/step-1", {
        state: {
          condoId: createdCondoId,
          condoName: formData.nameTh.trim(),
        },
      });
    } catch (e: any) {
      setSubmitError(e?.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="w-full max-w-[1120px] mx-auto flex flex-col gap-[18px] pb-[110px]">
        <div className="rounded-2xl border border-blue-100/60 bg-white px-8 py-10 text-center text-lg font-extrabold text-gray-700 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
          กำลังโหลดข้อมูลคอนโด...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1120px] mx-auto flex flex-col gap-[18px] pb-[110px]">
      <h1 className="text-center text-[34px] font-extrabold text-black/85 tracking-[0.2px] mb-[6px] mt-[6px]">
        {mode === "edit" ? "แก้ไขข้อมูลคอนโดมิเนียม" : "ตั้งค่าคอนโดมิเนียม"}
      </h1>

      <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden">
        <div className="flex items-center gap-3 px-8 py-5 bg-[#f3f7ff] border-b border-blue-100/60">
          <div className="h-9 w-1.5 rounded-full bg-[#5b86ff]" />
          <div>
            <div className="text-xl font-extrabold text-gray-900 tracking-tight">
              ข้อมูลพื้นฐาน
            </div>
            <div className="mt-1 text-sm font-bold text-gray-600">
              กรอกชื่อ/ที่อยู่คอนโด (TH/EN), ข้อมูลติดต่อ และกำหนดการชำระเงิน
            </div>
          </div>
        </div>
        <div className="px-8 py-7">
          <ul className="list-disc pl-6 text-base text-gray-700 space-y-2 font-bold">
            <li>กรอกชื่อ/ที่อยู่คอนโด (TH/EN)</li>
            <li>ข้อมูลติดต่อ + เลขผู้เสียภาษี</li>
            <li>ตั้งวันครบกำหนดชำระและค่าปรับ (ถ้ามี)</li>
          </ul>
        </div>
      </div>

      <CardShell title="ข้อมูลคอนโด" hint="ชื่อ, ที่อยู่, โลโก้ และข้อมูลติดต่อ">
        <CondoInfoSection
          formData={
            formData as React.ComponentProps<typeof CondoInfoSection>["formData"]
          }
          handleChange={handleChange}
        />
      </CardShell>

      <CardShell title="รายละเอียดอื่น ๆ" hint="ข้อมูลเพิ่มเติมสำหรับเอกสาร/การติดต่อ">
        <OtherDetailsSection formData={formData} handleChange={handleChange} />
      </CardShell>

      <CardShell title="การชำระเงิน" hint="กำหนดวันครบกำหนดและค่าปรับ (ถ้ามี)">
        <PaymentSection formData={formData} handleChange={handleChange} />
      </CardShell>

      {submitError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700 font-extrabold">
          {submitError}
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700 font-extrabold">
          {successMsg}
        </div>
      )}

      <div className="flex items-center justify-end gap-[14px] flex-wrap pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className={[
            "h-[46px] min-w-[110px] rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition",
            "!bg-[#6FAFF9] hover:!bg-[#7fb4fb] active:scale-[0.98] cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-blue-300",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100",
          ].join(" ")}
        >
          {submitting
            ? mode === "edit"
              ? "กำลังบันทึก..."
              : "กำลังสร้าง..."
            : mode === "edit"
              ? "บันทึก"
              : "สร้าง"}
        </button>
      </div>
    </div>
  );
}