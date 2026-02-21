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
    <section
      className={[

        "w-full overflow-hidden rounded-2xl",
        "border border-slate-300/60",
        "bg-white/60 backdrop-blur-sm",
        "shadow-[0_18px_36px_rgba(0,0,0,0.14)]",
        "ring-1 ring-black/5",
        "mb-7",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-slate-200/70 border-b border-slate-300/50">
        <div className="inline-flex items-center gap-2">
          <span className="h-9 w-1.5 rounded-full bg-blue-500/80" />
          <div className="text-lg font-extrabold text-slate-800">
            ชั้นที่ {floor}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSelectFloor}
            className={[
              "flex items-center gap-2",
              "h-10 px-4 rounded-xl",
              "bg-white border border-slate-300",
              "shadow-[0_10px_16px_rgba(0,0,0,0.10)]",
              "hover:bg-emerald-50",
              "text-sm font-extrabold text-slate-700",
            ].join(" ")}
          >
            <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(34,197,94,0.16)]" />
            เลือกทั้งชั้น
          </button>

          <button
            type="button"
            onClick={onUnselectFloor}
            className={[
              "flex items-center gap-2",
              "h-10 px-4 rounded-xl",
              "bg-white border border-slate-300",
              "shadow-[0_10px_16px_rgba(0,0,0,0.10)]",
              "hover:bg-rose-50",
              "text-sm font-extrabold text-slate-700",
            ].join(" ")}
          >
            <span className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_0_5px_rgba(239,68,68,0.14)]" />
            ยกเลิกเลือกทั้งชั้น
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="bg-slate-100/70 p-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
    </section>
  );
}
