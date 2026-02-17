import React from 'react';
import SectionCard from './SectionCard';
import Input from './Input';
import FileUpload from './FileUpload';

interface CondoInfoSectionProps {
  formData: {
    nameTh: string;
    addressTh: string;
    nameEn: string;
    addressEn: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChange: (file: File | null) => void;
}

const CondoInfoSection: React.FC<CondoInfoSectionProps> = ({ formData, handleChange, handleFileChange }) => {
  return (
    <>
      <SectionCard title="คอนโดมิเนียม" description="โลโก้เพื่อนำไปแสดงในใบแจ้งหนี้และใบเสร็จ">
        <FileUpload onFileSelect={handleFileChange} />
      </SectionCard>

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
    </>
  );
};

export default CondoInfoSection;
