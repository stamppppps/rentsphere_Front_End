import React from 'react';
import SectionCard from './SectionCard';
import Input from './Input';
import Select from './Select';
import Checkbox from './Checkbox';

interface PaymentSectionProps {
  formData: {
    paymentDueDate: string;
    fineAmount: string;
    acceptFine: boolean;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ formData, handleChange }) => {
  return (
    <SectionCard title="กำหนดชำระและค่าปรับ" description="วันที่ที่ต้องการให้ระบบเริ่มคิดค่าปรับอัตโนมัติและวันที่กำหนดชำระเงิน">
      <div className="space-y-6">
        <Select
          id="paymentDueDate"
          label="วันสุดท้ายของการชำระเงิน"
          value={formData.paymentDueDate}
          onChange={handleChange}
          required
        >
          <option value="">เลือกวัน</option>
          {[...Array(31)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              วันที่ {i + 1} ของเดือน
            </option>
          ))}
        </Select>

        <Input
          id="fineAmount"
          label="ค่าปรับสำหรับชำระล่าช้า"
          value={formData.fineAmount}
          onChange={handleChange}
          required
          type="number"
          suffix="บาท / วัน"
        />
        
        <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">กรณีมีการชำระล่าช้า ต้องการให้ระบบเพิ่มค่าปรับให้อัตโนมัติหรือไม่</p>
            <Checkbox
              id="acceptFine"
              label="ต้องการ"
              checked={formData.acceptFine}
              onChange={handleChange}
            />
        </div>
      </div>
    </SectionCard>
  );
};

export default PaymentSection;
