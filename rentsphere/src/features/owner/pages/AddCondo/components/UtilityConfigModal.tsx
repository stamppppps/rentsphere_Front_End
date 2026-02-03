import React, { useState, useEffect } from 'react';
import Select from './Select';
import Input from './Input';
import Button from './Button';

type UtilityType = 'water' | 'electricity' | null;

interface UtilityConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: { billingType: string; rate: string }) => void;
  utilityType: UtilityType;
}

const WaterIconSmall = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 16.99 8.41 24 12 24C15.59 24 22 16.99 22 12C22 6.48 17.52 2 12 2ZM12 21.28C9.93 19.34 4 14.28 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 14.28 14.07 19.34 12 21.28Z" fill="#818CF8"/>
    </svg>
);


const UtilityConfigModal: React.FC<UtilityConfigModalProps> = ({ isOpen, onClose, onSave, utilityType }) => {
  const [billingType, setBillingType] = useState('');
  const [rate, setRate] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBillingType('');
      setRate('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if(!billingType || !rate) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }
    onSave({ billingType, rate });
  };
  
  const title = utilityType === 'water' ? 'ค่าน้ำ' : 'ค่าไฟ';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <WaterIconSmall />
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          </div>
          
          <div className="space-y-4">
            <Select
              id="billingType"
              label="ประเภทการคิดเงิน"
              value={billingType}
              onChange={(e) => setBillingType(e.target.value)}
              required
            >
              <option value="" disabled>เลือกประเภท</option>
              <option value="meter_actual">ตามมิเตอร์ที่ใช้จริง</option>
              <option value="meter_minimum">ตามมิเตอร์แบบมีขั้นต่ำ</option>
              <option value="flat_rate">แบบเหมาจ่าย</option>
            </Select>
            <Input
              id="rate"
              label="บาท / ยูนิต"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              type="number"
              required
            />
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
          <Button onClick={onClose} className="bg-gray-200 text-gray-700 hover:bg-gray-300">
                ปิด
            </Button>
          <Button onClick={handleSave}>บันทึก</Button>
        </div>
      </div>
    </div>
  );
};

export default UtilityConfigModal;
