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

export type AddCondoState = {
    floorCount: number;
    roomsPerFloor: number[];

    rooms: Room[];
    selectedRoomIds: string[];

    setFloorConfig: (floorCount: number, roomsPerFloor: number[]) => void;
    generateRoomsIfEmpty: () => void;

    // Step 5
    toggleRoomActive: (roomId: string) => void;
    changeRoomNo: (roomId: string, value: string) => void;
    addRoomOnFloor: (floor: number) => void;
    deleteRoomOnFloor: (floor: number, roomId: string) => void;

    // Step 6
    toggleRoom: (roomId: string) => void;
    selectAllOnFloor: (floor: number) => void;
    unselectAllOnFloor: (floor: number) => void;
    clearSelected: () => void;
    setPriceForRooms: (roomIds: string[], price: number | null) => void;

    // Step 7
    setStatusForRooms: (roomIds: string[], status: RoomStatus) => void;
    toggleRoomStatus: (roomId: string) => void;

    // Step 8
    setServiceForRooms: (roomIds: string[], serviceId: string | null) => void;
};
