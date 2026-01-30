import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Step_4() {
  const nav = useNavigate();

  const [floorCount, setFloorCount] = useState<number | "">("");
  const canGoNext = floorCount !== "";
  const [roomsPerFloor, setRoomsPerFloor] = useState<number[]>([]);

  const handleFloorChange = (value: number | "") => {
    setFloorCount(value);

    if (value === "") {
      setRoomsPerFloor([]);
      return;
    }

    // สร้าง array ตามจำนวนชั้น
    setRoomsPerFloor(Array.from({ length: value }, () => 1));
  };

  const handleRoomChange = (index: number, value: number) => {
    if (value < 1 || value > 50) return;

    setRoomsPerFloor((prev) =>
      prev.map((v, i) => (i === index ? value : v))
    );
  };

  return (
    <div style={styles.content}>
      <h1 style={styles.title}>ตั้งค่าคอนโดมิเนียม</h1>

      <div style={styles.centerCol}>
        {/* ===== Card: คำอธิบาย ===== */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>จำนวนชั้น</h3>
          <ul style={styles.list}>
            <li>เลือกจำนวนชั้น</li>
            <li>ระบุจำนวนห้องต่อชั้น (เพิ่มสูงสุดได้ไม่เกิน 50 ห้อง/ชั้น)</li>
          </ul>
        </div>

        {/* ===== Card: เลือกจำนวนชั้น ===== */}
        <div style={styles.card}>
          <div style={styles.field}>
            <label>
              จำนวนชั้น <span style={styles.required}>*</span>
            </label>

            <select
              style={styles.input}
              value={floorCount}
              onChange={(e) =>
                handleFloorChange(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            >
              <option value="">เลือกจำนวนชั้น</option>
              {Array.from({ length: 100 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* ===== กล่องกรอกจำนวนห้อง/ชั้น (อยู่ใต้ select) ===== */}
          {floorCount !== "" && (
            <div style={{ marginTop: 16 }}>
              {roomsPerFloor.map((room, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <span style={{ minWidth: 60 }}>ชั้นที่ {i + 1}</span>

                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={room}
                    onChange={(e) =>
                      handleRoomChange(i, Number(e.target.value))
                    }
                    style={{ ...styles.input, width: 90 }}
                  />

                  <span>ห้อง</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== Next Button ===== */}
        <div style={styles.nextRow}>
            <button
                style={{
                    ...styles.nextBtn,
                    opacity: canGoNext ? 1 : 0.5,
                    cursor: canGoNext ? "pointer" : "not-allowed",
                }}
                disabled={!canGoNext}
                onClick={() => nav("../step-5")}
            >
                ต่อไป
            </button>
        </div>
      </div>
    </div>
  );
}

/* ================== styles (ชุดเดียวกับ Step 3) ================== */

const styles: Record<string, React.CSSProperties> = {
  content: {
    flex: 1,
    padding: "28px 40px",
  },

  title: {
    textAlign: "center",
    fontSize: 34,
    fontWeight: 800,
    margin: "6px 0 22px",
    color: "rgba(0,0,0,0.85)",
  },

  centerCol: {
    width: "100%",
    maxWidth: 1120,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 22,
    boxShadow: "0 12px 22px rgba(0,0,0,0.12)",
  },

  cardTitle: {
    marginBottom: 8,
    fontSize: 18,
    fontWeight: 700,
  },

  list: {
    paddingLeft: 18,
    color: "#555",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    maxWidth: 280,
  },

  input: {
    height: 40,
    padding: "0 12px",
    borderRadius: 8,
    border: "1px solid #E5E7EB",
    background: "#FEFCE8",
  },

  required: {
    color: "red",
  },

  nextRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 10,
  },

  nextBtn: {
    height: 46,
    width: 96,
    borderRadius: 12,
    border: "none",
    background: "#A78BFA",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 22px rgba(0,0,0,0.18)",
  },
};
