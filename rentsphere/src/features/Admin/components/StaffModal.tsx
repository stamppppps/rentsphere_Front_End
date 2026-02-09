import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { StaffMember } from '../types/types';
import { Role } from '../types/types';


interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<StaffMember, 'id'>) => void;
  initialData?: StaffMember | null;
}

export const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: Role.STAFF as string,
    properties: [] as string[] // Simplified for this demo
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        phone: initialData.phone,
        email: initialData.email,
        role: initialData.role,
        properties: initialData.properties
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        role: Role.STAFF,
        properties: ['Sawaddee Condo'] // Default mock property
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? 'แก้ไขเจ้าหน้าที่' : 'เพิ่มเจ้าหน้าที่'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">ชื่อและนามสกุล</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Ex. Somchai Jai-dee"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">เบอร์โทรศัพท์มือถือ</label>
            <input
              required
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="081-234-5678"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">อีเมล</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="example@rentsphere.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">ตำแหน่ง</label>
            <div className="relative">
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value={Role.OWNER}>{Role.OWNER}</option>
                <option value={Role.ADMIN}>{Role.ADMIN}</option>
                <option value={Role.STAFF}>{Role.STAFF}</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Hidden Properties Field (Mock) */}
          <div className="hidden">
             <label className="text-sm font-medium text-gray-700">ตำแหน่ง</label>
             <input disabled value={formData.properties.join(', ')} />
          </div>

        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
            <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-200 transition font-medium"
            >
                ปิด
            </button>
            <button 
                onClick={handleSubmit}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all font-medium flex items-center gap-2"
            >
                <Save size={18} />
                บันทึก
            </button>
        </div>
      </div>
    </div>
  );
};