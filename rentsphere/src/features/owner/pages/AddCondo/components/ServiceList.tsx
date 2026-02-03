
import React from 'react';
import type { Service } from '../steps/Step_1';

interface ServiceListProps {
  services: Service[];
}

const ServiceList: React.FC<ServiceListProps> = ({ services }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-gray-100 rounded-lg font-bold text-gray-600">
        <div>รายการ</div>
        <div>คำนวณตาม</div>
        <div className="text-right">ราคา</div>
      </div>
      {services.length === 0 ? (
        <p className="text-center text-gray-500 py-4">ยังไม่มีรายการค่าบริการ</p>
      ) : (
        <ul className="space-y-2">
          {services.map((service) => (
            <li key={service.id} className="grid grid-cols-3 gap-4 items-center px-4 py-3 bg-white rounded-lg border border-gray-200">
              <div>{service.name}</div>
              <div>{service.isVariable ? 'ตามมิเตอร์' : 'คงที่'}</div>
              <div className="text-right font-medium">{service.price.toLocaleString()} บาท</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ServiceList;
