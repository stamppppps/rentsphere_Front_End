import React, { useState } from 'react';
import type { RepairRequest } from '../types/maintenance.types';
import { ISSUE_TYPES } from '../types/maintenance.types';
import ImageUploader from './ImageUploader';

interface RepairFormProps {
  onSubmit: (data: Partial<RepairRequest>) => void;
  initialData?: Partial<RepairRequest>;
}

const RepairForm: React.FC<RepairFormProps> = ({ onSubmit, initialData }) => {
  const [images, setImages] = useState<string[]>(initialData?.images || []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    onSubmit({
      issueType: String(formData.get('issueType') || ''),
      roomNumber: String(formData.get('roomNumber') || ''),
      location: String(formData.get('location') || ''),
      details: String(formData.get('details') || ''),
      images,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-800">รายละเอียดการแจ้งซ่อม</h2>
          <p className="text-xs text-gray-400 font-medium">โหมดฟอร์มรอเชื่อมต่อ backend จริง</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">ประเภทปัญหา</label>
          <select
            name="issueType"
            defaultValue={initialData?.issueType || ''}
            required
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3.5 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="" disabled>
              -- เลือกประเภทปัญหา --
            </option>
            {ISSUE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">เลขห้อง</label>
            <input
              name="roomNumber"
              type="text"
              defaultValue={initialData?.roomNumber || ''}
              required
              placeholder="เช่น A888"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">จุดที่เกิดปัญหา</label>
            <input
              name="location"
              type="text"
              defaultValue={initialData?.location || ''}
              required
              placeholder="เช่น ระเบียง / ห้องน้ำ"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">รายละเอียดอาการ</label>
          <textarea
            name="details"
            defaultValue={initialData?.details || ''}
            required
            rows={4}
            placeholder="อธิบายอาการโดยสรุป"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
          />
        </div>

        <ImageUploader images={images} onChange={setImages} />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
        >
          ส่งคำขอแจ้งซ่อม
        </button>
      </div>
    </form>
  );
};

export default RepairForm;
