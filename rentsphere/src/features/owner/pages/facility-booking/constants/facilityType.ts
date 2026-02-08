
import { FacilityType } from '../types/facility';

/**
 * Facility Type Configuration
 * This is the single source of truth for category labels and visual styles.
 */
export const FACILITY_TYPE_CONFIG = {
  [FacilityType.ALL]: { 
    label: 'ทั้งหมด', 
    color: 'bg-indigo-600 text-white border-indigo-600',
    activeColor: 'bg-indigo-700 ring-4 ring-indigo-500/20'
  },
  [FacilityType.SPORT]: { 
    label: 'กีฬาและสุขภาพ', 
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    activeColor: 'bg-orange-600 text-white border-orange-600 shadow-orange-100'
  },
  [FacilityType.RELAX]: { 
    label: 'พักผ่อนหย่อนใจ', 
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    activeColor: 'bg-blue-600 text-white border-blue-600 shadow-blue-100'
  },
  [FacilityType.WORKING]: { 
    label: 'พื้นที่ทำงาน', 
    color: 'bg-purple-50 text-purple-600 border-purple-100',
    activeColor: 'bg-purple-600 text-white border-purple-600 shadow-purple-100'
  },
  [FacilityType.OUTDOOR]: { 
    label: 'พื้นที่กลางแจ้ง', 
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    activeColor: 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-100'
  },
};
