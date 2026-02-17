import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import SectionCard from '../../owner/pages/AddCondo/components/SectionCard';
import Input from '../../owner/pages/AddCondo/components/Input';
import FileUpload from '../../owner/pages/AddCondo/components/FileUpload';
import Select from '../../owner/pages/AddCondo/components/Select';
import Checkbox from '../../owner/pages/AddCondo/components/Checkbox';
import Button from '../../owner/pages/AddCondo/components/Button';

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

export default function Add_Admin() {
  const [formData, setFormData] = useState<FormData>({
    logoFile: null,
    nameTh: '',
    addressTh: '',
    nameEn: '',
    addressEn: '',
    phoneNumber: '',
    taxId: '',
    paymentDueDate: '',
    fineAmount: '',
    acceptFine: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [id]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, logoFile: file }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // TODO: Add API call to create condo
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'linear-gradient(180deg, #e9d5ff 0%, #ddd6fe 50%, #c4b5fd 100%)' }}>
      <Navbar />

      {/* Purple sub-header */}
      <div className="w-full py-3 px-8" style={{ background: 'linear-gradient(90deg, #a855f7 0%, #c084fc 50%, #e9d5ff 100%)' }}>
        <h1 className="text-lg font-bold text-white">คอนโดมิเนียม</h1>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Section 1: Logo Upload */}
          <SectionCard title="โลโก้คอนโดมิเนียม" description="โลโก้เพื่อนำไปแสดงในใบแจ้งหนี้และใบเสร็จ">
            <FileUpload onFileSelect={handleFileChange} />
          </SectionCard>

          {/* Section 2: Condo Details */}
          <SectionCard title="รายละเอียดคอนโดมิเนียม" description="ชื่อและที่อยู่ เพื่อนำไปแสดงในรายการใบแจ้งหนี้และใบเสร็จ">
            <div className="space-y-6">
              <Input
                id="nameTh"
                label="ชื่อ (ภาษาไทย)"
                value={formData.nameTh}
                onChange={handleChange}
                required
              />
              <Input
                id="addressTh"
                label="ที่อยู่ (ภาษาไทย)"
                value={formData.addressTh}
                onChange={handleChange}
                required
              />
              <Input
                id="nameEn"
                label="ชื่อ (อังกฤษ)"
                value={formData.nameEn}
                onChange={handleChange}
              />
              <Input
                id="addressEn"
                label="ที่อยู่ (อังกฤษ)"
                value={formData.addressEn}
                onChange={handleChange}
              />
            </div>
          </SectionCard>

          {/* Section 3: Other Details */}
          <SectionCard title="รายละเอียดอื่นๆ" description="เบอร์โทรศัพท์และ เลขประจำตัวผู้เสียภาษี">
            <div className="space-y-6">
              <Input
                id="phoneNumber"
                label="เบอร์โทรศัพท์"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
              <Input
                id="taxId"
                label="เลขประจำตัวผู้เสียภาษี"
                value={formData.taxId}
                onChange={handleChange}
              />
            </div>
          </SectionCard>

          {/* Section 4: Payment & Fine Settings */}
          <SectionCard title="กำหนดชำระค่าห้องและค่าปรับ" description="วันที่ที่ต้องการให้ระบบเริ่มคิดค่าปรับอัตโนมัติกรณีเลยวันที่กำหนดชำระเงิน">
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
                    วันที่ {i + 1}
                  </option>
                ))}
              </Select>

              <Input
                id="fineAmount"
                label="ค่าปรับชำระล่าช้าต่อวัน"
                value={formData.fineAmount}
                onChange={handleChange}
                required
                type="number"
                suffix="บาท / วัน"
              />

              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  กรณีมีการชำระล่าช้ากว่าวันที่ระบุ ต้องการให้ระบบเพิ่มค่าปรับให้อัตโนมัติหรือไม่
                </p>
                <Checkbox
                  id="acceptFine"
                  label="ต้องการ"
                  checked={formData.acceptFine}
                  onChange={handleChange}
                />
              </div>
            </div>
          </SectionCard>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSubmit}>
              สร้าง
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}