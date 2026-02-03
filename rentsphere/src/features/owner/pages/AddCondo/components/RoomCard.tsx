import type { Room } from "../types/addCondo_types";

type Props = {
    room: Room;
    selected: boolean;
    onClick: () => void;
};

export default function RoomCard({ room, selected, onClick }: Props) {
    const priceText =
        room.price === null ? "0.00 บาท" : `${room.price.toFixed(2)} บาท`;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`
        w-full min-h-[130px] rounded-2xl border-2 bg-white
        px-6 py-5
        flex flex-col justify-center gap-4
        transition-all duration-200
        focus:outline-none

        ${selected
                    ? `
              border-blue-500
              ring-4 ring-blue-200/70
              shadow-[0_20px_36px_rgba(59,130,246,0.30)]
              scale-[1.02]
            `
                    : `
              border-gray-300
              shadow-[0_14px_26px_rgba(0,0,0,0.10)]
              hover:border-blue-400
              hover:shadow-[0_18px_30px_rgba(0,0,0,0.14)]
              hover:-translate-y-0.5
            `
                }
      `}
        >
            {/* ห้อง */}
            <div className="text-center text-2xl font-extrabold tracking-wide text-gray-900">
                ห้อง {room.roomNo}
            </div>

            {/* ราคา */}
            <div className="flex justify-between items-center px-1 text-base">
                <span className="font-bold text-gray-600">รายเดือน:</span>
                <span className="font-extrabold text-gray-800">
                    {priceText}
                </span>
            </div>
        </button>
    );
}
