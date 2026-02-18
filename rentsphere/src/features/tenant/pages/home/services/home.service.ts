import { FeatureType } from '../types/home.types';
import type { Resident, Activity } from '../types/home.types';

export const getResidentData = async (): Promise<Resident> => {
  return {
    name: "Mr. Kittidet Suksarn",
    condo: "Condo ABC",
    unit: "Unit A-301"
  };
};

export const getLatestActivities = async (): Promise<Activity[]> => {
  return [
    {
      id: '1',
      type: FeatureType.PARCEL,
      title: "พัสดุมาถึงแล้ว",
      date: "24 พ.ค. 2567",
      status: 'pending',
      description: "ขนส่ง Flash Express ส่งของให้คุณแล้ว"
    },
    {
      id: '2',
      type: FeatureType.BILLING,
      title: "ชำระค่าน้ำสำเร็จ",
      date: "20 พ.ค. 2567",
      status: 'completed',
      description: "บิลเลขที่ INV-20240501"
    },
    {
      id: '3',
      type: FeatureType.MAINTENANCE,
      title: "แจ้งซ่อมแอร์",
      date: "15 พ.ค. 2567",
      status: 'in-progress',
      description: "กำลังอยู่ระหว่างดำเนินการ"
    }
  ];
};
