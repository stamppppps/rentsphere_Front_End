export type Room = {
    id: string;
    floor: number;
    roomNo: string;      // "101" "102" ...
    price: number | null; // null = ยังไม่กำหนด (กรอกทีหลังได้)
};

export type AddCondoState = {
    // มาจาก step ก่อนหน้า
    floorCount: number;
    roomsPerFloor: number;

    // ข้อมูลที่สร้างจริง
    rooms: Room[];
    selectedRoomIds: string[];

    // actions
    setFloorCount: (n: number) => void;
    setRoomsPerFloor: (n: number) => void;

    generateRoomsIfEmpty: () => void;

    toggleRoom: (roomId: string) => void;
    selectAllOnFloor: (floor: number) => void;
    unselectAllOnFloor: (floor: number) => void;
    clearSelected: () => void;

    setPriceForRooms: (roomIds: string[], price: number | null) => void;
};
