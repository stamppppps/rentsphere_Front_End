import { type Facility, FacilityType, FacilityStatus } from '../types/facility';

const MOCK_FACILITIES: Facility[] = [
  {
    id: 'f1',
    name: 'ฟิตเนส (Fitness)',
    description: 'ฟิตเนสทันสมัย พร้อมอุปกรณ์ออกกำลังกายครบครัน สำหรับผู้พักอาศัย',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
    type: FacilityType.SPORT,
    status: FacilityStatus.AVAILABLE,
    capacity: 15,
    openTime: '06:00',
    closeTime: '22:00',
    durationPerSession: 1.5,
    isAutoApprove: false,
    tags: ['Gym', 'Weights', 'Cardio'],
    location: 'ชั้น 5 อาคารคลับเฮาส์'
  },
  {
    id: 'f2',
    name: 'สระว่ายน้ำ (Pool)',
    description: 'สระว่ายน้ำอินฟินิตี้ พร้อมวิวเมืองสวยงาม ผ่อนคลายได้ตลอดวัน',
    imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800',
    type: FacilityType.SPORT,
    status: FacilityStatus.AVAILABLE,
    capacity: 30,
    openTime: '06:00',
    closeTime: '21:00',
    durationPerSession: 2,
    isAutoApprove: true,
    tags: ['Pool', 'View', 'Outdoor'],
    location: 'ชั้น Rooftop'
  },
  {
    id: 'f3',
    name: 'ห้องเกม (Game Room)',
    description: 'ห้องเกม พร้อมด้วยเกมและความบันเทิง สำหรับคลายเครียด',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800',
    type: FacilityType.RELAX,
    status: FacilityStatus.AVAILABLE,
    capacity: 8,
    openTime: '10:00',
    closeTime: '22:00',
    durationPerSession: 1,
    isAutoApprove: false,
    tags: ['Fun', 'Social', 'Gaming'],
    location: 'ชั้น 2 โซนพักผ่อน'
  },
  {
    id: 'f4',
    name: 'ห้องประชุม (Meeting Room)',
    description: 'ห้องประชุมทันสมัย เหมาะสำหรับทำงาน ประชุม และกิจกรรมต่าง ๆ',
    imageUrl: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800',
    type: FacilityType.WORKING,
    status: FacilityStatus.AVAILABLE,
    capacity: 12,
    openTime: '08:00',
    closeTime: '20:00',
    durationPerSession: 1,
    isAutoApprove: true,
    tags: ['Office', 'Quiet', 'AC'],
    location: 'ชั้น 1 อาคารสำนักงาน'
  }
];

// Memory storage to simulate persistence during session
const localStore = [...MOCK_FACILITIES];

export const facilityService = {
  getFacilities: async (): Promise<Facility[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(localStore), 500));
  },
  
  getFacilityById: async (id: string): Promise<Facility | null> => {
    const f = localStore.find(f => f.id === id);
    return new Promise((resolve) => setTimeout(() => resolve(f ? { ...f } : null), 300));
  },
  
  createFacility: async (facility: Partial<Facility>): Promise<Facility> => {
    const newFacility: Facility = { 
      ...MOCK_FACILITIES[0], 
      ...facility, 
      id: `f${Date.now()}` 
    } as Facility;
    localStore.push(newFacility);
    return new Promise((resolve) => setTimeout(() => resolve(newFacility), 800));
  },
  
  updateFacility: async (id: string, data: Partial<Facility>): Promise<Facility> => {
    const index = localStore.findIndex(f => f.id === id);
    if (index !== -1) {
      // Ensure specific fields aren't accidentally wiped if they are null in data
      localStore[index] = { ...localStore[index], ...data };
      return new Promise((resolve) => setTimeout(() => resolve({ ...localStore[index] }), 500));
    }
    throw new Error('Facility not found');
  }
};
