import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Check, Clock, Box } from 'lucide-react';
import ContainerIcon from '@/assets/Container.png';

// --- Types ---
type ParcelStatus = 'pending' | 'received';

interface Parcel {
  id: string;
  parcelCode: string;
  receivedDate: string;
  receiverName: string;
  room: string;
  dropOffLocation: string;
  staffName: string;
  status: ParcelStatus;
  imageUrl: string;
  note?: string;
}

// --- Mock Data ---
const MOCK_PARCELS: Parcel[] = [
  {
    id: '1',
    parcelCode: '#P-1024',
    receivedDate: '29 พฤษภาคม 2024',
    receiverName: 'นายกิตติเดช สุขสรรค์',
    room: 'A-301',
    dropOffLocation: 'สำนักงานนิติบุคคล',
    staffName: 'เจ้าหน้าที่อาคาร',
    status: 'pending',
    imageUrl: ContainerIcon,
    note: 'พัสดุอยู่ในสภาพเรียบร้อย\nกรุณานำบัตรประจำตัวผู้พักอาศัยมาด้วย'
  },
  {
    id: '2',
    parcelCode: '#P-1023',
    receivedDate: '29 พฤษภาคม 2024',
    receiverName: 'นายกิตติเดช สุขสรรค์',
    room: 'A-301',
    dropOffLocation: 'Lobby',
    staffName: 'รปภ. สมชาย',
    status: 'received',
    imageUrl: ContainerIcon,
  },
  {
    id: '3',
    parcelCode: '#P-1022',
    receivedDate: '20 พฤษภาคม 2024',
    receiverName: 'นายกิตติเดช สุขสรรค์',
    room: 'A-301',
    dropOffLocation: 'Smart Locker',
    staffName: '-',
    status: 'received',
    imageUrl: ContainerIcon,
  },
  {
    id: '4',
    parcelCode: '#P-1021',
    receivedDate: '9 พฤษภาคม 2024',
    receiverName: 'นายกิตติเดช สุขสรรค์',
    room: 'A-301',
    dropOffLocation: 'Lobby',
    staffName: 'รปภ. สมร',
    status: 'received',
    imageUrl: ContainerIcon,
  },
];

// --- Components ---

const StatusBadge: React.FC<{ status: ParcelStatus }> = ({ status }) => {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold">
        <Clock size={12} />
        รอรับพัสดุ
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold">
      <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
        <Check size={8} className="text-white" strokeWidth={4} />
      </div>
      รับแล้ว
    </span>
  );
};

const ParcelPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'detail' | 'success'>('list');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);

  const pendingCount = MOCK_PARCELS.filter(p => p.status === 'pending').length;

  const handleParcelClick = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setView('detail');
  };

  const handleConfirmReceive = () => {
    setView('success');
  };

  const handleBack = () => {
    if (view === 'detail') {
      setView('list');
      setSelectedParcel(null);
    } else if (view === 'success') {
      setView('list');
      setSelectedParcel(null);
    } else {
      navigate(-1);
    }
  };

  // ======================== LIST VIEW ========================
  const renderList = () => (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#EAF2FF] p-5 border border-blue-100">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm">
              <img src={ContainerIcon} alt="Box" className="w-12 h-12 object-contain" />
            </div>
            {pendingCount > 0 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#93C5FD] rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow">
                {pendingCount}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">คุณมีพัสดุ {pendingCount} ชิ้น</h2>
            <p className="text-sm text-gray-500 font-medium">รอรับพัสดุ</p>
          </div>
        </div>
      </div>

      {/* List Items */}
      <div className="space-y-3 pb-20">
        {MOCK_PARCELS.map((parcel) => (
          <div
            key={parcel.id}
            onClick={() => handleParcelClick(parcel)}
            className="flex items-center p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
          >
            <div className="w-20 h-20 bg-[#f8f9fc] rounded-xl overflow-hidden flex-shrink-0">
              <img src={parcel.imageUrl} alt={parcel.parcelCode} className="w-full h-full object-contain p-2" />
            </div>

            <div className="flex-1 ml-4 min-w-0">
              <h3 className="text-base font-bold text-gray-900 mb-0.5">พัสดุ {parcel.parcelCode}</h3>
              <p className="text-xs text-gray-400 mb-2">ได้รับเมื่อ: {parcel.receivedDate}</p>
              <StatusBadge status={parcel.status} />
            </div>

            <div className="ml-2 text-gray-300">
              <ChevronRight size={20} strokeWidth={2} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ======================== DETAIL VIEW ========================
  const renderDetail = () => {
    if (!selectedParcel) return null;
    return (
      <div className="space-y-5 pb-8">
        {/* Image */}
        <div className="w-full h-56 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative">
          <img
            src={selectedParcel.imageUrl}
            alt={selectedParcel.parcelCode}
            className="w-full h-full object-contain p-6"
          />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#93C5FD] text-white px-4 py-1.5 rounded-full shadow-md text-xs font-bold flex items-center gap-1.5">
            <Search size={13} />
            ดูรูปภาพเต็ม
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-extrabold text-gray-900">ข้อมูลพัสดุ</h2>

          <div className="space-y-3 text-sm">
            <div className="flex">
              <span className="w-28 text-gray-400 font-medium flex-shrink-0">รหัสพัสดุ:</span>
              <span className="text-gray-900 font-bold">{selectedParcel.parcelCode}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-gray-400 font-medium flex-shrink-0">ได้รับเมื่อ:</span>
              <span className="text-gray-900 font-bold">{selectedParcel.receivedDate}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-gray-400 font-medium flex-shrink-0">ผู้รับ:</span>
              <span className="text-gray-900 font-bold">{selectedParcel.receiverName}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-gray-400 font-medium flex-shrink-0">ห้อง:</span>
              <span className="text-gray-900 font-bold">{selectedParcel.room}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-gray-400 font-medium flex-shrink-0">จุดรับฝาก:</span>
              <span className="text-gray-900 font-bold">{selectedParcel.dropOffLocation}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-gray-400 font-medium flex-shrink-0">ผู้ดูแล:</span>
              <span className="text-gray-900 font-bold">{selectedParcel.staffName}</span>
            </div>
          </div>
        </div>

        {/* Note Card */}
        {selectedParcel.note && (
          <div className="bg-[#EAF2FF] rounded-3xl p-6 border border-blue-100">
            <h3 className="text-sm font-extrabold text-gray-900 mb-2">หมายเหตุจากเจ้าหน้าที่</h3>
            <p className="text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-line">
              {selectedParcel.note}
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="px-2">
          {/* Item 1 */}
          <div className="flex items-start gap-3 pb-6 relative">
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-[#93C5FD] flex items-center justify-center border-2 border-white shadow">
                <Check size={10} className="text-white" strokeWidth={4} />
              </div>
              <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
            </div>
            <p className="text-sm font-bold text-gray-600 pt-0.5">พัสดุเข้าระบบ: {selectedParcel.receivedDate}</p>
          </div>

          {/* Item 2 */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              {selectedParcel.status === 'pending' ? (
                <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center border-2 border-white shadow ring-2 ring-yellow-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#93C5FD] flex items-center justify-center border-2 border-white shadow">
                  <Check size={10} className="text-white" strokeWidth={4} />
                </div>
              )}
            </div>
            <div className="pt-0.5">
              <StatusBadge status={selectedParcel.status} />
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        {selectedParcel.status === 'pending' && (
          <div className="flex justify-center pt-2 pb-8">
            <button
              onClick={handleConfirmReceive}
              className="w-full max-w-xs h-12 bg-[#93C5FD] hover:bg-[#7bb5fc] text-white rounded-full font-bold shadow-lg shadow-blue-200 active:scale-[0.98] transition"
            >
              ยืนยันการรับพัสดุ
            </button>
          </div>
        )}
      </div>
    );
  };

  // ======================== SUCCESS VIEW ========================
  const renderSuccess = () => {
    if (!selectedParcel) return null;
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center space-y-8">
        {/* Icon */}
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-[#93C5FD] flex items-center justify-center shadow-lg shadow-blue-200">
            <Check size={56} className="text-white" strokeWidth={4} />
          </div>
          <div className="absolute inset-0 bg-[#93C5FD] rounded-full blur-xl opacity-30 animate-pulse" />
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900">รับพัสดุเรียบร้อย</h2>

        {/* Card */}
        <div className="w-full bg-white rounded-3xl p-4 shadow-md border border-gray-100">
          <div className="w-full h-40 bg-[#f8f9fc] rounded-2xl overflow-hidden mb-4">
            <img src={selectedParcel.imageUrl} alt={selectedParcel.parcelCode} className="w-full h-full object-contain p-4" />
          </div>
          <div className="text-left px-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">พัสดุ {selectedParcel.parcelCode}</h3>
            <p className="text-sm text-gray-400 mb-3">ได้รับเมื่อ: {selectedParcel.receivedDate}</p>
            <StatusBadge status="received" />
          </div>
        </div>

        {/* Button */}
        <button
          onClick={() => {
            setView('list');
            setSelectedParcel(null);
          }}
          className="w-full max-w-xs h-12 bg-[#93C5FD] hover:bg-[#7bb5fc] text-white rounded-full font-bold shadow-lg shadow-blue-200 active:scale-[0.98] transition"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  };

  // ======================== MAIN RENDER ========================
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-6 pt-4 pb-3 flex items-center justify-between border-b border-gray-50">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-50 active:scale-90 transition text-gray-700"
        >
          <ChevronLeft size={26} strokeWidth={2.5} />
        </button>

        <h1 className="text-lg font-extrabold text-gray-900">พัสดุ</h1>

        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="px-5 pt-4">
        {view === 'list' && renderList()}
        {view === 'detail' && renderDetail()}
        {view === 'success' && renderSuccess()}
      </div>
    </div>
  );
};

export default ParcelPage;
