import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddCondoStore } from "../store/addCondo.store";

export default function Step_4() {
  const nav = useNavigate();
  const setFloorConfig = useAddCondoStore((s) => s.setFloorConfig);

  const [floorCount, setFloorCount] = useState<number | "">("");

  // เก็บเป็น string เพื่อกันปัญหา 05 / append
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

    // default ห้อง/ชั้น = "1"
    setRoomsPerFloorText(Array.from({ length: value }, () => "1"));
    setRoomErrors({});
  };

  // onChange รับ string (อนุญาตพิมพ์ได้ลื่น)
  const handleRoomTextChange = (index: number, next: string) => {
    // เอาเฉพาะตัวเลข
    if (!/^\d*$/.test(next)) return;

    setRoomsPerFloorText((prev) => prev.map((v, i) => (i === index ? next : v)));

    // validate แบบ realtime (ถ้าว่างยังไม่ฟ้อง)
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
      setRoomErrors((prev) => ({
        ...prev,
        [index]: "จำนวนห้องต้องไม่เกิน 50 ห้อง",
      }));
      return;
    }

    if (value < 1) {
      setRoomErrors((prev) => ({
        ...prev,
        [index]: "จำนวนห้องต้องมากกว่า 0",
      }));
      return;
    }

    // ok
    setRoomErrors((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  // onBlur normalize
  const normalizeRoomOnBlur = (index: number) => {
    const raw = roomsPerFloorText[index] ?? "";

    if (raw.trim() === "") {
      setRoomsPerFloorText((prev) => prev.map((v, i) => (i === index ? "1" : v)));
      return;
    }

    let n = Number(raw);
    if (!Number.isFinite(n)) n = 1;
    n = Math.max(1, Math.min(50, n));

    // ตัด 05 -> 5
    const normalizedStr = String(n);

    setRoomsPerFloorText((prev) =>
      prev.map((v, i) => (i === index ? normalizedStr : v))
    );

    // sync error 
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
    <div className="min-h-[calc(100vh-64px)] bg-[#eef5ff] px-8 py-8 font-sarabun">
      <h1 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
        ตั้งค่าคอนโดมิเนียม
      </h1>

      <div className="mx-auto mt-6 w-full max-w-5xl flex flex-col gap-6 pb-28">
        {/* Info Card */}
        <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-3 bg-[#f3f7ff] border-b border-blue-100/60">
            <div className="h-7 w-1.5 rounded-full bg-[#5b86ff]" />
            <div className="text-xl font-extrabold text-gray-900">จำนวนชั้น</div>
          </div>

          <div className="px-7 py-5">
            <ul className="list-disc pl-6 text-base text-gray-700 space-y-2">
              <li>เลือกจำนวนชั้นของอาคาร</li>
              <li>กำหนดจำนวนห้องต่อชั้น (สูงสุด 50 ห้อง)</li>
              <li>รวมจำนวนห้องทั้งหมดจะคำนวณให้อัตโนมัติ</li>
            </ul>
          </div>
        </div>

        {/* Config Card */}
        <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-3 bg-[#f3f7ff] border-b border-blue-100/60">
            <div className="h-7 w-1.5 rounded-full bg-[#5b86ff]" />
            <div className="text-xl font-extrabold text-gray-900">ตั้งค่าชั้นและห้อง</div>
          </div>

          <div className="px-7 py-5 space-y-6">
            <div className="max-w-xl">
              <label className="block text-lg font-extrabold mb-2">
                จำนวนชั้น <span className="text-red-500">*</span>
              </label>

              <select
                value={floorCount}
                onChange={(e) =>
                  handleFloorChange(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-full h-14 rounded-2xl border border-gray-200 bg-[#fffdf2] px-5
                           text-xl font-extrabold text-gray-900 shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="text-xl font-extrabold text-gray-900">
                  จำนวนห้องต่อชั้น <span className="text-gray-500">(1 - 50)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roomsPerFloorText.map((roomText, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-blue-100/70 shadow-sm px-6 py-4 bg-white"
                    >
                      <div className="text-xl font-extrabold text-gray-900">ชั้นที่ {i + 1}</div>

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
                              ? "border-red-400 focus:ring-2 focus:ring-red-300"
                              : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                          ].join(" ")}
                        />

                        {roomErrors[i] && (
                          <div className="mt-1 text-sm font-bold text-red-500">{roomErrors[i]}</div>
                        )}
                      </div>

                      <div className="text-xl font-extrabold text-gray-700">ห้อง</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 w-full">
          <div className="rounded-2xl border border-blue-200/60 bg-white/70 backdrop-blur-md shadow-[0_16px_40px_rgba(15,23,42,0.12)] px-5 py-4">
            <div className="flex items-center justify-end gap-3">
              <div className="h-[44px] min-w-[280px] px-5 rounded-xl bg-[#121827] text-white font-extrabold text-sm flex items-center justify-center shadow-lg">
                จำนวนชั้น {floorCount || 0} · รวม {totalRooms} ห้อง
              </div>

              <button
                type="button"
                disabled={!canGoNext || hasRoomError}
                onClick={handleNext}
                className={[
                  "h-[44px] px-8 rounded-xl text-white font-extrabold text-sm shadow-lg transition",
                  !canGoNext || hasRoomError
                    ? "bg-blue-200 cursor-not-allowed text-white/70"
                    : "!bg-blue-600 hover:!bg-blue-700 active:scale-[0.98] cursor-pointer",
                ].join(" ")}
              >
                ต่อไป
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
