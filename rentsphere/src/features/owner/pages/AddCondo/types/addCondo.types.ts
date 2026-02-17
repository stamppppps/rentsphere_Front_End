export type RoomStatus = "VACANT" | "OCCUPIED";

export type Room = {
    id: string;
    floor: number;
    roomNo: string;
    price: number | null;
    serviceId: number | null;
    isActive: boolean;
    status: RoomStatus;
};

export type Service = {
    id: number;
    name: string;
    isVariable: boolean;
    price: number;
};

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type BookingRow = {
    ref: string;
    customer: string;
    checkIn: string;
    price: number;
    deposit: number;
    status: BookingStatus;
};

export type RoomContractType = "MONTHLY";

export type RoomContract = {
    type: RoomContractType;
    tenantName: string;
    startDate: string;
    endDate?: string;
    rent: number;
    deposit?: number;
    createdAt: string;
};

export type MovedOutRow = {
    inDate: string;
    customer: string;
    outDate: string;
};

export type RoomExtraState = {
    contract: RoomContract | null;
    bookings: BookingRow[];
    movedOut: MovedOutRow[];
};

export type AddCondoState = {
    floorCount: number;
    roomsPerFloor: number[];

    rooms: Room[];
    selectedRoomIds: string[];

    services: Service[];
    addService: (service: Service) => void;

    setFloorConfig: (floorCount: number, roomsPerFloor: number[]) => void;
    generateRoomsIfEmpty: () => void;

    toggleRoomActive: (roomId: string) => void;
    changeRoomNo: (roomId: string, value: string) => void;
    addRoomOnFloor: (floor: number) => void;
    deleteRoomOnFloor: (floor: number, roomId: string) => void;

    toggleRoom: (roomId: string) => void;
    selectAllOnFloor: (floor: number) => void;
    unselectAllOnFloor: (floor: number) => void;
    clearSelected: () => void;

    setPriceForRooms: (roomIds: string[], price: number | null) => void;

    setStatusForRooms: (roomIds: string[], status: RoomStatus) => void;
    toggleRoomStatus: (roomId: string) => void;

    setServiceForRooms: (roomIds: string[], serviceId: number | null) => void;

    roomExtraById: Record<string, RoomExtraState>;

    getRoomExtra: (roomId: string) => RoomExtraState;
    addBooking: (roomId: string, row: BookingRow) => void;
    setContract: (roomId: string, contract: RoomContract | null) => void;
    addMovedOut: (roomId: string, row: MovedOutRow) => void;
};