import React, { useState } from 'react';
import ServiceForm from '../components/ServiceForm';
import ServiceList from '../components/ServiceList';
import Button from '../components/Button';

export interface Service {
  id: number;
  name: string;
  isVariable: boolean;
  price: number;
}

const Step_1: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);

  const handleAddService = (serviceName: string, price: number, isVariable: boolean) => {
    const newService: Service = {
      id: Date.now(),
      name: serviceName,
      price: price,
      isVariable: isVariable,
    };
    setServices(prevServices => [...prevServices, newService]);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">ตั้งค่าคอนโดมิเนียม</h1>

      <div className="bg-white rounded-2xl border border-violet-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-violet-50 to-blue-50 p-5 border-b border-violet-200">
          <h3 className="font-bold text-lg text-violet-800">
            ค่าบริการเพิ่มเติมที่เรียกเก็บ เช่น ค่าอินเตอร์เน็ต,ค่าฟิตเนส
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <ServiceForm onAddService={handleAddService} />
          <hr className="border-gray-200" />
          <ServiceList services={services} />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button>
          ต่อไป
        </Button>
      </div>
    </div>
  );
};

export default Step_1;
