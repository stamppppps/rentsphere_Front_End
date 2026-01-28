import type { Room } from "../types/addCondo.types";
import RoomCard from "./RoomCard";

type Props = {
    floor: number;
    rooms: Room[];
    selectedRoomIds: string[];
    onSelectFloor: () => void;
    onUnselectFloor: () => void;
    onToggleRoom: (id: string) => void;
};

export default function FloorSection({
    floor,
    rooms,
    selectedRoomIds,
    onSelectFloor,
    onUnselectFloor,
    onToggleRoom,
}: Props) {
    return (
        <div style={styles.wrap}>
            <div style={styles.header}>
                <div style={styles.floorText}>ชั้นที่ {floor}</div>

                <div style={styles.actions}>
                    <button style={styles.greenBtn} onClick={onSelectFloor}>
                        <span style={styles.dotGreen} />
                        เลือกทั้งชั้น
                    </button>
                    <button style={styles.redBtn} onClick={onUnselectFloor}>
                        <span style={styles.dotRed} />
                        ยกเลิกเลือกทั้งชั้น
                    </button>
                </div>
            </div>

            <div style={styles.inner}>
                <div style={styles.roomsRow}>
                    {rooms.map((r) => (
                        <RoomCard
                            key={r.id}
                            room={r}
                            selected={selectedRoomIds.includes(r.id)}
                            onClick={() => onToggleRoom(r.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    wrap: {
        width: "100%",
        boxSizing: "border-box",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(255,248,232,0.92)",
        boxShadow: "0 12px 24px rgba(0,0,0,0.10)",
        overflow: "hidden",
    },

    header: {
        height: 52,
        background: "#FFF5DE",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
    },

    floorText: {
        fontWeight: 900,
        fontSize: 14,
        color: "rgba(0,0,0,0.8)",
    },

    actions: { display: "flex", gap: 10 },

    greenBtn: {
        height: 32,
        padding: "0 14px",
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "#FFFFFF",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        fontWeight: 700,
        color: "rgba(0,0,0,0.75)",
    },

    redBtn: {
        height: 32,
        padding: "0 14px",
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "#FFFFFF",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        fontWeight: 700,
        color: "rgba(0,0,0,0.75)",
    },

    dotGreen: {
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: "#22C55E",
        display: "inline-block",
    },

    dotRed: {
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: "#EF4444",
        display: "inline-block",
    },

    inner: {
        background: "#FFFFFF",
        padding: 18,
        boxSizing: "border-box",
    },

    roomsRow: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 18,
        alignItems: "stretch",
    },
};
