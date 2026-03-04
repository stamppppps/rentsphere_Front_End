export type RoomStatus = "VACANT" | "OCCUPIED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type RoomContractType = "MONTHLY";
export type Id = string;

export type Room = {
  id: Id;
  condoId?: Id;            
  floor: number;         
  roomNo: string;


  price: number | null;


  isActive: boolean;


  status: RoomStatus;


  occupancyStatus?: RoomStatus;
  roomStatus?: string | null;

  serviceId?: string | null;
};

export type Service = {
  id: number;
  condoId: Id;
  name: string;
  isVariable: boolean;
  price: number;
};

export type CreateCondoPayload = {
  condoName: string;
  floorCount: number;
  roomsPerFloor: number[];
};

export type SetRoomPricePayload = {
  roomIds: Id[];
  price: number | null;
};

export type SetRoomStatusBulkPayload = {
  roomIds: Id[];
  occupancyStatus: RoomStatus;
};