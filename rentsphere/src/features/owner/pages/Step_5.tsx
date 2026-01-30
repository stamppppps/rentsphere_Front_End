import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FloorCard from "./AddCondo/components/FloorCard";

/* ================== types ================== */
type Room = {
  id: string;
  number: string;
  isActive: boolean;
};

type Floor = {
  id: string;
  floorNo: number;
  rooms: Room[];
};

/* ================== helpers ================== */
const generateRoomNo = (floorNo: number, index: number) =>
  `${floorNo}${String(index + 1).padStart(2, "0")}`;

/* ================== component ================== */
export default function Step_5() {
  const nav = useNavigate();

  const [floors, setFloors] = useState<Floor[]>([
    {
      id: crypto.randomUUID(),
      floorNo: 1,
      rooms: Array.from({ length: 3 }).map((_, i) => ({
        id: crypto.randomUUID(),
        number: generateRoomNo(1, i),
        isActive: true,
      })),
    },
  ]);

  /* ================== handlers ================== */

  // เพิ่มชั้น
  const handleAddFloor = () => {
    setFloors((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        floorNo: prev.length + 1,
        rooms: [],
      },
    ]);
  };

  // ลบชั้น + รีเลขชั้น / ห้องใหม่
  const handleDeleteFloor = (floorId: string) => {
    setFloors((prev) => {
      if (prev.length === 1) return prev;

      const remainingFloors = prev.filter((f) => f.id !== floorId);

      return remainingFloors.map((floor, floorIndex) => {
        const newFloorNo = floorIndex + 1;

        return {
          ...floor,
          floorNo: newFloorNo,
          rooms: floor.rooms.map((room, roomIndex) => ({
            ...room,
            number: generateRoomNo(newFloorNo, roomIndex),
          })),
        };
      });
    });
  };

  // เพิ่มห้อง
  const handleAddRoom = (floorId: string) => {
    setFloors((prev) =>
      prev.map((f) =>
        f.id === floorId
          ? {
              ...f,
              rooms: [
                ...f.rooms,
                {
                  id: crypto.randomUUID(),
                  number: generateRoomNo(f.floorNo, f.rooms.length),
                  isActive: true,
                },
              ],
            }
          : f
      )
    );
  };

  // เปิด / ปิด ห้อง
  const handleToggleRoom = (floorId: string, roomId: string) => {
    setFloors((prev) =>
      prev.map((f) =>
        f.id === floorId
          ? {
              ...f,
              rooms: f.rooms.map((r) =>
                r.id === roomId
                  ? { ...r, isActive: !r.isActive }
                  : r
              ),
            }
          : f
      )
    );
  };

  // ลบห้อง + รีเลขห้องใหม่
  const handleDeleteRoom = (floorId: string, roomId: string) => {
    setFloors((prev) =>
      prev.map((f) => {
        if (f.id !== floorId) return f;

        const updatedRooms = f.rooms
          .filter((r) => r.id !== roomId)
          .map((r, index) => ({
            ...r,
            number: generateRoomNo(f.floorNo, index),
          }));

        return {
          ...f,
          rooms: updatedRooms,
        };
      })
    );
  };

  // ⭐ แก้เลขห้อง (พิมพ์เอง)
  const handleChangeRoomNumber = (
    floorId: string,
    roomId: string,
    value: string
  ) => {
    setFloors((prev) =>
      prev.map((f) =>
        f.id === floorId
          ? {
              ...f,
              rooms: f.rooms.map((r) =>
                r.id === roomId
                  ? { ...r, number: value }
                  : r
              ),
            }
          : f
      )
    );
  };

  /* ================== render ================== */
  return (
    <div style={{ padding: "28px 40px" }}>
      <h1
        style={{
          textAlign: "center",
          fontSize: 34,
          fontWeight: 800,
          margin: "6px 0 22px",
        }}
      >
        ตั้งค่าคอนโดมิเนียม
      </h1>

      {/* ===== floors ===== */}
      {floors.map((floor) => (
        <div key={floor.id}>
          <FloorCard
            floor={floor}
            onAddRoom={handleAddRoom}
            onToggleRoom={handleToggleRoom}
            onDeleteRoom={handleDeleteRoom}
            onChangeRoomNumber={handleChangeRoomNumber}
          />

          {/* ===== delete floor ===== */}
          <button
            onClick={() => handleDeleteFloor(floor.id)}
            disabled={floors.length === 1}
            style={{
              margin: "12px 0 20px",
              width: "100%",
              height: 40,
              borderRadius: 10,
              background:
                floors.length === 1 ? "#D1D5DB" : "#5E2122",
              color: "#FFFFFF",
              border: "none",
              fontWeight: 700,
              cursor:
                floors.length === 1 ? "not-allowed" : "pointer",
              opacity: floors.length === 1 ? 0.6 : 1,
            }}
          >
            ลบชั้นนี้
          </button>
        </div>
      ))}

      {/* ===== add floor ===== */}
      <button
        onClick={handleAddFloor}
        style={{
          width: "100%",
          height: 44,
          borderRadius: 12,
          background: "#1F1B3A",
          color: "#fff",
          border: "none",
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        เพิ่มชั้น
      </button>

      {/* ===== next ===== */}
      <div style={{ textAlign: "right" }}>
        <button
          onClick={() => nav("../step-6")}
          style={{
            padding: "10px 24px",
            borderRadius: 10,
            background: "#A78BFA",
            color: "#fff",
            border: "none",
            fontWeight: 700,
          }}
        >
          ต่อไป
        </button>
      </div>
    </div>
  );
}
