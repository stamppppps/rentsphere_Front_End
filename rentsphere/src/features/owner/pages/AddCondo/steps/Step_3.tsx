import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useBankAccountForm } from "../components/BankAccountForm";
import BankAccountList from "../components/BankAccountList";

export default function Step_3() {
  const nav = useNavigate();

  const form = useBankAccountForm();

  const isFormValid =
    form.bank.trim() !== "" &&
    form.accountNo.trim() !== "" &&
    form.price.trim() !== "";

  const [showSaved, setShowSaved] = useState(false);

  const [accounts, setAccounts] = useState(
    [] as {
      id: number;
      bank: string;
      accountNo: string;
      price: string;
    }[]
  );

  const handleAddAccount = () => {
    if (!isFormValid) return;

    setAccounts((prev) => [
      ...prev,
      {
        id: Date.now(),
        bank: form.bank,
        accountNo: form.accountNo,
        price: form.price,
      },
    ]);

    form.reset();
  };

  const handleDeleteAccount = (id: number) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const headerHint = useMemo(() => {
    return "บัญชีธนาคารที่ใช้รับเงิน (แสดงบนใบแจ้งหนี้) — แนะนำไม่เกิน 2 บัญชี";
  }, []);

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

      <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden">
        <div className="flex items-center gap-3 px-8 py-5 bg-[#f3f7ff] border-b border-blue-100/60">
          <div className="h-9 w-1.5 rounded-full bg-[#5b86ff]" />
          <div>
            <div className="text-xl font-extrabold text-gray-900 tracking-tight">
              บัญชีธนาคาร
            </div>
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
                <option>กรุงเทพ (Bangkok Bank)</option>
                <option>กสิกรไทย (Kasikorn)</option>
                <option>ไทยพาณิชย์ (SCB)</option>
              </select>
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
              />
            </div>

            <div className="min-w-[220px] flex-1">
              <label className="block text-sm font-extrabold text-gray-800 mb-2">
                ราคาต่อหน่วย <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                className="w-full h-12 rounded-xl border border-gray-200 bg-[#fffdf2] px-4 text-sm font-bold text-gray-900 shadow-sm
                           focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300"
                value={form.price}
                onChange={(e) => form.setPrice(e.target.value)}
              />
            </div>

            <button
              type="button"
              disabled={!isFormValid}
              onClick={handleAddAccount}
              className={[
                "h-12 px-7 rounded-xl font-black text-sm transition shadow-[0_12px_22px_rgba(0,0,0,0.14)]",
                "focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-[0.98]",
                isFormValid
                  ? "bg-[#93C5FD] hover:bg-[#7fb4fb] text-white"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none",
              ].join(" ")}
            >
              เพิ่ม
            </button>
          </div>

          <div className="grid grid-cols-2 items-center rounded-full bg-[#f3f7ff] border border-blue-100/60 px-6 py-3 text-sm font-extrabold text-gray-700">
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
          />

          <p className="text-xs font-bold text-gray-600">
            ตัวอย่าง: เมื่อชำระเงินแล้ว กรุณาส่งหลักฐานการชำระเงินมาที่ Line:
            @rentsphere หรือโทรแจ้ง 0922222222
          </p>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                setShowSaved(true);
                window.setTimeout(() => setShowSaved(false), 2500);
              }}
              className="h-12 px-7 rounded-xl font-black text-sm transition shadow-[0_12px_22px_rgba(0,0,0,0.14)]
                         bg-[#93C5FD] hover:bg-[#7fb4fb] text-white active:scale-[0.98]
                         focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>

      <div className="fixed left-0 right-0 bottom-0 z-40 w-full bg-[rgba(238,244,255,0.9)] backdrop-blur-[8px] border-t border-[rgba(147,197,253,0.45)] py-[18px]">
        <div className="w-full max-w-[1120px] mx-auto px-6">
          <div className="flex items-center justify-end gap-[14px] flex-wrap">
            <button
              type="button"
              onClick={() => nav("../step-2")}
              className="h-[46px] px-6 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
                         focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              ย้อนกลับ
            </button>

            <button
              type="button"
              onClick={() => nav("../step-4")}
              className="h-[46px] w-24 rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition
                         bg-[#93C5FD] hover:bg-[#7fb4fb] active:scale-[0.98] cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              ต่อไป
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}