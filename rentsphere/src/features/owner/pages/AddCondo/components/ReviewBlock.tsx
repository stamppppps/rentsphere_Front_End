import type { Room } from "../types/addCondo.types";

type Props = {
    roomsByFloor: Map<number, Room[]>;
};

export default function ReviewBlock({ roomsByFloor }: Props) {
    const floors = Array.from(roomsByFloor.entries())
        .filter(([, rs]) => rs.length > 0)
        .sort(([a], [b]) => a - b);

    return (
        <div style={styles.list}>
            {floors.map(([floor, floorRooms]) => (
                <section key={floor} style={styles.floorCard}>
                    <div style={styles.floorHeader}>
                        <div style={styles.floorTitle}>ชั้น {floor}</div>

                        <div style={styles.headerBtns}>
                            <button type="button" style={styles.headerBtn}>
                                <span style={styles.dotGreen} /> เลือกทั้งชั้น
                            </button>
                            <button type="button" style={styles.headerBtn}>
                                <span style={styles.dotRed} /> ยกเลิกเลือกทั้งชั้น
                            </button>
                        </div>
                    </div>

                    <div style={styles.roomsGrid}>
                        {floorRooms.map((r) => (
                            <div key={r.id} style={styles.roomCard}>
                                <div style={styles.roomNo}>ห้อง {r.roomNo}</div>
                                <div style={styles.badgeRow}>
                                    <span style={styles.badgeGreen}>ว่าง</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            {floors.length === 0 && (
                <div style={styles.emptyBox}>ยังไม่ได้เลือกห้องสำหรับสรุป</div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    list: { display: "flex", flexDirection: "column", gap: 18 },

    floorCard: {
        width: "100%",
        borderRadius: 12,
        background: "#FFF8E8",
        border: "1px solid rgba(17,24,39,0.10)",
        overflow: "hidden",
        boxShadow: "0 14px 30px rgba(0,0,0,0.10)",
    },

    floorHeader: {
        height: 46,
        background: "#FFF5DE",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 14px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
    },
    floorTitle: { fontWeight: 900, fontSize: 13, color: "rgba(0,0,0,0.75)" },

    headerBtns: { display: "flex", gap: 10 },
    headerBtn: {
        height: 28,
        padding: "0 12px",
        borderRadius: 8,
        border: "1px solid rgba(17,24,39,0.12)",
        background: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
        fontWeight: 700,
        color: "rgba(0,0,0,0.70)",
    },
    dotGreen: { width: 10, height: 10, borderRadius: "50%", background: "#22C55E" },
    dotRed: { width: 10, height: 10, borderRadius: "50%", background: "#EF4444" },

    roomsGrid: {
        background: "#fff",
        padding: 16,
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 16,
    },

    roomCard: {
        borderRadius: 10,
        border: "1px solid rgba(17,24,39,0.18)",
        background: "#fff",
        height: 78,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 10,
        boxShadow: "0 10px 22px rgba(0,0,0,0.10)",
    },
    roomNo: {
        textAlign: "center",
        fontWeight: 900,
        fontSize: 16,
        color: "rgba(0,0,0,0.85)",
        lineHeight: 1.1,
    },
    badgeRow: { display: "flex", justifyContent: "center" },
    badgeGreen: {
        fontSize: 11,
        fontWeight: 900,
        padding: "3px 10px",
        borderRadius: 999,
        background: "rgba(34,197,94,0.20)",
        color: "rgba(22,101,52,0.95)",
        border: "1px solid rgba(34,197,94,0.35)",
    },

    emptyBox: {
        width: "100%",
        borderRadius: 12,
        background: "rgba(255,255,255,0.65)",
        border: "1px dashed rgba(17,24,39,0.18)",
        padding: "16px 18px",
        color: "rgba(0,0,0,0.65)",
        fontWeight: 700,
        textAlign: "center",
    },
};
