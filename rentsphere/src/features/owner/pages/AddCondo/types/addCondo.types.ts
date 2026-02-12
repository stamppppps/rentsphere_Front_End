export type RoomStatus = "VACANT" | "OCCUPIED";

export type Room = {
    id: string;
    floor: number;
    roomNo: string;
    price: number | null;
    serviceId: string | null;
    isActive: boolean;
    status: RoomStatus;
    roomNumber?: string;
    number?: string;
    name?: string;
};

export type Service = {
    id: number;
    name: string;
    isVariable: boolean;
    price: number;
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

    setServiceForRooms: (roomIds: string[], serviceId: string | null) => void;
};