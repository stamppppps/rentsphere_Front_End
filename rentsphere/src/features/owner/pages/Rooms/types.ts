// src/features/owner/pages/Rooms/types.ts

export type OccupancyStatus = "VACANT" | "OCCUPIED";

export type RoomDetail = {
  id: string;

  condoId: string;
  condoName: string | null;

  roomNo: string;
  floor: number | null;

  // หน้า UI ใช้ชื่อ price
  price: number | null;

  isActive: boolean;
  occupancyStatus: OccupancyStatus;
};

export type MeterData = {
  waterMeter: string;
  elecMeter: string;
};