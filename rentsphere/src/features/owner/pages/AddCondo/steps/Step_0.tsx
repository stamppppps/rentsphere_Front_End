import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CondoInfoSection from "../components/CondoInfoSection";
import OtherDetailsSection from "../components/OtherDetailsSection";
import PaymentSection from "../components/PaymentSection";

interface FormData {
  logoFile: File | null;
  nameTh: string;
  addressTh: string;
  nameEn: string;
  addressEn: string;
  phoneNumber: string;
  taxId: string;
  paymentDueDate: string;
  fineAmount: string;
  acceptFine: boolean;
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
            {hint && <div className="mt-1 text-sm font-bold text-gray-600">{hint}</div>}
          </div>
        </div>
      </div>

      <div className="px-8 py-7">{children}</div>
    </div>
  );
}

export default function Step_0() {
  const nav = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    logoFile: null,
    nameTh: "",
    addressTh: "",
    nameEn: "",
    addressEn: "",
    phoneNumber: "",
    taxId: "",
    paymentDueDate: "",
    fineAmount: "",
    acceptFine: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value, type } = e.target;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [id]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, logoFile: file }));
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
          formData={formData}
          handleChange={handleChange}
          handleFileChange={handleFileChange}
        />
      </CardShell>

      <CardShell title="รายละเอียดอื่น ๆ" hint="ข้อมูลเพิ่มเติมสำหรับเอกสาร/การติดต่อ">
        <OtherDetailsSection formData={formData} handleChange={handleChange} />
      </CardShell>

      <CardShell title="การชำระเงิน" hint="กำหนดวันครบกำหนดและค่าปรับ (ถ้ามี)">
        <PaymentSection formData={formData} handleChange={handleChange} />
      </CardShell>

      <div className="flex items-center justify-end gap-[14px] flex-wrap pt-4">
        <button
          type="button"
          onClick={() => nav("/owner/add-condo/step-1")}
          className="h-[46px] w-24 rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition
                         !bg-[#93C5FD] hover:!bg-[#7fb4fb] active:scale-[0.98] cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          สร้าง
        </button>
      </div>
    </div>
  );
}