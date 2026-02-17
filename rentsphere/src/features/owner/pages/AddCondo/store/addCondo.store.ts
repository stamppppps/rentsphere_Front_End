import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
    AddCondoState,
    BookingRow,
    MovedOutRow,
    Room,
    RoomContract,
    RoomExtraState,
    RoomStatus,
    Service,
} from "../types/addCondo.types";

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

const makeEmptyExtra = (): RoomExtraState => ({ contract: null, bookings: [], movedOut: [] });

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
                status: "VACANT" as RoomStatus,
            });
        }
    }

    return rooms;
}

function sortByFloorAndIndex(a: Room, b: Room) {
    if (a.floor !== b.floor) return a.floor - b.floor;
    const ai = parseInt(a.id.split("-")[1] ?? "0", 10);
    const bi = parseInt(b.id.split("-")[1] ?? "0", 10);
    return ai - bi;
}

function renumberFloorRooms(rooms: Room[], floor: number): Room[] {
    const floorRooms = rooms.filter((r) => r.floor === floor);
    const otherRooms = rooms.filter((r) => r.floor !== floor);

    const sorted = floorRooms.slice().sort(sortByFloorAndIndex);

    const renumbered: Room[] = sorted.map((r, idx) => ({
        ...r,
        id: `${floor}-${idx + 1}`,
        roomNo: `${floor}${pad2(idx + 1)}`,
    }));

    return [...otherRooms, ...renumbered].sort(sortByFloorAndIndex);
}

function remapExtrasAfterRenumber(params: {
    prevRooms: Room[];
    nextRooms: Room[];
    floor: number;
    prevExtraById: Record<string, RoomExtraState>;
}): Record<string, RoomExtraState> {
    const { prevRooms, nextRooms, floor, prevExtraById } = params;

    const prevFloor = prevRooms.filter((r) => r.floor === floor).slice().sort(sortByFloorAndIndex);
    const nextFloor = nextRooms.filter((r) => r.floor === floor).slice().sort(sortByFloorAndIndex);

    const nextExtra: Record<string, RoomExtraState> = { ...prevExtraById };

    for (const r of prevFloor) delete nextExtra[r.id];

    const len = Math.min(prevFloor.length, nextFloor.length);
    for (let i = 0; i < len; i++) {
        const oldId = prevFloor[i]!.id;
        const newId = nextFloor[i]!.id;

        const prev = prevExtraById[oldId];
        nextExtra[newId] = prev
            ? {
                contract: prev.contract ?? null,
                bookings: [...prev.bookings],
                movedOut: [...prev.movedOut],
            }
            : makeEmptyExtra();
    }

    return nextExtra;
}

