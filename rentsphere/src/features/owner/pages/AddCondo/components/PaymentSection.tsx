import React from "react";
import SectionCard from "./SectionCard";
import Input from "./Input";
import Select from "./Select";
import Checkbox from "./Checkbox";

export type PaymentFormData = {
  dueDay: string;       
  finePerDay: string;   
  acceptFine: boolean;
};

interface PaymentSectionProps {
  formData: PaymentFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ formData, handleChange }) => {
  const fineDisabled = !formData.acceptFine;

  return (
    <SectionCard
      title="กำหนดชำระและค่าปรับ"
      description="กำหนดวันครบกำหนดชำระเงิน และตั้งค่าปรับอัตโนมัติ (ถ้ามี)"
    >
      <div className="space-y-6">
        <Select
          id="dueDay"
          label="วันครบกำหนดชำระ (ทุกเดือน)"
          value={formData.dueDay}
          onChange={handleChange}
          required
        >
          <option value="">เลือกวัน</option>
          {[...Array(28)].map((_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              วันที่ {i + 1} ของเดือน
            </option>
          ))}
        </Select>

        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">
            กรณีมีการชำระล่าช้า ต้องการให้ระบบเพิ่มค่าปรับอัตโนมัติหรือไม่
          </p>
          <Checkbox
            id="acceptFine"
            label="ต้องการ"
            checked={formData.acceptFine}
            onChange={handleChange}
          />
        </div>

        <Input
          id="finePerDay"
          label="ค่าปรับสำหรับชำระล่าช้า"
          value={formData.finePerDay}
          onChange={handleChange}
          required={!fineDisabled}
          type="number"
          suffix="บาท / วัน"
          disabled={fineDisabled}
          placeholder={fineDisabled ? "ปิดอยู่ (เปิดโดยติ๊ก 'ต้องการ')" : "เช่น 200"}
        />
      </div>
    </SectionCard>
  );
};

export default PaymentSection;