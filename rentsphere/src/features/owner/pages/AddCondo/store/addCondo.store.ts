import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AddCondoState, Room, RoomStatus } from "../types/addCondo.types";

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function buildRooms(floorCount: number, roomsPerFloor: number[]): Room[] {
    const rooms: Room[] = [];

    for (let floor = 1; floor <= floorCount; floor++) {
        const count = roomsPerFloor[floor - 1] ?? 1;

        for (let i = 1; i <= count; i++) {
            rooms.push({
                id: `${floor}-${i}`,
                floor,
                roomNo: `${floor}${pad2(i)}`,
                price: null,
                serviceId: null,
                isActive: true,
                status: "VACANT",
            });
        }
    }

    return rooms;
}

// helper: re-generate roomNo & id in a floor based on current order
function renumberFloorRooms(rooms: Room[], floor: number): Room[] {
    const floorRooms = rooms.filter((r) => r.floor === floor);
    const otherRooms = rooms.filter((r) => r.floor !== floor);

    const sorted = floorRooms.slice().sort((a, b) => {
        const ai = parseInt(a.id.split("-")[1] ?? "0", 10);
        const bi = parseInt(b.id.split("-")[1] ?? "0", 10);
        return ai - bi;
    });

    const renumbered = sorted.map((r, idx) => ({
        ...r,
        id: `${floor}-${idx + 1}`,
        roomNo: `${floor}${pad2(idx + 1)}`,
    }));

    return [...otherRooms, ...renumbered].sort((a, b) => {
        if (a.floor !== b.floor) return a.floor - b.floor;
        const ai = parseInt(a.id.split("-")[1] ?? "0", 10);
        const bi = parseInt(b.id.split("-")[1] ?? "0", 10);
        return ai - bi;
    });
}

export const useAddCondoStore = create<AddCondoState>()(
    persist(
        (set, get) => ({
            floorCount: 0,
            roomsPerFloor: [],
            rooms: [],
            selectedRoomIds: [],

            // =========================
            // Step 4
            // =========================
            setFloorConfig: (floorCount, roomsPerFloor) => {
                const normalized = Array.from({ length: floorCount }, (_, i) => {
                    const v = roomsPerFloor[i];
                    if (typeof v !== "number" || Number.isNaN(v)) return 1;
                    return Math.max(1, Math.min(50, v));
                });

                set({
                    floorCount,
                    roomsPerFloor: normalized,
                    rooms: buildRooms(floorCount, normalized),
                    selectedRoomIds: [],
                });
            },

            generateRoomsIfEmpty: () => {
                const { rooms, floorCount, roomsPerFloor } = get();
                if (rooms.length > 0 || floorCount <= 0) return;

                const normalized = Array.from({ length: floorCount }, (_, i) => {
                    const v = roomsPerFloor[i];
                    if (typeof v !== "number" || Number.isNaN(v)) return 1;
                    return Math.max(1, Math.min(50, v));
                });

                set({
                    rooms: buildRooms(floorCount, normalized),
                    selectedRoomIds: [],
                });
            },

            // =========================
            // Step 5
            // =========================
            toggleRoomActive: (roomId) => {
                set((s) => ({
                    rooms: s.rooms.map((r) =>
                        r.id === roomId ? { ...r, isActive: !r.isActive } : r
                    ),
                    selectedRoomIds: s.selectedRoomIds.filter((id) => id !== roomId),
                }));
            },

            changeRoomNo: (roomId, value) => {
                set((s) => ({
                    rooms: s.rooms.map((r) => (r.id === roomId ? { ...r, roomNo: value } : r)),
                }));
            },

            addRoomOnFloor: (floor) => {
                set((s) => {
                    const current = s.rooms.filter((r) => r.floor === floor);
                    const nextIndex = current.length + 1;
                    if (nextIndex > 50) return s;

                    const newRoom: Room = {
                        id: `${floor}-${nextIndex}`,
                        floor,
                        roomNo: `${floor}${pad2(nextIndex)}`,
                        price: null,
                        serviceId: null,
                        isActive: true,
                        status: "VACANT",
                    };

                    const nextRooms = [...s.rooms, newRoom];
                    const rp = s.roomsPerFloor.slice();
                    rp[floor - 1] = (rp[floor - 1] ?? 0) + 1;

                    return { ...s, rooms: nextRooms, roomsPerFloor: rp };
                });
            },

            deleteRoomOnFloor: (floor, roomId) => {
                set((s) => {
                    const filtered = s.rooms.filter((r) => r.id !== roomId);
                    const renumbered = renumberFloorRooms(filtered, floor);

                    const rp = s.roomsPerFloor.slice();
                    rp[floor - 1] = Math.max(1, (rp[floor - 1] ?? 1) - 1);

                    return {
                        ...s,
                        rooms: renumbered,
                        roomsPerFloor: rp,
                        selectedRoomIds: s.selectedRoomIds.filter((id) => id !== roomId),
                    };
                });
            },

            // =========================
            // Step 6
            // =========================
            toggleRoom: (roomId) => {
                const { rooms, selectedRoomIds } = get();
                const room = rooms.find((r) => r.id === roomId);
                if (!room || !room.isActive) return;

                const has = selectedRoomIds.includes(roomId);
                set({
                    selectedRoomIds: has
                        ? selectedRoomIds.filter((id) => id !== roomId)
                        : [...selectedRoomIds, roomId],
                });
            },

            selectAllOnFloor: (floor) => {
                const { rooms, selectedRoomIds } = get();
                const ids = rooms.filter((r) => r.floor === floor && r.isActive).map((r) => r.id);
                set({ selectedRoomIds: Array.from(new Set([...selectedRoomIds, ...ids])) });
            },

            unselectAllOnFloor: (floor) => {
                const { rooms, selectedRoomIds } = get();
                const ids = new Set(rooms.filter((r) => r.floor === floor).map((r) => r.id));
                set({ selectedRoomIds: selectedRoomIds.filter((id) => !ids.has(id)) });
            },

            clearSelected: () => set({ selectedRoomIds: [] }),

            setPriceForRooms: (roomIds, price) => {
                const ids = new Set(roomIds);
                set((s) => ({
                    rooms: s.rooms.map((r) => (ids.has(r.id) ? { ...r, price } : r)),
                }));
            },

            // =========================
            // Step 7
            // =========================
            setStatusForRooms: (roomIds, status: RoomStatus) => {
                const ids = new Set(roomIds);
                set((s) => ({
                    rooms: s.rooms.map((r) => (ids.has(r.id) ? { ...r, status } : r)),
                }));
            },

            toggleRoomStatus: (roomId) => {
                set((s) => ({
                    rooms: s.rooms.map((r) =>
                        r.id === roomId
                            ? { ...r, status: r.status === "VACANT" ? "OCCUPIED" : "VACANT" }
                            : r
                    ),
                }));
            },

            // =========================
            // Step 8
            // =========================
            setServiceForRooms: (roomIds: string[], serviceId: string | null) => {
                const ids = new Set(roomIds);
                set((s) => ({
                    rooms: s.rooms.map((r) => (ids.has(r.id) ? { ...r, serviceId } : r)),
                }));
            },
        }),
        {
            name: "rentsphere-add-condo-store",
            storage: createJSONStorage(() => localStorage),

            partialize: (s) => ({
                floorCount: s.floorCount,
                roomsPerFloor: s.roomsPerFloor,
                rooms: s.rooms,

                // ถ้าอยากให้ ห้องที่เลือก อยู่ต่อหลัง refreshเปิดบรรทัดนี้
                // selectedRoomIds: s.selectedRoomIds,
            }),

            version: 1,
        }
    )
);
