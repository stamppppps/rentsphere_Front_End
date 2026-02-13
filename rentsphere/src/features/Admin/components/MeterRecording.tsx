import React, { useState, useEffect, useCallback } from 'react';
import { Droplet, Zap, Search, Filter, Eye, Trash2, RotateCcw, Save } from 'lucide-react';
import type { RoomReading, MeterType } from '../types/types';

// Mock data - in real app, this would come from API
const INITIAL_DATA: RoomReading[] = [
  { id: '1', roomNo: '101', status: 'occupied', previousReading: 1240, currentReading: '', usage: 0 },
  { id: '2', roomNo: '102', status: 'vacant', previousReading: 850, currentReading: '', usage: 0 },
  { id: '3', roomNo: '201', status: 'occupied', previousReading: 450, currentReading: '', usage: 0 },
  { id: '4', roomNo: '202', status: 'occupied', previousReading: 2100, currentReading: '', usage: 0 },
];

// Constants
const METER_MULTIPLIERS: Record<MeterType, number> = {
  water: 1,
  electricity: 1.5,
};

const TAB_STYLES = {
  water: {
    active: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)',
    inactive: 'bg-white text-purple-400 border border-purple-200 hover:bg-purple-50',
  },
  electricity: {
    active: 'linear-gradient(90deg, #facc15 0%, #fbbf24 100%)',
    inactive: 'bg-white text-yellow-500 border border-yellow-200 hover:bg-yellow-50',
  },
};

interface MeterRecordingProps {
  onSave?: (readings: RoomReading[]) => void;
}

export const MeterRecording: React.FC<MeterRecordingProps> = ({ onSave }) => {
  const [activeTab, setActiveTab] = useState<MeterType>('water');
  const [readings, setReadings] = useState<RoomReading[]>(INITIAL_DATA);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Reset readings when tab changes
  useEffect(() => {
    const multiplier = METER_MULTIPLIERS[activeTab];
    const newData = INITIAL_DATA.map((reading): RoomReading => ({
      ...reading,
      previousReading: Math.floor(reading.previousReading * multiplier),
      currentReading: '',
      usage: 0,
    }));
    setReadings(newData);
  }, [activeTab]);

  const handleReadingChange = useCallback((id: string, value: string): void => {
    const numValue = value === '' ? '' : parseInt(value, 10);

    setReadings((prevReadings) =>
      prevReadings.map((room): RoomReading => {
        if (room.id !== id) return room;

        let usage = 0;
        if (typeof numValue === 'number' && !isNaN(numValue)) {
          usage = Math.max(0, numValue - room.previousReading);
        }

        return { ...room, currentReading: numValue as number | '', usage };
      })
    );
  }, []);

  const handleReset = useCallback((): void => {
    setReadings((prevReadings) =>
      prevReadings.map((reading): RoomReading => ({
        ...reading,
        currentReading: '',
        usage: 0,
      }))
    );
  }, []);

  const handleSave = useCallback((): void => {
    if (onSave) {
      onSave(readings);
    }
    // TODO: Implement actual save logic (API call)
    console.log('Saving readings:', readings);
  }, [readings, onSave]);

  const filteredReadings = readings.filter((reading) =>
    reading.roomNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTabClassName = (tab: MeterType): string => {
    const isActive = activeTab === tab;
    const baseClass = 'flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all duration-200';

    if (isActive) {
      return `${baseClass} text-white shadow-lg`;
    }
    return `${baseClass} ${TAB_STYLES[tab].inactive}`;
  };

  const getStatusLabel = (status: RoomReading['status']): string => {
    return status === 'occupied' ? 'ไม่ว่าง' : 'ว่าง';
  };

  const getStatusClassName = (status: RoomReading['status']): string => {
    return status === 'occupied'
      ? 'bg-red-100 text-red-500'
      : 'bg-green-100 text-green-500';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header / Tabs */}
      <div className="p-6 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Tabs */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('water')}
              className={getTabClassName('water')}
              style={activeTab === 'water' ? { background: TAB_STYLES.water.active } : undefined}
            >
              <Droplet size={18} className={activeTab === 'water' ? 'fill-current' : ''} />
              ค่าน้ำ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('electricity')}
              className={getTabClassName('electricity')}
              style={activeTab === 'electricity' ? { background: TAB_STYLES.electricity.active } : undefined}
            >
              <Zap size={18} className={activeTab === 'electricity' ? 'fill-current' : ''} />
              ค่าไฟ
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" size={18} />
              <input
                type="text"
                placeholder="ค้นหาห้อง..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-purple-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                style={{ background: '#f5f3ff' }}
              />
            </div>
            <button
              type="button"
              className="p-2.5 bg-white border border-purple-200 rounded-full text-purple-500 hover:bg-purple-50"
              aria-label="ตัวกรอง"
            >
              <Filter size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto px-6">
        <div className="rounded-xl overflow-hidden" style={{ border: '3px solid #818cf8' }}>
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-left text-purple-800 text-sm bg-white">
                <th className="py-3 px-4 font-semibold">ห้อง</th>
                <th className="py-3 px-4 font-semibold">สถานะห้อง</th>
                <th className="py-3 px-4 font-semibold">ยอดครั้งก่อน</th>
                <th className="py-3 px-4 font-semibold">ยอดปัจจุบัน</th>
                <th className="py-3 px-4 font-semibold text-center">หน่วยที่ใช้</th>
                <th className="py-3 px-4 font-semibold text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm bg-white">
              {filteredReadings.map((room) => (
                <tr key={room.id} className="border-t border-gray-100 hover:bg-purple-50/30 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-800">{room.roomNo}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusClassName(room.status)}`}>
                      {getStatusLabel(room.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-600">{room.previousReading.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4">
                    <input
                      type="number"
                      value={room.currentReading}
                      onChange={(e) => handleReadingChange(room.id, e.target.value)}
                      className="w-28 px-3 py-2 border border-purple-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                      style={{ background: '#f5f3ff' }}
                      placeholder="0"
                      min="0"
                    />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-semibold ${room.usage > 0 ? 'text-purple-600' : 'text-gray-300'}`}>
                      {room.usage.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        className="p-2 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        aria-label="ดูรายละเอียด"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="ลบ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          แสดงทั้งหมด {filteredReadings.length} รายการ จาก {readings.length} รายการ
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={16} />
            ล้างข้อมูล
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium shadow-lg transition-all hover:shadow-xl hover:scale-105"
            style={{ background: 'linear-gradient(90deg, #f472b6 0%, #c084fc 100%)' }}
          >
            <Save size={16} />
            บันทึกข้อมูล
          </button>
        </div>
      </div>

      {/* Pagination */}
      <div className="pb-6 flex justify-center">
        <nav className="flex gap-2" aria-label="Pagination">
          <button type="button" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:border-purple-300 text-xs" aria-label="Previous page">&lt;</button>
          <button type="button" className="w-8 h-8 flex items-center justify-center rounded-lg text-white shadow-md text-xs" style={{ background: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)' }} aria-current="page">1</button>
          <button type="button" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-purple-300 text-xs">2</button>
          <button type="button" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-purple-300 text-xs">3</button>
          <button type="button" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:border-purple-300 text-xs" aria-label="Next page">&gt;</button>
        </nav>
      </div>
    </div>
  );
};