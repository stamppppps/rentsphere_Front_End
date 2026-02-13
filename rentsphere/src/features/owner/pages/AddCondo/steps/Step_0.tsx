import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CondoInfoSection from '../components/CondoInfoSection';
import OtherDetailsSection from '../components/OtherDetailsSection';
import PaymentSection from '../components/PaymentSection';
import Button from '../components/Button';

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
  const navigate = useNavigate();
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
    navigate('/owner/add-condo/step-1');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Sub-header - light gray */}
      <div className="w-full py-3 px-8 bg-gray-200">
        <h1 className="text-lg font-bold text-gray-800">คอนโดมิเนียม</h1>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <CondoInfoSection
            formData={formData}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
          />
          <OtherDetailsSection formData={formData} handleChange={handleChange} />
          <PaymentSection formData={formData} handleChange={handleChange} />

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
};

export default Step_0;
