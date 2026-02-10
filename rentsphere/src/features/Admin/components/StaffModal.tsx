import React, { useState, useEffect, useCallback } from 'react';
import type { StaffMember, Role } from '../types/types';
import { Role as RoleConst } from '../types/types';


// Types
interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<StaffMember, 'id'>) => void;
  initialData?: StaffMember | null;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  role: Role;
  properties: string[];
}

interface RoleOption {
  value: Role;
  label: string;
}

// Constants
const ROLE_OPTIONS: RoleOption[] = [
  { value: RoleConst.OWNER, label: RoleConst.OWNER },
  { value: RoleConst.ADMIN, label: RoleConst.ADMIN },
];

const DEFAULT_FORM_DATA: FormData = {
  name: '',
  phone: '',
  email: '',
  role: RoleConst.OWNER,
  properties: ['สวัสดีคอนโด'],
};

const INPUT_STYLE = { background: '#c4b5fd' };
const MODAL_BACKGROUND = 'linear-gradient(180deg, rgba(233,213,255,0.9) 0%, rgba(196,181,253,0.9) 100%)';
const BUTTON_GRADIENT = 'linear-gradient(90deg, #f472b6 0%, #c084fc 100%)';

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        phone: initialData.phone,
        email: initialData.email,
        role: initialData.role,
        properties: initialData.properties,
      });
    } else {
      setFormData(DEFAULT_FORM_DATA);
    }
    setIsDropdownOpen(false);
  }, [initialData, isOpen]);

  const handleInputChange = useCallback((field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleRoleSelect = useCallback((role: Role): void => {
    setFormData((prev) => ({ ...prev, role }));
    setIsDropdownOpen(false);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  }, [formData, onSubmit, onClose]);

  const toggleDropdown = useCallback((): void => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  // Don't render if modal is closed
  if (!isOpen) return null;

  const modalTitle = initialData ? 'แก้ไขเจ้าหน้าที่' : 'เพิ่มเจ้าหน้าที่';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: MODAL_BACKGROUND }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5">
          <h2 id="modal-title" className="text-xl font-bold text-gray-800">
            {modalTitle}
          </h2>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-4 space-y-4">
          {/* Name Field */}
          <div className="space-y-1">
            <label htmlFor="staff-name" className="text-sm font-medium text-gray-700">
              ชื่อและนามสกุล
            </label>
            <input
              id="staff-name"
              required
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-purple-300"
              style={INPUT_STYLE}
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-1">
            <label htmlFor="staff-phone" className="text-sm font-medium text-gray-700">
              เบอร์โทรศัพท์มือถือ
            </label>
            <input
              id="staff-phone"
              required
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-purple-300"
              style={INPUT_STYLE}
              pattern="[0-9]{9,10}"
              title="กรุณากรอกเบอร์โทรศัพท์ 9-10 หลัก"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label htmlFor="staff-email" className="text-sm font-medium text-gray-700">
              อีเมล
            </label>
            <input
              id="staff-email"
              required
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-purple-300"
              style={INPUT_STYLE}
            />
          </div>

          {/* Role Dropdown */}
          <div className="space-y-1">
            <label htmlFor="staff-role" className="text-sm font-medium text-gray-700">
              ตำแหน่ง
            </label>
            <div className="relative">
              <button
                id="staff-role"
                type="button"
                onClick={toggleDropdown}
                className="w-full px-4 py-2.5 rounded-full text-left flex justify-between items-center transition-all focus:outline-none focus:ring-2 focus:ring-purple-300"
                style={INPUT_STYLE}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                <span className="text-gray-700">{formData.role || 'เลือกตำแหน่ง'}</span>
                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <ul
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10"
                  role="listbox"
                  aria-labelledby="staff-role"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <li key={option.value}>
                      <button
                        type="button"
                        onClick={() => handleRoleSelect(option.value)}
                        className="w-full px-4 py-2.5 text-left hover:bg-purple-50 transition flex items-center gap-2"
                        style={{ background: formData.role === option.value ? '#c4b5fd' : 'transparent' }}
                        role="option"
                        aria-selected={formData.role === option.value}
                      >
                        <span className="text-gray-700">{option.label}</span>
                        {formData.role === option.value && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-pink-400" aria-hidden="true" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2 rounded-full text-gray-600 border border-gray-300 hover:bg-gray-100 transition font-medium"
          >
            ปิด
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-8 py-2 rounded-full text-white font-medium transition-all hover:shadow-lg"
            style={{ background: BUTTON_GRADIENT }}
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
};