export const useAddCondoStore = create<AddCondoState>()(
    persist(
        (set, get) => ({
            floorCount: 0,
            roomsPerFloor: [] as number[],
            rooms: [] as Room[],
            selectedRoomIds: [] as string[],
            services: [] as Service[],

            roomExtraById: {} as Record<string, RoomExtraState>,

            getRoomExtra: (roomId: string) => {
                return get().roomExtraById[roomId] ?? makeEmptyExtra();
            },

            addBooking: (roomId: string, row: BookingRow) => {
                set((s) => {
                    const prev = s.roomExtraById[roomId] ?? makeEmptyExtra();

                    const nextRooms: Room[] = s.rooms.map((r) =>
                        r.id === roomId ? { ...r, status: "OCCUPIED" as RoomStatus } : r
                    );

                    return {
                        ...s,
                        rooms: nextRooms,
                        roomExtraById: {
                            ...s.roomExtraById,
                            [roomId]: {
                                contract: prev.contract ?? null,
                                bookings: [...prev.bookings, row],
                                movedOut: [...prev.movedOut],
                            },
                        },
                    };
                });
            },

            setContract: (roomId: string, contract: RoomContract | null) => {
                set((s) => {
                    const prev = s.roomExtraById[roomId] ?? makeEmptyExtra();

                    const hasBooking = prev.bookings.length > 0;
                    const nextStatus: RoomStatus = contract || hasBooking ? "OCCUPIED" : "VACANT";

                    const nextRooms: Room[] = s.rooms.map((r) =>
                        r.id === roomId ? { ...r, status: nextStatus } : r
                    );

                    return {
                        ...s,
                        rooms: nextRooms,
                        roomExtraById: {
                            ...s.roomExtraById,
                            [roomId]: {
                                contract,
                                bookings: [...prev.bookings],
                                movedOut: [...prev.movedOut],
                            },
                        },
                    };
                });
            },

            addMovedOut: (roomId: string, row: MovedOutRow) => {
                set((s) => {
                    const prev = s.roomExtraById[roomId] ?? makeEmptyExtra();

                    return {
                        ...s,
                        roomExtraById: {
                            ...s.roomExtraById,
                            [roomId]: {
                                contract: prev.contract ?? null,
                                bookings: [...prev.bookings],
                                movedOut: [...prev.movedOut, row],
                            },
                        },
                    };
                });
            },

            addService: (service: Service) => {
                set((s) => ({ services: [...s.services, service] }));
            },

            setFloorConfig: (floorCount: number, roomsPerFloor: number[]) => {
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
                    roomExtraById: {} as Record<string, RoomExtraState>,
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

            toggleRoomActive: (roomId: string) => {
                set((s) => ({
                    rooms: s.rooms.map((r) => (r.id === roomId ? { ...r, isActive: !r.isActive } : r)),
                    selectedRoomIds: s.selectedRoomIds.filter((id) => id !== roomId),
                }));
            },

            changeRoomNo: (roomId: string, value: string) => {
                set((s) => ({
                    rooms: s.rooms.map((r) => (r.id === roomId ? { ...r, roomNo: value } : r)),
                }));
            },

            addRoomOnFloor: (floor: number) => {
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
                        status: "VACANT" as RoomStatus,
                    };

                    const nextRooms = [...s.rooms, newRoom].sort(sortByFloorAndIndex);

                    const rp = s.roomsPerFloor.slice();
                    rp[floor - 1] = (rp[floor - 1] ?? 0) + 1;

                    return { ...s, rooms: nextRooms, roomsPerFloor: rp };
                });
            },

            deleteRoomOnFloor: (floor: number, roomId: string) => {
                set((s) => {
                    const prevRooms = s.rooms;

                    const filtered = prevRooms.filter((r) => r.id !== roomId);
                    const renumbered = renumberFloorRooms(filtered, floor);

                    const rp = s.roomsPerFloor.slice();
                    rp[floor - 1] = Math.max(1, (rp[floor - 1] ?? 1) - 1);

                    const { [roomId]: _deleted, ...restExtra } = s.roomExtraById;

                    const nextExtraById = remapExtrasAfterRenumber({
                        prevRooms: filtered,
                        nextRooms: renumbered,
                        floor,
                        prevExtraById: restExtra,
                    });

                    return {
                        ...s,
                        rooms: renumbered,
                        roomsPerFloor: rp,
                        selectedRoomIds: s.selectedRoomIds.filter((id) => id !== roomId),
                        roomExtraById: nextExtraById,
                    };
                });
            },

            toggleRoom: (roomId: string) => {
                const { rooms, selectedRoomIds } = get();
                const room = rooms.find((r) => r.id === roomId);
                if (!room || !room.isActive) return;

                const has = selectedRoomIds.includes(roomId);
                set({
                    selectedRoomIds: has ? selectedRoomIds.filter((id) => id !== roomId) : [...selectedRoomIds, roomId],
                });
            },

            selectAllOnFloor: (floor: number) => {
                const { rooms, selectedRoomIds } = get();
                const ids = rooms.filter((r) => r.floor === floor && r.isActive).map((r) => r.id);
                set({ selectedRoomIds: Array.from(new Set([...selectedRoomIds, ...ids])) });
            },

            unselectAllOnFloor: (floor: number) => {
                const { rooms, selectedRoomIds } = get();
                const ids = new Set(rooms.filter((r) => r.floor === floor).map((r) => r.id));
                set({ selectedRoomIds: selectedRoomIds.filter((id) => !ids.has(id)) });
            },

            clearSelected: () => set({ selectedRoomIds: [] }),

            setPriceForRooms: (roomIds: string[], price: number | null) => {
                const ids = new Set(roomIds);
                set((s) => ({
                    rooms: s.rooms.map((r) => (ids.has(r.id) ? { ...r, price } : r)),
                }));
            },

            setStatusForRooms: (roomIds: string[], status: RoomStatus) => {
                const ids = new Set(roomIds);
                set((s) => ({
                    rooms: s.rooms.map((r) => (ids.has(r.id) ? { ...r, status } : r)),
                }));
            },

            toggleRoomStatus: (roomId: string) => {
                set((s) => ({
                    rooms: s.rooms.map((r) =>
                        r.id === roomId ? { ...r, status: (r.status === "VACANT" ? "OCCUPIED" : "VACANT") as RoomStatus } : r
                    ),
                }));
            },

            setServiceForRooms: (roomIds: string[], serviceId: number | null) => {
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
                services: s.services,
                roomExtraById: s.roomExtraById,
            }),
            version: 3,
        }
    )
);