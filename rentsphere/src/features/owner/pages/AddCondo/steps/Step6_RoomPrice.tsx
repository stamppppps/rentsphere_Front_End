import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import FloorSection from "../components/FloorSection";
import SetRoomPriceModal from "../components/SetRoomPriceModal";
import { useAddCondoStore } from "../store/addCondo.store";

export default function Step6RoomPrice() {
    const nav = useNavigate();

    const {
        floorCount,
        rooms,
        selectedRoomIds,
        generateRoomsIfEmpty,
        toggleRoom,
        selectAllOnFloor,
        unselectAllOnFloor,
        setPriceForRooms,
    } = useAddCondoStore();

    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        generateRoomsIfEmpty();
    }, [generateRoomsIfEmpty]);

    const roomsByFloor = useMemo(() => {
        const map = new Map<number, typeof rooms>();
        for (let f = 1; f <= floorCount; f++) map.set(f, []);
        rooms.forEach((r) => map.get(r.floor)!.push(r));
        return map;
    }, [rooms, floorCount]);

    const disableSetPrice = selectedRoomIds.length === 0;

    return (
        <div style={styles.content}>
            <h1 style={styles.title}>ตั้งค่าคอนโดมิเนียม</h1>

            <div style={styles.container}>
                <div style={styles.centerCol}>
                    {Array.from(roomsByFloor.entries()).map(([floor, floorRooms]) => (
                        <div key={floor}>
                            <FloorSection
                                floor={floor}
                                rooms={floorRooms}
                                selectedRoomIds={selectedRoomIds}
                                onSelectFloor={() => selectAllOnFloor(floor)}
                                onUnselectFloor={() => unselectAllOnFloor(floor)}
                                onToggleRoom={toggleRoom}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.footerBar}>
                <div style={styles.container}>
                    <div style={styles.footerInner}>
                        <div style={styles.countBtn}>
                            จำนวนห้องที่เลือก {selectedRoomIds.length} ห้อง
                        </div>

                        <button
                            style={{
                                ...styles.setPriceBtn,
                                opacity: disableSetPrice ? 0.45 : 1,
                                cursor: disableSetPrice ? "not-allowed" : "pointer",
                            }}
                            onClick={() => setOpenModal(true)}
                            disabled={disableSetPrice}
                        >
                            ระบุค่าห้อง
                        </button>

                        <button style={styles.nextBtn} onClick={() => nav("../step-7")}>
                            ต่อไป
                        </button>
                    </div>
                </div>
            </div>

            <SetRoomPriceModal
                open={openModal}
                selectedCount={selectedRoomIds.length}
                onClose={() => setOpenModal(false)}
                onSave={(price) => {
                    setPriceForRooms(selectedRoomIds, price);
                    setOpenModal(false);
                }}
            />
        </div>
    );

}

const styles: Record<string, React.CSSProperties> = {
    content: {
        flex: 1,
        padding: "28px 40px",
    },

    container: {
        width: "100%",
        maxWidth: 1120,
        margin: "0 auto",
    },

    title: {
        textAlign: "center",
        fontSize: 34,
        fontWeight: 800,
        margin: "6px 0 22px",
        color: "rgba(0,0,0,0.85)",
        letterSpacing: 0.2,
    },

    centerCol: {
        display: "flex",
        flexDirection: "column",
        gap: 18,
        paddingBottom: 110,
    },

    footerBar: {
        position: "sticky",
        bottom: 0,
        width: "100%",
        background: "rgba(238,244,255,0.9)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(147,197,253,0.45)",
        padding: "18px 0",
    },

    footerInner: {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 14,
    },

    countBtn: {
        height: 46,
        minWidth: 260,
        borderRadius: 12,
        background: "#161A2D",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 12px 22px rgba(0,0,0,0.18)",
        fontWeight: 800,
        fontSize: 14,
    },

    setPriceBtn: {
        height: 46,
        padding: "0 20px",
        borderRadius: 12,
        background: "#5B2424",
        color: "#fff",
        border: "none",
        boxShadow: "0 12px 22px rgba(0,0,0,0.18)",
        fontWeight: 800,
        fontSize: 14,
    },

    nextBtn: {
        height: 46,
        width: 96,
        borderRadius: 12,
        border: "none",
        background: "#93C5FD",
        color: "#fff",
        fontWeight: 900,
        boxShadow: "0 12px 22px rgba(0,0,0,0.18)",
        cursor: "pointer",
    },
};
