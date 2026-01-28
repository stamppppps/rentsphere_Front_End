import { useState } from "react";
import type { Room } from "../types/addCondo.types";

type Props = {
    room: Room;
    selected: boolean;
    onClick: () => void;
};

export default function RoomCard({ room, selected, onClick }: Props) {
    const [hovered, setHovered] = useState(false);

    const priceText =
        room.price === null ? "ยังไม่กำหนด" : `${room.price.toFixed(2)} บาท`;

    const isEmpty = room.price === null;

    const shadow = selected
        ? "0 14px 30px rgba(242,163,106,0.32)"
        : hovered
            ? "0 14px 30px rgba(0,0,0,0.12)"
            : "0 10px 22px rgba(0,0,0,0.10)";

    const translateY = selected ? "translateY(-2px)" : hovered ? "translateY(-1px)" : "translateY(0)";

    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                ...styles.card,
                borderColor: selected ? "#F2A36A" : "rgba(17,24,39,0.14)",
                background: selected ? "#FDE8DB" : "#FFFFFF",
                boxShadow: shadow,
                transform: translateY,
            }}
        >
            <div style={styles.roomNo}>ห้อง {room.roomNo}</div>

            <div style={styles.divider} />

            <div style={styles.priceRow}>
                <span style={styles.priceLabel}>รายเดือน</span>
                <span style={{ ...styles.priceValue, ...(isEmpty ? styles.priceValueEmpty : {}) }}>
                    {priceText}
                </span>
            </div>
        </button>
    );
}

const styles: Record<string, React.CSSProperties> = {
    card: {
        width: "100%",
        minHeight: 96,
        borderRadius: 12,
        border: "1px solid rgba(17,24,39,0.14)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 10,
        padding: "16px 18px",
        cursor: "pointer",
        outline: "none",
        transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease",
        textAlign: "left",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
    },

    roomNo: {
        fontWeight: 900,
        fontSize: 18,
        textAlign: "center",
        color: "rgba(0,0,0,0.88)",
        lineHeight: 1.2,
        letterSpacing: 0.2,
    },

    divider: {
        height: 1,
        background: "rgba(17,24,39,0.10)",
        margin: "0 2px",
    },

    priceRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 14,
    },

    priceLabel: {
        color: "rgba(0,0,0,0.68)",
        fontWeight: 700,
    },

    priceValue: {
        fontWeight: 800,
        color: "rgba(0,0,0,0.80)",
    },

    priceValueEmpty: {
        color: "rgba(0,0,0,0.55)",
        fontWeight: 700,
    },
};
