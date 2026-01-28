import React, { useMemo, useState } from "react";

type Props = {
    open: boolean;
    selectedCount: number;
    onClose: () => void;
    onSave: (price: number | null) => void; // null = ไม่กำหนด/กรอกทีหลัง
};

export default function SetRoomPriceModal({
    open,
    selectedCount,
    onClose,
    onSave,
}: Props) {
    const [value, setValue] = useState<string>("");

    const canSave = useMemo(() => {
        if (value.trim() === "") return true; // allow null
        const n = Number(value);
        return Number.isFinite(n) && n >= 0;
    }, [value]);

    if (!open) return null;

    return (
        <div style={styles.backdrop} onMouseDown={onClose}>
            <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
                {/* header */}
                <div style={styles.header}>
                    <div style={styles.title}>ระบุค่าห้อง</div>
                </div>

                {/* body */}
                <div style={styles.body}>
                    <div style={styles.labelRow}>
                        <div style={styles.label}>
                            ราคาค่าเช่ารายเดือน <span style={styles.required}>*จำเป็น</span>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder=""
                            style={styles.input}
                            inputMode="decimal"
                        />
                        <div style={styles.unitBox}>บาท / เดือน</div>
                    </div>

                    <div style={styles.hint}>
                        เลือกไว้ {selectedCount} ห้อง — ปล่อยว่างได้ (กรอกทีหลัง)
                    </div>
                </div>

                {/* footer */}
                <div style={styles.footer}>
                    <button style={styles.closeBtn} onClick={onClose}>
                        ปิด
                    </button>

                    <button
                        style={{
                            ...styles.saveBtn,
                            opacity: canSave ? 1 : 0.45,
                            cursor: canSave ? "pointer" : "not-allowed",
                        }}
                        disabled={!canSave}
                        onClick={() => {
                            const trimmed = value.trim();
                            if (trimmed === "") return onSave(null);
                            onSave(Number(trimmed));
                        }}
                    >
                        บันทึก
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    backdrop: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 24,
    },

    modal: {
        width: 640,
        maxWidth: "100%",
        borderRadius: 10,
        background: "#FFFFFF",
        boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.10)",
    },

    header: {
        padding: "18px 22px 12px 22px",
        borderBottom: "1px solid rgba(0,0,0,0.10)",
        background: "#FFFFFF",
    },
    title: {
        fontWeight: 700,
        fontSize: 18,
        color: "#111827",
    },

    body: {
        padding: "18px 22px 16px 22px",
    },

    labelRow: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
    },
    label: {
        fontSize: 13,
        color: "#111827",
    },
    required: {
        color: "#FF3B30",
        fontWeight: 700,
        marginLeft: 8,
    },

    inputGroup: {
        display: "flex",
        alignItems: "stretch",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid #BDBDBD",
        background: "#FFF7E6",
    },
    input: {
        flex: 1,
        height: 44,
        border: "none",
        outline: "none",
        padding: "0 14px",
        background: "transparent",
        fontSize: 14,
        color: "#111827",
    },
    unitBox: {
        width: 130,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#D9D9D9",
        borderLeft: "1px solid #BDBDBD",
        fontSize: 13,
        color: "#111827",
    },

    hint: {
        marginTop: 10,
        fontSize: 12,
        color: "#6B7280",
    },

    footer: {
        padding: "14px 22px",
        display: "flex",
        justifyContent: "flex-end",
        gap: 16,
        background: "#D9D9D9",
        borderTop: "1px solid rgba(0,0,0,0.10)",
    },

    closeBtn: {
        height: 40,
        minWidth: 90,
        padding: "0 18px",
        borderRadius: 10,
        border: "1px solid #9CA3AF",
        background: "#FFFFFF",
        color: "#111827",
        cursor: "pointer",
        boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
        fontWeight: 600,
    },

    saveBtn: {
        height: 40,
        minWidth: 100,
        padding: "0 18px",
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "linear-gradient(180deg, #B9A4FF 0%, #9B86FF 100%)",
        color: "#fff",
        fontWeight: 700,
        boxShadow: "0 6px 14px rgba(155, 134, 255, 0.35)",
    },
};
