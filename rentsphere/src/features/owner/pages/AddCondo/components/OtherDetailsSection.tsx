import React from 'react';
import SectionCard from './SectionCard';
import Input from './Input';

interface OtherDetailsSectionProps {
  formData: {
    phoneNumber: string;
    taxId: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const OtherDetailsSection: React.FC<OtherDetailsSectionProps> = ({ formData, handleChange }) => {
  return (
    <SectionCard title="รายละเอียดอื่นๆ" description="เบอร์โทรศัพท์ และ เลขประจำตัวผู้เสียภาษี">
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
  );
};

export default OtherDetailsSection;
