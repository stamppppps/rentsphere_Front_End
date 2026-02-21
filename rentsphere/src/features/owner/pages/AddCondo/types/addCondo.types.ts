export type RoomStatus = "VACANT" | "OCCUPIED";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type RoomContractType = "MONTHLY";

export type Id = string;

export type Room = {
    id: Id;
    condoId: Id;
    floor: number;
    roomNo: string;
    price: number | null;
    serviceId: number | null;
    isActive: boolean;
    status: RoomStatus;
};

export type Service = {
    id: number;
    condoId: Id;
    name: string;
    isVariable: boolean;
    price: number;
};

export type BookingRow = {
    id: Id;
    roomId: Id;
    customer: string;
    checkIn: string;
    price: number;
    deposit: number;
    status: BookingStatus;
    createdAt: string;
};

export type RoomContract = {
    id: Id;
    roomId: Id;
    type: RoomContractType;
    tenantName: string;
    startDate: string;
    endDate?: string;
    rent: number;
    deposit?: number;
    createdAt: string;
};

export type MovedOutRow = {
    id: Id;
    roomId: Id;
    inDate: string;
    customer: string;
    outDate: string;
    createdAt: string;
};

export type RoomDetail = {
    room: Room;
    contract: RoomContract | null;
    bookings: BookingRow[];
    movedOut: MovedOutRow[];
};

export type CondoSummary = {
    condoId: Id;
    condoName: string;
    totalRooms: number;
    activeRooms: number;
    occupiedRooms: number;
    vacantRooms: number;
};

export type CreateCondoPayload = {
    condoName: string;
    floorCount: number;
    roomsPerFloor: number[];
};

export type CreateBookingPayload = {
    roomId: Id;
    customer: string;
    checkIn: string;
    price: number;
    deposit: number;
    status: BookingStatus;
};

export type UpsertMonthlyContractPayload = {
    roomId: Id;
    type: RoomContractType;
    tenantName: string;
    startDate: string;
    endDate?: string;
    rent: number;
    deposit?: number;
};

export type SetRoomPricePayload = {
    roomId: Id;
    price: number | null;
};

export type SetRoomServicePayload = {
    roomId: Id;
    serviceId: number | null;
};