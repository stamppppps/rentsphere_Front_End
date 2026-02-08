import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { StaffModal } from '../components/StaffModal';
import types { StaffMember, Role } from '../types/types';
import { Building2, Users, Plus, Pencil, Trash2, Search } from 'lucide-react';

const MOCK_STAFF: StaffMember[] = [
  {
    id: 1,
    name: 'Mr. Kittidet Suksarn',
    role: Role.OWNER,
    phone: '081234567',
    email: 'kittidet@gmail.com',
    properties: ['Sawaddee Condo', 'ABC Condo']
  },
  {
    id: 2,
    name: 'Ms. Somsri Jaidee',
    role: Role.ADMIN,
    phone: '0899887766',
    email: 'somsri@gmail.com',
    properties: ['Sawaddee Condo']
  },
  {
    id: 3,
    name: 'Mr. Mana Meesu',
    role: Role.STAFF,
    phone: '0811122233',
    email: 'mana@rentsphere.com',
    properties: ['ABC Condo']
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
      // Update existing
      setStaffList(prev => prev.map(item => 
        item.id === editingStaff.id 
          ? { ...data, id: editingStaff.id } 
          : item
      ));
    } else {
      // Add new
      const newId = Math.max(...staffList.map(s => s.id), 0) + 1;
      setStaffList(prev => [...prev, { ...data, id: newId }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">คอนโดมิเนียม</h1>
          <p className="text-gray-500">จัดการข้อมูลคอนโดมิเนียมและผู้ใช้งานในระบบ</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => setActiveTab('condo')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-xl shadow-sm border transition-all duration-200 group
                ${activeTab === 'condo' 
                  ? 'bg-blue-600 text-white border-transparent ring-2 ring-blue-300 ring-offset-2' 
                  : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200 hover:bg-blue-50'}`}
            >
               <div className={`p-2 rounded-lg ${activeTab === 'condo' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-white'}`}>
                 <Building2 size={24} />
               </div>
               <span className="font-semibold text-lg">จัดการคอนโดมิเนียม</span>
            </button>

            <button
              onClick={() => setActiveTab('user')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-xl shadow-sm border transition-all duration-200 group
                ${activeTab === 'user' 
                  ? 'bg-blue-600 text-white border-transparent ring-2 ring-blue-300 ring-offset-2' 
                  : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200 hover:bg-blue-50'}`}
            >
               <div className={`p-2 rounded-lg ${activeTab === 'user' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-white'}`}>
                 <Users size={24} />
               </div>
               <span className="font-semibold text-lg">จัดการผู้ใช้งาน</span>
            </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
          
          {activeTab === 'user' ? (
            <div className="p-6">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative w-full sm:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="ค้นหาเจ้าหน้าที่..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  />
                </div>
                
                <button 
                  onClick={handleOpenAdd}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <Plus size={20} />
                  เพิ่มเจ้าหน้าที่
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-blue-50/50 text-gray-700 text-sm leading-normal">
                      <th className="py-4 px-6 font-semibold w-16 text-center">#</th>
                      <th className="py-4 px-6 font-semibold">ชื่อ / ตำแหน่ง</th>
                      <th className="py-4 px-6 font-semibold">เบอร์โทร / อีเมล</th>
                      <th className="py-4 px-6 font-semibold">อสังหาริมทรัพย์</th>
                      <th className="py-4 px-6 font-semibold text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm font-light">
                    {staffList.map((staff, index) => (
                      <tr key={staff.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition duration-150">
                        <td className="py-4 px-6 text-center font-medium">{index + 1}</td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800 text-base">{staff.name}</span>
                            <span className="text-xs bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full w-fit mt-1 font-medium">
                              {staff.role}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-gray-800 font-medium">{staff.phone}</span>
                            <span className="text-gray-500">{staff.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1">
                             {staff.properties.map((prop, i) => (
                               <span key={i} className="bg-gray-100 text-gray-600 py-1 px-2 rounded text-xs border border-gray-200">
                                 {prop}
                               </span>
                             ))}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex item-center justify-center gap-3">
                            <button 
                              onClick={() => handleOpenEdit(staff)}
                              className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition transform hover:scale-110"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(staff.id)}
                              className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition transform hover:scale-110"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {staffList.length === 0 && (
                       <tr>
                         <td colSpan={5} className="py-10 text-center text-gray-400">
                           <div className="flex flex-col items-center gap-2">
                             <Users size={48} className="text-gray-200"/>
                             <span>ไม่พบข้อมูลเจ้าหน้าที่</span>
                           </div>
                         </td>
                       </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
             /* Placeholder for Condo Tab */
            <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
               <Building2 size={64} className="mb-4 text-gray-200" />
               <h3 className="text-xl font-medium text-gray-500">Condominium Management View</h3>
               <p>Select "จัดการผู้ใช้งาน" to see the requested feature.</p>
            </div>
          )}
        </div>
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