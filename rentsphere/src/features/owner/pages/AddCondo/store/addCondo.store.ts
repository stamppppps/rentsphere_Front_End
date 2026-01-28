import { create } from "zustand";
import type { AddCondoState, Room } from "../types/addCondo.types";

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function buildRooms(floorCount: number, roomsPerFloor: number): Room[] {
    const rooms: Room[] = [];
    for (let floor = 1; floor <= floorCount; floor++) {
        for (let i = 1; i <= roomsPerFloor; i++) {
            const roomNo = `${floor}${pad2(i)}`;      // 101, 102, 103, ...
            const id = `${floor}-${i}`;              // unique id
            rooms.push({
                id,
                floor,
                roomNo,
                price: null,
            });
        }
    }
    return rooms;
}

export const useAddCondoStore = create<AddCondoState>((set, get) => ({
    floorCount: 3,
    roomsPerFloor: 3,

    rooms: [],
    selectedRoomIds: [],

    setFloorCount: (n) => set({ floorCount: n }),
    setRoomsPerFloor: (n) => set({ roomsPerFloor: n }),

    generateRoomsIfEmpty: () => {
        const { rooms, floorCount, roomsPerFloor } = get();
        if (rooms.length > 0) return;
        set({
            rooms: buildRooms(floorCount, roomsPerFloor),
            selectedRoomIds: [],
        });
    },

    toggleRoom: (roomId) => {
        const { selectedRoomIds } = get();
        const has = selectedRoomIds.includes(roomId);
        set({
            selectedRoomIds: has
                ? selectedRoomIds.filter((id) => id !== roomId)
                : [...selectedRoomIds, roomId],
        });
    },

    selectAllOnFloor: (floor) => {
        const { rooms, selectedRoomIds } = get();
        const idsOnFloor = rooms.filter((r) => r.floor === floor).map((r) => r.id);
        const next = new Set(selectedRoomIds);
        idsOnFloor.forEach((id) => next.add(id));
        set({ selectedRoomIds: Array.from(next) });
    },

    unselectAllOnFloor: (floor) => {
        const { rooms, selectedRoomIds } = get();
        const idsOnFloor = new Set(rooms.filter((r) => r.floor === floor).map((r) => r.id));
        set({ selectedRoomIds: selectedRoomIds.filter((id) => !idsOnFloor.has(id)) });
    },

    clearSelected: () => set({ selectedRoomIds: [] }),

    setPriceForRooms: (roomIds, price) => {
        const ids = new Set(roomIds);
        set((s) => ({
            rooms: s.rooms.map((r) => (ids.has(r.id) ? { ...r, price } : r)),
        }));
    },
}));
