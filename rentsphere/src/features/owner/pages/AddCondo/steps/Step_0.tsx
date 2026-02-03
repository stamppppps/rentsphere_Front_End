
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import CondoInfoSection from '../components/CondoInfoSection';
import OtherDetailsSection from '../components/OtherDetailsSection';
import PaymentSection from '../components/PaymentSection';

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

const Step_0: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
        <div className="space-y-8">
          <CondoInfoSection
            formData={formData}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
          />
          <OtherDetailsSection formData={formData} handleChange={handleChange} />
          <PaymentSection formData={formData} handleChange={handleChange} />
        </div>
      </main>
    </div>
  );
};

export default Step_0;
