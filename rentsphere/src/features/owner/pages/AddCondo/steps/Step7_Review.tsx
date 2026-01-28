import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import ReviewBlock from "../components/ReviewBlock";
import { useAddCondoStore } from "../store/addCondo.store";

export default function Step7_Review() {
    const nav = useNavigate();

    const { rooms, floorCount, selectedRoomIds } = useAddCondoStore();

    const selectedRooms = useMemo(() => {
        const set = new Set(selectedRoomIds);
        return rooms.filter((r) => set.has(r.id));
    }, [rooms, selectedRoomIds]);

    const roomsByFloor = useMemo(() => {
        const map = new Map<number, typeof rooms>();
        for (let f = 1; f <= floorCount; f++) map.set(f, []);
        selectedRooms.forEach((r) => map.get(r.floor)!.push(r));
        return map;
    }, [selectedRooms, floorCount, rooms]);

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h1 style={styles.title}>ตั้งค่าคอนโดมิเนียม</h1>

                <ReviewBlock roomsByFloor={roomsByFloor} />

                <div style={styles.bottomBar}>
                    <div style={styles.countBtn}>
                        จำนวนห้องที่เลือก {selectedRoomIds.length} ห้อง
                    </div>

                    <div style={styles.twoBtnRow}>
                        <button type="button" style={styles.smallBtnDark}>
                            ว่าง
                        </button>
                        <button type="button" style={styles.smallBtnDark}>
                            ไม่ว่าง
                        </button>
                    </div>
                </div>

                <div style={styles.nextRow}>
                    <button type="button" style={styles.nextBtn} onClick={() => nav("../step-8")}>
                        ต่อไป
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: { width: "100%", display: "flex", justifyContent: "center" },
    container: {
        width: "100%",
        maxWidth: 980,
        padding: "22px 24px 26px",
        boxSizing: "border-box",
    },
    title: {
        textAlign: "center",
        fontSize: 30,
        fontWeight: 900,
        margin: "6px 0 18px",
        color: "rgba(0,0,0,0.85)",
    },

    bottomBar: {
        marginTop: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        flexWrap: "wrap",
    },
    countBtn: {
        height: 44,
        minWidth: 260,
        borderRadius: 10,
        background: "#161A2D",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 12px 26px rgba(0,0,0,0.18)",
        fontWeight: 800,
        fontSize: 13,
        padding: "0 16px",
    },
    twoBtnRow: { display: "flex", gap: 10 },
    smallBtnDark: {
        height: 44,
        padding: "0 18px",
        borderRadius: 10,
        border: "none",
        background: "#5B2424",
        color: "#fff",
        fontWeight: 800,
        boxShadow: "0 12px 26px rgba(0,0,0,0.18)",
        cursor: "pointer",
        fontSize: 13,
    },

    nextRow: { width: "100%", display: "flex", justifyContent: "flex-end", marginTop: 16 },
    nextBtn: {
        height: 44,
        width: 86,
        borderRadius: 10,
        border: "none",
        background: "#A78BFA",
        color: "#fff",
        fontWeight: 900,
        boxShadow: "0 12px 26px rgba(0,0,0,0.18)",
        cursor: "pointer",
    },
};
