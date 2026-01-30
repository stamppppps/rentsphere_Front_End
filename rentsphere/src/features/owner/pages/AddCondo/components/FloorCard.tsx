import RoomRow from "./RoomRow";

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

type Props = {
  floor: Floor;
  onAddRoom: (floorId: string) => void;
  onToggleRoom: (floorId: string, roomId: string) => void;
  onDeleteRoom: (floorId: string, roomId: string) => void;
  onChangeRoomNumber: (
    floorId: string,
    roomId: string,
    value: string
  ) => void;
};

/* ================== component ================== */
export default function FloorCard({
  floor,
  onAddRoom,
  onToggleRoom,
  onDeleteRoom,
  onChangeRoomNumber,
}: Props) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 12px 22px rgba(0,0,0,0.12)",
        marginBottom: 8,
      }}
    >
      {/* ===== floor header ===== */}
      <div
        style={{
          backgroundColor: "#FEFCE8",
          padding: 12,
          borderRadius: 12,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>ชั้น</span>
        <input
          type="number"
          readOnly
          value={floor.floorNo}
          style={{
            width: 60,
            height: 32,
            borderRadius: 8,
            border: "1px solid #E5E7EB",
            textAlign: "center",
            background: "#fff",
          }}
        />
      </div>

      {/* ===== rooms ===== */}
      {floor.rooms.length === 0 && (
        <div style={{ color: "#9CA3AF", marginBottom: 8 }}>
          ยังไม่มีห้อง
        </div>
      )}

      {floor.rooms.map((room) => (
        <RoomRow
          key={room.id}
          room={room}
          onToggle={() => onToggleRoom(floor.id, room.id)}
          onDelete={() => onDeleteRoom(floor.id, room.id)}
          onChangeNumber={(value) =>
            onChangeRoomNumber(floor.id, room.id, value)
          }
        />
      ))}

      {/* ===== add room ===== */}
      <button
        onClick={() => onAddRoom(floor.id)}
        style={{
          marginTop: 8,
          padding: "6px 12px",
          borderRadius: 8,
          border: "1px solid #E5E7EB",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        เพิ่มห้อง
      </button>
    </div>
  );
}
