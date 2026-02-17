import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FeatureType } from '../types/home.types';
import type { Activity } from '../types/home.types';
import { Package, FileText, Wrench, Calendar, ChevronRight } from 'lucide-react';

interface LatestActivitySectionProps {
  activities: Activity[];
}

const getIconData = (type: FeatureType) => {
  switch (type) {
    case FeatureType.PARCEL: 
      return { icon: <Package size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' };
    case FeatureType.BILLING: 
      return { icon: <FileText size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50' };
    case FeatureType.MAINTENANCE: 
      return { icon: <Wrench size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' };
    case FeatureType.BOOKING: 
      return { icon: <Calendar size={20} />, color: 'text-pink-600', bg: 'bg-pink-50' };
  }
};

const getFeaturePath = (type: FeatureType) => {
  switch (type) {
    case FeatureType.PARCEL:
      return '/parcel';
    case FeatureType.BILLING:
      return '/billing';
    case FeatureType.MAINTENANCE:
      return '/maintenance';
    case FeatureType.BOOKING:
      return '/booking';
  }
};

const LatestActivitySection: React.FC<LatestActivitySectionProps> = ({ activities }) => {
  const navigate = useNavigate();

  return (
    <div className="px-6 mt-8 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800 text-lg">รายการล่าสุด</h3>
        <button 
          onClick={() => navigate('/history')}
          className="text-sm text-blue-600 font-semibold hover:underline active:opacity-70 transition-opacity"
        >
          ดูทั้งหมด
        </button>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity) => {
          const { icon, color, bg } = getIconData(activity.type);
          return (
            <div 
              key={activity.id} 
              className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-100 transition-all cursor-pointer group"
              onClick={() => navigate(getFeaturePath(activity.type))}
            >
              <div className={`w-11 h-11 ${bg} ${color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-105`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-800 truncate">{activity.title}</h4>
                <p className="text-[11px] text-gray-400 font-medium">{activity.date}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <ChevronRight size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LatestActivitySection;
