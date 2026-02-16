import React from "react";
import type { Service } from "../types/addCondo.types";

type ServiceListProps = {
  services: Service[];
};

const ServiceList: React.FC<ServiceListProps> = ({ services }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 rounded-2xl font-extrabold text-gray-700 border border-blue-100/60">
        <div className="col-span-7">รายการ</div>
        <div className="col-span-3">คำนวณตาม</div>
        <div className="col-span-2 text-right">ราคา</div>
      </div>

      {services.length === 0 ? (
        <div className="text-center text-sm font-bold text-gray-500 py-10 bg-white rounded-2xl border border-blue-100/60">
          ยังไม่มีรายการค่าบริการ
        </div>
      ) : (
        <ul className="space-y-2">
          {services.map((service) => (
            <li
              key={service.id}
              className="grid grid-cols-12 gap-4 items-center px-6 py-4 bg-white rounded-2xl border border-blue-100/60 shadow-sm"
            >
              <div className="col-span-7 font-extrabold text-gray-900">{service.name}</div>
              <div className="col-span-3 font-bold text-gray-600">
                {service.isVariable ? "ตามมิเตอร์" : "คงที่"}
              </div>
              <div className="col-span-2 text-right font-extrabold text-gray-900">
                {Number(service.price).toLocaleString()} บาท
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ServiceList;
