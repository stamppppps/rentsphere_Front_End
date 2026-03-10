import React from 'react';
import SectionCard from './SectionCard';
import Input from './Input';

interface CondoInfoSectionProps {
  formData: {
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
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CondoInfoSection: React.FC<CondoInfoSectionProps> = ({ formData, handleChange }) => {
  return (
    <>
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
            label="ที่อยู่"
            value={formData.addressTh}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="subdistrict"
              label="ตำบล"
              value={formData.subdistrict}
              onChange={handleChange}
              required
            />
            <Input
              id="district"
              label="อำเภอ"
              value={formData.district}
              onChange={handleChange}
              required
            />
            <Input
              id="province"
              label="จังหวัด"
              value={formData.province}
              onChange={handleChange}
              required
            />
            <Input
              id="postalCode"
              label="รหัสไปรษณีย์"
              value={formData.postalCode}
              onChange={handleChange}
              required
            />
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="subdistrictEn"
              label="ตำบล(อังกฤษ)"
              value={formData.subdistrictEn}
              onChange={handleChange}
            />
            <Input
              id="districtEn"
              label="อำเภอ(อังกฤษ)"
              value={formData.districtEn}
              onChange={handleChange}
            />
            <Input
              id="provinceEn"
              label="จังหวัด(อังกฤษ)"
              value={formData.provinceEn}
              onChange={handleChange}
            />
            <Input
              id="postalCodeEn"
              label="รหัสไปรษณีย์(อังกฤษ)"
              value={formData.postalCodeEn}
              onChange={handleChange}
            />
          </div>
        </div>
      </SectionCard>
    </>
  );
};

export default CondoInfoSection;