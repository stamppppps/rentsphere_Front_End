import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { StaffModal } from '../components/StaffModal';
import type { StaffMember, Role } from '../types/types';

// Building and Users icons as SVG components
const BuildingIcon = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    <rect x="12" y="16" width="40" height="44" rx="4" fill="url(#buildingGrad)" opacity="0.9" />
    <rect x="20" y="24" width="8" height="6" rx="1" fill="white" opacity="0.8" />
    <rect x="36" y="24" width="8" height="6" rx="1" fill="white" opacity="0.8" />
    <rect x="20" y="36" width="8" height="6" rx="1" fill="white" opacity="0.8" />
    <rect x="36" y="36" width="8" height="6" rx="1" fill="white" opacity="0.8" />
    <rect x="28" y="48" width="8" height="12" rx="1" fill="white" opacity="0.9" />
  </svg>
);

const UsersIcon = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="usersGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="20" r="10" fill="url(#usersGrad)" opacity="0.9" />
    <path d="M8 52c0-10 8-16 16-16s16 6 16 16" fill="url(#usersGrad)" opacity="0.7" />
    <circle cx="44" cy="24" r="8" fill="url(#usersGrad)" opacity="0.8" />
    <path d="M36 52c4-8 8-12 16-12 6 0 10 4 10 12" fill="url(#usersGrad)" opacity="0.6" />
  </svg>
);

const MOCK_STAFF: StaffMember[] = [
  {
    id: 1,
    name: 'Mr. Kittidet Suksarn',
    role: 'เจ้าของ' as Role,
    phone: '081234567',
    email: 'Kittidet@gmail.com',
    properties: ['สวัสดีคอนโด', 'ABC คอนโด']
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'condo' | 'user'>('user');
  const [staffList, setStaffList] = useState<StaffMember[]>(MOCK_STAFF);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('คุณต้องการลบผู้ใช้งานรายนี้ใช่หรือไม่?')) {
      setStaffList(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (data: Omit<StaffMember, 'id'>) => {
    if (editingStaff) {
      setStaffList(prev => prev.map(item =>
        item.id === editingStaff.id
          ? { ...data, id: editingStaff.id }
          : item
      ));
    } else {
      const newId = Math.max(...staffList.map(s => s.id), 0) + 1;
      setStaffList(prev => [...prev, { ...data, id: newId }]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'linear-gradient(180deg, #e9d5ff 0%, #ddd6fe 50%, #c4b5fd 100%)' }}>
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-purple-900">คอนโดมิเนียม</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-8 mb-6">
          <button
            onClick={() => setActiveTab('condo')}
            className="flex flex-col items-center gap-2 group"
          >
            <BuildingIcon />
            <span className={`font-medium text-sm ${activeTab === 'condo' ? 'text-purple-800' : 'text-purple-600'}`}>
              จัดการคอนโดมิเนียม
            </span>
          </button>

          <button
            onClick={() => setActiveTab('user')}
            className="flex flex-col items-center gap-2 group"
          >
            <UsersIcon />
            <span className={`font-medium text-sm ${activeTab === 'user' ? 'text-purple-800' : 'text-purple-600'}`}>
              จัดการผู้ใช้งาน
            </span>
          </button>
        </div>

        {/* Add Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleOpenAdd}
            className="px-8 py-3 rounded-full font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
            style={{ background: 'linear-gradient(90deg, #f472b6 0%, #c084fc 100%)' }}
          >
            เพิ่มคอนโดมิเนียม
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'user' && (
          <div className="bg-white/80 rounded-2xl p-6 backdrop-blur-sm">
            {/* Add Button & Sort */}
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-1.5 rounded-full text-sm font-medium text-white"
                style={{ background: 'linear-gradient(90deg, #f472b6 0%, #c084fc 100%)' }}
              >
                เพิ่ม
              </button>
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-hidden" style={{ border: '3px solid #818cf8' }}>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white text-purple-800 text-sm">
                    <th className="py-3 px-4 font-semibold text-center w-12">#</th>
                    <th className="py-3 px-4 font-semibold">ชื่อ/ตำแหน่ง</th>
                    <th className="py-3 px-4 font-semibold">เบอร์/อีเมล</th>
                    <th className="py-3 px-4 font-semibold">อสังหาริมทรัพย์</th>
                    <th className="py-3 px-4 font-semibold text-center w-20"></th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-sm">
                  {staffList.map((staff, index) => (
                    <tr key={staff.id} className="border-t border-gray-100">
                      <td className="py-4 px-4 text-center">{index + 1}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">{staff.name}</span>
                          <span className="text-xs text-purple-600">{staff.role}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-gray-800">{staff.phone}</span>
                          <span className="text-gray-500 text-xs">{staff.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-0.5">
                          {staff.properties.map((prop, i) => (
                            <span key={i} className="text-gray-700 text-sm">{prop}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleOpenEdit(staff)}
                          className="text-purple-600 hover:text-purple-800 font-medium text-sm transition"
                        >
                          edit
                        </button>
                      </td>
                    </tr>
                  ))}

                  {staffList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <UsersIcon />
                          <span>ไม่พบข้อมูลเจ้าหน้าที่</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'condo' && (
          <div className="flex justify-end mb-4">
            <span className="text-purple-600 text-sm">จัดเรียงลำดับ</span>
          </div>
        )}

        {activeTab === 'condo' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Condo Card 1 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BuildingIcon />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-gray-500">สวัสดีคอนโด</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="border border-gray-200 rounded px-3 py-1">
                    <span className="text-gray-700">50 / 50</span>
                  </div>
                  <div className="border border-gray-200 rounded px-3 py-1">
                    <span className="text-gray-700">0</span>
                  </div>
                  <span className="text-pink-500 text-xs">ลืมรา</span>
                </div>
              </div>
            </div>

            {/* Condo Card 2 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BuildingIcon />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-gray-500">ABC</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="border border-gray-200 rounded px-3 py-1">
                    <span className="text-gray-700">50 / 50</span>
                  </div>
                  <div className="border border-gray-200 rounded px-3 py-1">
                    <span className="text-gray-700">0</span>
                  </div>
                  <span className="text-pink-500 text-xs">ลืมรา</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingStaff}
      />
    </div>
  );
}