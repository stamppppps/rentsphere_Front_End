import React, { useState } from 'react';
import { useFacilities } from '../hooks/useFacilities';
import FacilityCard from '../components/FacilityCard';
import { FacilityType } from '../types/facility';
import { Search, Plus, History, LayoutGrid, List } from 'lucide-react';
import { FACILITY_TYPE_CONFIG } from '../constants/facilityType';
import CreateFacilityModal from '../modals/CreateFacilityModal';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
<<<<<<< HEAD
import OwnerShell from "@/features/owner/components/OwnerShell";
=======
>>>>>>> main

const FacilityListPage: React.FC = () => {
  const { facilities, loading } = useFacilities();
  const [activeType, setActiveType] = useState<FacilityType>(FacilityType.ALL);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredFacilities = facilities.filter(f => {
    const matchesType = activeType === FacilityType.ALL || f.type === activeType;
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
<<<<<<< HEAD
    <OwnerShell activeKey="common-area-booking" showSidebar>
      <div className="max-w-7xl mx-auto px-6 py-12">
=======
    <div className="max-w-7xl mx-auto px-6 py-12">
>>>>>>> main
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
<<<<<<< HEAD
          </nav>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">พื้นที่ส่วนกลาง</h1>
          <p className="text-slate-500 mt-2 font-medium">จัดการรายการพื้นที่และการเข้าใช้งานของลูกบ้าน</p>
=======
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-indigo-600">Facilities</span>
          </nav>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">พื้นที่ส่วนกลาง</h1>
          <p className="text-slate-500 mt-2 font-medium">จัดการรายการพื้นที่และการเข้าใช้งานของลูกบ้านแบบ Real-time</p>
>>>>>>> main
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/owner/common-area-booking/history" 
            className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <History size={18} />
            ประวัติการจอง
          </Link>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
<<<<<<< HEAD
            className="flex items-center gap-2 px-6 py-3.5 bg-[#2C92D6] text-white !rounded-[20px] font-bold hover:bg-[#2F5F93] transition-all shadow-xl shadow-[#3970AE]/20 active:scale-95"
=======
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-[20px] font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
>>>>>>> main
          >
            <Plus size={20} />
            เพิ่มพื้นที่
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm mb-10 flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อพื้นที่ส่วนกลาง..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto no-scrollbar pb-1 lg:pb-0">
          {(Object.keys(FACILITY_TYPE_CONFIG) as FacilityType[]).map((type) => {
            const config = FACILITY_TYPE_CONFIG[type];
            const isActive = activeType === type;
            
            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-6 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all border shadow-sm ${
                  isActive 
                    ? config.activeColor || 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm text-center">กำลังจัดเตรียมข้อมูลพื้นที่...</p>
        </div>
      ) : filteredFacilities.length > 0 ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "flex flex-col gap-4"}>
          {filteredFacilities.map(facility => (
            <FacilityCard 
              key={facility.id} 
              facility={facility} 
            />
          ))}
        </div>
      ) : (
        <EmptyState title="ไม่พบพื้นที่" description="ลองเปลี่ยนคำค้นหาหรือประเภทพื้นที่เพื่อให้แสดงผลลัพธ์อื่นที่คุณต้องการ" />
      )}

<<<<<<< HEAD
        {isCreateModalOpen && <CreateFacilityModal onClose={() => setIsCreateModalOpen(false)} />}
      </div>
    </OwnerShell>
=======
      {isCreateModalOpen && <CreateFacilityModal onClose={() => setIsCreateModalOpen(false)} />}
    </div>
>>>>>>> main
  );
};

export default FacilityListPage;

