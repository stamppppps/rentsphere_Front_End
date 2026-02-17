import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddCondoStore } from "../store/addCondo.store";

export default function Step_4() {
  const nav = useNavigate();
  const setFloorConfig = useAddCondoStore((s) => s.setFloorConfig);

  const [floorCount, setFloorCount] = useState<number | "">("");
  const [roomsPerFloorText, setRoomsPerFloorText] = useState<string[]>([]);
  const [roomErrors, setRoomErrors] = useState<Record<number, string>>({});

  const canGoNext = floorCount !== "";
  const hasRoomError = Object.keys(roomErrors).length > 0;

  const totalRooms = useMemo(() => {
    return roomsPerFloorText.reduce((sum, s) => {
      const n = Number(s);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
  }, [roomsPerFloorText]);

  const handleFloorChange = (value: number | "") => {
    setFloorCount(value);

    if (value === "") {
      setRoomsPerFloorText([]);
      setRoomErrors({});
      return;
    }

    setRoomsPerFloorText(Array.from({ length: value }, () => "1"));
    setRoomErrors({});
  };

  const handleRoomTextChange = (index: number, next: string) => {
    if (!/^\d*$/.test(next)) return;

    setRoomsPerFloorText((prev) => prev.map((v, i) => (i === index ? next : v)));

    if (next === "") {
      setRoomErrors((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
      return;
    }

    const value = Number(next);

    if (value > 50) {
      setRoomErrors((prev) => ({ ...prev, [index]: "จำนวนห้องต้องไม่เกิน 50 ห้อง" }));
      return;
    }

    if (value < 1) {
      setRoomErrors((prev) => ({ ...prev, [index]: "จำนวนห้องต้องมากกว่า 0" }));
      return;
    }

    setRoomErrors((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  const normalizeRoomOnBlur = (index: number) => {
    const raw = roomsPerFloorText[index] ?? "";

    if (raw.trim() === "") {
      setRoomsPerFloorText((prev) => prev.map((v, i) => (i === index ? "1" : v)));
      return;
    }

    let n = Number(raw);
    if (!Number.isFinite(n)) n = 1;
    n = Math.max(1, Math.min(50, n));

    setRoomsPerFloorText((prev) => prev.map((v, i) => (i === index ? String(n) : v)));

    setRoomErrors((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  const handleNext = () => {
    if (floorCount === "") return;
    if (hasRoomError) return;

    const normalizedNums = Array.from({ length: floorCount }, (_, i) => {
      const s = roomsPerFloorText[i] ?? "1";
      let n = Number(s);
      if (!Number.isFinite(n)) n = 1;
      return Math.max(1, Math.min(50, n));
    });

    setFloorConfig(floorCount, normalizedNums);
    nav("../step-5");
  };

  return (
    <div className="w-full max-w-[1120px] mx-auto flex flex-col gap-[18px] pb-[110px]">
      <h1 className="text-center text-[34px] font-extrabold text-black/85 tracking-[0.2px] mb-[6px] mt-[6px]">
        ตั้งค่าคอนโดมิเนียม
      </h1>

      <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden">
        <div className="flex items-center gap-3 px-8 py-5 bg-[#f3f7ff] border-b border-blue-100/60">
          <div className="h-9 w-1.5 rounded-full bg-[#5b86ff]" />
          <div>
            <div className="text-xl font-extrabold text-gray-900 tracking-tight">
              จำนวนชั้นและจำนวนห้อง
            </div>
            <div className="mt-1 text-sm font-bold text-gray-600">
              เลือกจำนวนชั้น และกำหนดจำนวนห้องต่อชั้น (สูงสุด 50 ห้อง) — ระบบคำนวณรวมให้อัตโนมัติ
            </div>
          </div>
        </div>

        <div className="px-8 py-7 space-y-6">
          <div className="max-w-xl">
            <label className="block text-sm font-extrabold text-gray-800 mb-2">
              จำนวนชั้น <span className="text-rose-600">*</span>
            </label>

            <select
              value={floorCount}
              onChange={(e) => handleFloorChange(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full h-14 rounded-2xl border border-gray-200 bg-[#fffdf2] px-5 text-xl font-extrabold text-gray-900 shadow-sm
                         focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300"
            >
              <option value="">เลือกจำนวนชั้น</option>
              {Array.from({ length: 100 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          {floorCount !== "" && (
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-3 flex-wrap">
                <div className="text-xl font-extrabold text-gray-900 tracking-tight">
                  จำนวนห้องต่อชั้น{" "}
                  <span className="text-sm font-extrabold text-gray-500">(1 - 50)</span>
                </div>

                <div className="h-[46px] min-w-[260px] px-6 rounded-xl bg-[#161A2D] text-white flex items-center justify-center shadow-[0_12px_22px_rgba(0,0,0,0.18)] font-extrabold text-sm">
                  จำนวนชั้น {floorCount || 0} · รวม {totalRooms} ห้อง
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roomsPerFloorText.map((roomText, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-blue-100/60 shadow-sm px-6 py-5 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-1.5 rounded-full bg-[#5b86ff]" />
                      <div className="text-lg font-extrabold text-gray-900">
                        ชั้นที่ {i + 1}
                      </div>
                    </div>

                    <div className="flex items-end gap-3">
                      <div className="flex flex-col items-center">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={roomText}
                          onFocus={(e) => e.currentTarget.select()}
                          onClick={(e) => e.currentTarget.select()}
                          onChange={(e) => handleRoomTextChange(i, e.target.value)}
                          onBlur={() => normalizeRoomOnBlur(i)}
                          className={[
                            "w-28 h-12 rounded-2xl border text-center text-xl font-extrabold outline-none transition bg-[#fffdf2] shadow-sm",
                            roomErrors[i]
                              ? "border-rose-300 focus:ring-4 focus:ring-rose-100/70"
                              : "border-gray-200 focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300",
                          ].join(" ")}
                        />
                        {roomErrors[i] && (
                          <div className="mt-1 text-xs font-extrabold text-rose-600">
                            {roomErrors[i]}
                          </div>
                        )}
                      </div>

                      <div className="text-base font-extrabold text-gray-700 pb-2">ห้อง</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-[14px] flex-wrap pt-4">
        <button
          type="button"
          onClick={() => nav("../step-3")}
          className="h-[46px] px-6 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
                         focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          ย้อนกลับ
        </button>

        <button
          type="button"
          onClick={() => nav("../step-5")}
          className="h-[46px] w-24 rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition
                         !bg-[#93C5FD] hover:!bg-[#7fb4fb] active:scale-[0.98] cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          ต่อไป
        </button>
      </div>
    </div>
  );
}