import { api } from "@/shared/api/http";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useBankAccountForm } from "../components/BankAccountForm";
import BankAccountList from "../components/BankAccountList";
import { BANK_OPTIONS } from "@/constants/bankOptions";

const STEP_CONDO_ID_KEY = "add_condo_condoId";

type BankAccountDbRow = {
  id: string;
  condoId: string;
  bankCode: string;
  accountName: string;
  accountNo: string;
  createdAt?: string;
  updatedAt?: string;
};

type PaymentInstructionDto = {
  condoId: string;
  message: string;
  updatedAt?: string;
};

type UiAccount = {
  id: string;
  bankCode: string;
  bankLabel: string;
  accountNo: string;
  accountName: string;
};

export default function Step_3() {
  const nav = useNavigate();
  const location = useLocation();
  const form = useBankAccountForm();


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

 
  const bankLabelByCode = useMemo(() => {
    const m = new Map<string, string>();
    BANK_OPTIONS.forEach((b) => m.set(b.code, b.label));
    return m;
  }, [BANK_OPTIONS]);

  const isFormValid =
    form.bank.trim() !== "" &&
    form.accountName.trim() !== "" &&
    form.accountNo.trim() !== "";

  const [showSaved, setShowSaved] = useState(false);
  const [accounts, setAccounts] = useState<UiAccount[]>([]);
  const [paymentMessage, setPaymentMessage] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const headerHint = useMemo(() => {
    return "บัญชีธนาคารที่ใช้รับเงิน (แสดงบนใบแจ้งหนี้) — แนะนำไม่เกิน 2 บัญชี";
  }, []);


  const resetCondoFlow = () => {
    localStorage.removeItem(STEP_CONDO_ID_KEY);
    nav("/owner/add-condo/step-0");
  };


  useEffect(() => {
    if (!condoId) return;

    let alive = true;

    (async () => {
      setLoading(true);
      setApiError(null);
      try {
        const [bankList, instruction] = await Promise.all([
          api<BankAccountDbRow[]>(`/owner/condos/${condoId}/bank-accounts`, {
            method: "GET",
          }),
          api<PaymentInstructionDto>(`/owner/condos/${condoId}/payment-instruction`, {
            method: "GET",
          }),
        ]);

        if (!alive) return;

        setAccounts(
          (bankList ?? []).map((row) => ({
            id: row.id,
            bankCode: row.bankCode,
            bankLabel: bankLabelByCode.get(row.bankCode) ?? row.bankCode,
            accountNo: row.accountNo,
            accountName: row.accountName,
          }))
        );

        setPaymentMessage(String(instruction?.message ?? ""));
      } catch (e: any) {
        if (!alive) return;

        const msg = String(e?.message ?? "");
        if (msg.includes("Forbidden")) {
          setApiError("คอนโดนี้ไม่ใช่ของคุณ หรือ condoId ค้างหลัง reset ฐานข้อมูล — กำลังพากลับไปเริ่มใหม่");
          window.setTimeout(() => resetCondoFlow(), 1200);
          return;
        }

        setApiError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [condoId, bankLabelByCode]);

  const handleAddAccount = async () => {
    if (!isFormValid || !condoId) return;

    setSaving(true);
    setApiError(null);
    try {
      const bankCode = form.bank.trim().toUpperCase(); 

      const created = await api<BankAccountDbRow>(`/owner/condos/${condoId}/bank-accounts`, {
        method: "POST",
        body: JSON.stringify({
          bankCode, 
          accountName: form.accountName.trim(),
          accountNo: form.accountNo.trim(),
        }),
      });

      setAccounts((prev) => [
        ...prev,
        {
          id: created.id,
          bankCode: created.bankCode,
          bankLabel: bankLabelByCode.get(created.bankCode) ?? created.bankCode,
          accountNo: created.accountNo,
          accountName: created.accountName,
        },
      ]);

      form.reset();
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      if (msg.includes("Max 2 bank accounts")) {
        setApiError("เพิ่มได้สูงสุด 2 บัญชี");
      } else if (msg.includes("Forbidden")) {
        setApiError("คอนโดนี้ไม่ใช่ของคุณ หรือ condoId ค้าง — กำลังพากลับไปเริ่มใหม่");
        window.setTimeout(() => resetCondoFlow(), 1200);
      } else {
        setApiError(e?.message ?? "เพิ่มบัญชีไม่สำเร็จ");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!condoId) return;

    setSaving(true);
    setApiError(null);
    try {
      await api(`/owner/condos/${condoId}/bank-accounts/${id}`, {
        method: "DELETE",
      });
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      if (msg.includes("Forbidden")) {
        setApiError("คอนโดนี้ไม่ใช่ของคุณ หรือ condoId ค้าง — กำลังพากลับไปเริ่มใหม่");
        window.setTimeout(() => resetCondoFlow(), 1200);
      } else {
        setApiError(e?.message ?? "ลบบัญชีไม่สำเร็จ");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMessage = async () => {
    if (!condoId) return;

    setSaving(true);
    setApiError(null);
    try {
      await api(`/owner/condos/${condoId}/payment-instruction`, {
        method: "PUT",
        body: JSON.stringify({ message: paymentMessage }),
      });

      setShowSaved(true);
      window.setTimeout(() => setShowSaved(false), 2500);
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      if (msg.includes("Forbidden")) {
        setApiError("คอนโดนี้ไม่ใช่ของคุณ หรือ condoId ค้าง — กำลังพากลับไปเริ่มใหม่");
        window.setTimeout(() => resetCondoFlow(), 1200);
      } else {
        setApiError(e?.message ?? "บันทึกไม่สำเร็จ");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[1120px] mx-auto flex flex-col gap-[18px] pb-[110px]">
      {showSaved && (
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 text-sm font-extrabold shadow-sm">
            ✓ บันทึกข้อมูลสำเร็จ
          </div>
        </div>
      )}

      <h1 className="text-center text-[34px] font-extrabold text-black/85 tracking-[0.2px] mb-[6px] mt-[6px]">
        ตั้งค่าคอนโดมิเนียม
      </h1>

      {apiError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700 font-extrabold flex items-center justify-between gap-4">
          <span>{apiError}</span>
       
          <button
            type="button"
            onClick={resetCondoFlow}
            className="shrink-0 rounded-xl bg-white border border-rose-200 px-4 py-2 text-sm font-black text-rose-700 hover:bg-rose-50"
          >
            เริ่มใหม่
          </button>
        </div>
      )}

   
      <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden">
        <div className="flex items-center gap-3 px-8 py-5 bg-[#f3f7ff] border-b border-blue-100/60">
          <div className="h-9 w-1.5 rounded-full bg-[#5b86ff]" />
          <div>
            <div className="text-xl font-extrabold text-gray-900 tracking-tight">บัญชีธนาคาร</div>
            <div className="mt-1 text-sm font-bold text-gray-600">{headerHint}</div>
          </div>
        </div>

        <div className="px-8 py-7 space-y-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="min-w-[220px] flex-1">
              <label className="block text-sm font-extrabold text-gray-800 mb-2">
                ธนาคาร <span className="text-rose-600">*</span>
              </label>
              <select
                className="w-full h-12 rounded-xl border border-gray-200 bg-[#fffdf2] px-4 text-sm font-bold text-gray-900 shadow-sm
                           focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300"
                value={form.bank}
                onChange={(e) => form.setBank(e.target.value)}
              >
                <option value="">เลือกธนาคาร</option>
                {BANK_OPTIONS.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[220px] flex-1">
              <label className="block text-sm font-extrabold text-gray-800 mb-2">
                ชื่อบัญชี <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                className="w-full h-12 rounded-xl border border-gray-200 bg-[#fffdf2] px-4 text-sm font-bold text-gray-900 shadow-sm
                           focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300"
                value={form.accountName}
                onChange={(e) => form.setAccountName(e.target.value)}
                placeholder="เช่น บริษัท เรนท์สเฟียร์ จำกัด"
              />
            </div>

            <div className="min-w-[220px] flex-1">
              <label className="block text-sm font-extrabold text-gray-800 mb-2">
                เลขที่บัญชี <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                className="w-full h-12 rounded-xl border border-gray-200 bg-[#fffdf2] px-4 text-sm font-bold text-gray-900 shadow-sm
                           focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300"
                value={form.accountNo}
                onChange={(e) => form.setAccountNo(e.target.value)}
                placeholder="เช่น 123-4-56789-0"
              />
            </div>

            <button
              type="button"
              disabled={!isFormValid || saving}
              onClick={handleAddAccount}
              className={[
                "h-12 px-7 rounded-xl font-black text-sm transition shadow-[0_12px_22px_rgba(0,0,0,0.14)]",
                "focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-[0.98]",
                isFormValid && !saving
                  ? "bg-[#93C5FD] hover:bg-[#7fb4fb] text-white"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none",
              ].join(" ")}
            >
              {saving ? "กำลังบันทึก..." : "เพิ่ม"}
            </button>
          </div>

          <div className="grid grid-cols-3 items-center rounded-full bg-[#f3f7ff] border border-blue-100/60 px-6 py-3 text-sm font-extrabold text-gray-700">
            <span>ธนาคาร</span>
            <span>ชื่อบัญชี</span>
            <span className="justify-self-end">เลขบัญชี</span>
          </div>

          <BankAccountList accounts={accounts} onDelete={handleDeleteAccount} />
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden">
        <div className="flex items-center gap-3 px-8 py-5 bg-[#f3f7ff] border-b border-blue-100/60">
          <div className="h-9 w-1.5 rounded-full bg-[#5b86ff]" />
          <div>
            <div className="text-xl font-extrabold text-gray-900 tracking-tight">
              ขั้นตอนการแจ้งชำระเงิน
            </div>
            <div className="mt-1 text-sm font-bold text-gray-600">
              รายละเอียดการชำระเงินจะแสดงในใบแจ้งหนี้
            </div>
          </div>
        </div>

        <div className="px-8 py-7">
          <ul className="list-disc pl-6 text-sm font-bold text-gray-600 space-y-2">
            <li>ผู้เช่าสามารถชำระเงินตามบัญชีธนาคารที่ระบุ</li>
            <li>หลังชำระเงินแล้ว ให้แนบหลักฐาน/สลิปเพื่อยืนยัน</li>
          </ul>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden">
        <div className="flex items-center gap-3 px-8 py-5 bg-[#f3f7ff] border-b border-blue-100/60">
          <div className="h-9 w-1.5 rounded-full bg-[#5b86ff]" />
          <div>
            <div className="text-xl font-extrabold text-gray-900 tracking-tight">
              ข้อความแจ้งผู้เช่า
            </div>
            <div className="mt-1 text-sm font-bold text-gray-600">
              ข้อความนี้จะแสดงบนใบแจ้งหนี้/หน้าชำระเงิน
            </div>
          </div>
        </div>

        <div className="px-8 py-7 space-y-3">
          <label className="block text-sm font-extrabold text-gray-800">
            ข้อความแจ้งผู้เช่า <span className="text-rose-600">*</span>
          </label>

          <textarea
            rows={4}
            className="w-full rounded-2xl border border-gray-200 bg-[#fffdf2] px-5 py-4 text-sm font-bold text-gray-900 shadow-sm
                       focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300"
            placeholder="พิมพ์ข้อความที่ต้องการแจ้งผู้เช่า..."
            value={paymentMessage}
            onChange={(e) => setPaymentMessage(e.target.value)}
          />

          <p className="text-xs font-bold text-gray-600">
            ตัวอย่าง: เมื่อชำระเงินแล้ว กรุณาส่งหลักฐานการชำระเงินมาที่ Line:
            @rentsphere หรือโทรแจ้ง 0922222222
          </p>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveMessage}
              disabled={saving}
              className="h-12 px-7 rounded-xl font-black text-sm transition shadow-[0_12px_22px_rgba(0,0,0,0.14)]
                         bg-[#93C5FD] hover:bg-[#7fb4fb] text-white active:scale-[0.98]
                         focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60"
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-[14px] flex-wrap pt-4">
        <button
          type="button"
          onClick={() => nav("../step-2", { state: { condoId } })}
          className="h-[46px] px-6 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
                         focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          ย้อนกลับ
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => nav("../step-4", { state: { condoId } })}
          className="h-[46px] w-24 rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition
                         !bg-[#93C5FD] hover:!bg-[#7fb4fb] active:scale-[0.98] cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60"
        >
          ต่อไป
        </button>
      </div>
    </div>
  );
}