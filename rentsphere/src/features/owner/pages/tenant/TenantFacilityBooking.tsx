import React, { useEffect, useMemo, useState } from "react";


const API = "https://backendlinefacality.onrender.com";

type Facility = {
  id: string;
  name: string;
  description?: string | null;
  capacity: number;
  open_time: string;
  close_time: string;
  slot_minutes: number;
  image_url?: string | null;
  location?: string | null;
  type?: string | null;
  active?: boolean;
};

type Booking = {
  id: string;
  facility_id: string;
  start_at: string;
  end_at: string;
  status: string; // booked | active | cancelled | finished
  note?: string | null;
  checked_in_at?: string | null;
  finished_at?: string | null;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function toYmd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function normalizeHHmm(t: string) {
  if (!t) return "00:00";
  return String(t).slice(0, 5);
}
function fmtTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}
function fmtDateTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

async function apiGet(path: string, lineUserId: string) {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${API}${path}${sep}t=${Date.now()}`;

  const r = await fetch(url, {
    headers: { "x-line-user-id": lineUserId, "Cache-Control": "no-cache" },
    cache: "no-store",
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "โหลดข้อมูลไม่สำเร็จ");
  return data;
}
async function apiPost(path: string, body: any, lineUserId: string) {
  const r = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-line-user-id": lineUserId },
    body: JSON.stringify(body ?? {}),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "ทำรายการไม่สำเร็จ");
  return data;
}

function buildSlotsForDay(openHHmm: string, closeHHmm: string, slotMinutes = 60) {
  const [oh, om] = openHHmm.split(":").map((x) => parseInt(x, 10));
  const [ch, cm] = closeHHmm.split(":").map((x) => parseInt(x, 10));

  const start = new Date();
  start.setHours(oh || 0, om || 0, 0, 0);

  const end = new Date();
  end.setHours(ch || 0, cm || 0, 0, 0);

  const out: string[] = [];
  let t = start.getTime();
  const endMs = end.getTime();
  const step = Math.max(15, Number(slotMinutes) || 60) * 60 * 1000;

  while (t + step <= endMs) {
    const d = new Date(t);
    out.push(`${pad2(d.getHours())}:${pad2(d.getMinutes())}`);
    t += step;
  }
  return out;
}

function combineDateTime(ymd: string, hhmm: string) {
  // ✅ force Bangkok timezone
  return new Date(`${ymd}T${hhmm}:00+07:00`).toISOString();
}

export default function TenantFacilityBooking() {
  const lineUserId = localStorage.getItem("lineUserId") || "";

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");

  const [dateYmd, setDateYmd] = useState(() => toYmd(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  const [note, setNote] = useState("");
  const [myBookings, setMyBookings] = useState<Booking[]>([]);

  // availability
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [capacity, setCapacity] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const selectedFacility = useMemo(
    () => facilities.find((f) => f.id === selectedFacilityId) || null,
    [facilities, selectedFacilityId]
  );

  const facilityNameById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const f of facilities) m[f.id] = f.name;
    return m;
  }, [facilities]);

  const slots = useMemo(() => {
    if (!selectedFacility) return [];
    const open = normalizeHHmm(selectedFacility.open_time);
    const close = normalizeHHmm(selectedFacility.close_time);
    const slotMin = Number(selectedFacility.slot_minutes || 60);
    return buildSlotsForDay(open, close, slotMin);
  }, [selectedFacility]);

  const goHome = () => (window.location.href = "/tenant/app");
  const goBack = () => (window.location.href = "/tenant/app");

  const loadFacilities = async () => {
    if (!lineUserId) return;
    const data = await apiGet(`/tenant/facilities`, lineUserId);
    const items = (data.items || []) as Facility[];
    setFacilities(items);
    if (!selectedFacilityId && items[0]?.id) setSelectedFacilityId(items[0].id);
  };

  const loadMyBookings = async () => {
    if (!lineUserId) return;
    const data = await apiGet(`/tenant/facility-bookings/my?date=${encodeURIComponent(dateYmd)}`, lineUserId);
    // ซ่อน cancelled ก็ได้ถ้าไม่อยากโชว์:
    // setMyBookings(((data.items || []) as Booking[]).filter(b => b.status !== "cancelled"));
    setMyBookings((data.items || []) as Booking[]);
  };

  const loadAvailability = async () => {
    if (!lineUserId || !selectedFacilityId) return;
    const data = await apiGet(
      `/tenant/facility-bookings/availability?facility_id=${encodeURIComponent(selectedFacilityId)}&date=${encodeURIComponent(dateYmd)}`,
      lineUserId
    );
    setSlotCounts((data.counts || {}) as Record<string, number>);
    setCapacity(Number(data.capacity || 1));
  };

  // load initial
  useEffect(() => {
    setErr("");
    setOkMsg("");
    if (!lineUserId) return;
    loadFacilities().catch((e: any) => setErr(e?.message || "โหลด facilities ไม่สำเร็จ"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineUserId]);

  // reload when date/facility changes
  useEffect(() => {
    setSelectedSlot("");
    if (!lineUserId || !selectedFacilityId) return;
    loadMyBookings().catch((e: any) => setErr(e?.message || "โหลดการจองไม่สำเร็จ"));
    loadAvailability().catch((e: any) => console.error(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateYmd, selectedFacilityId, lineUserId]);

  const submitBooking = async () => {
    setErr("");
    setOkMsg("");
    if (!lineUserId) {
      window.location.href = "/owner/line-login";
      return;
    }
    if (!selectedFacilityId) return setErr("กรุณาเลือกพื้นที่ส่วนกลาง");
    if (!selectedSlot) return setErr("กรุณาเลือกเวลา");

    // ✅ กัน user เลือก slot ที่ถูกล็อก
    const used = Number(slotCounts[selectedSlot] || 0);
    const locked = used > 0; // EXCLUSIVE: มีคนจองแล้ว = ล็อกเลย
    if (locked) return setErr("ช่วงเวลานี้มีคนจองแล้ว");

    setLoading(true);
    try {
      const start_at = combineDateTime(dateYmd, selectedSlot);

      await apiPost(
        `/tenant/facility-bookings`,
        { facility_id: selectedFacilityId, start_at, note: note.trim() ? note.trim() : null },
        lineUserId
      );

      setOkMsg("จองสำเร็จ ✅ ระบบส่งแจ้งเตือนใน LINE แล้ว");
      setNote("");
      setSelectedSlot("");

      // refresh
      await Promise.all([loadMyBookings(), loadAvailability()]);
    } catch (e: any) {
      setErr(e?.message || "จองไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const checkIn = async (bookingId: string) => {
    setErr("");
    setOkMsg("");
    if (!lineUserId) return;

    setLoading(true);
    try {
      await apiPost(`/tenant/facility-bookings/${bookingId}/check-in`, {}, lineUserId);
      setOkMsg("ยืนยันเข้าใช้งานแล้ว ✅ แจ้งไปใน LINE แล้ว");
      await Promise.all([loadMyBookings(), loadAvailability()]);
    } catch (e: any) {
      setErr(e?.message || "ยืนยันไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    setErr("");
    setOkMsg("");
    if (!lineUserId) return;

    setLoading(true);
    try {
      await apiPost(`/tenant/facility-bookings/${bookingId}/cancel`, {}, lineUserId);
      setOkMsg("ยกเลิกการจองแล้ว ✅");
      await Promise.all([loadMyBookings(), loadAvailability()]);
    } catch (e: any) {
      setErr(e?.message || "ยกเลิกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F3F7FF] pb-12">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-indigo-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
              <i className="fa-solid fa-calendar-check" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">จองส่วนกลาง</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Facility Booking</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={goBack}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition shadow-sm"
            >
              <i className="fa-solid fa-arrow-left" /> กลับ
            </button>
            <button
              onClick={goHome}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
              title="กลับหน้าแรก"
            >
              <i className="fa-solid fa-house" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {err && (
          <div className="mb-6 rounded-2xl bg-rose-50 border-l-4 border-rose-500 p-4 flex items-center gap-3 text-rose-700 font-bold shadow-sm">
            <i className="fa-solid fa-circle-exclamation" />
            {err}
          </div>
        )}
        {okMsg && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border-l-4 border-emerald-500 p-4 flex items-center gap-3 text-emerald-700 font-bold shadow-sm">
            <i className="fa-solid fa-circle-check" />
            {okMsg}
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-200/40 border border-indigo-50 overflow-hidden">
          <div className="p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">เลือกพื้นที่และเวลา</h2>
                <p className="text-sm font-semibold text-slate-400 mt-1">จองครั้งละ 1 ชั่วโมง และรวมไม่เกิน 2 ชั่วโมง/วัน</p>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Line User ID</span>
                <span className="text-xs font-bold text-slate-600 truncate max-w-[150px]">{lineUserId || "-"}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black text-slate-800 mb-2 ml-1">
                  พื้นที่ส่วนกลาง <span className="text-rose-500">*</span>
                </label>

                <div className="relative">
                  <select
                    value={selectedFacilityId}
                    onChange={(e) => {
                      setSelectedFacilityId(e.target.value);
                      setSelectedSlot("");
                    }}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition"
                  >
                    {facilities.length === 0 && <option value="">-- ไม่มีพื้นที่ส่วนกลาง --</option>}
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <i className="fa-solid fa-chevron-down" />
                  </div>
                </div>

                {selectedFacility && (
                  <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <i className="fa-solid fa-location-dot" />
                      </div>
                      <div className="flex-1">
                        <div className="font-black text-slate-900">{selectedFacility.name}</div>
                        <div className="text-sm font-semibold text-slate-500 mt-0.5">
                          เวลาเปิด-ปิด: {normalizeHHmm(selectedFacility.open_time)} - {normalizeHHmm(selectedFacility.close_time)}
                        </div>
                        {selectedFacility.location ? (
                          <div className="text-xs font-bold text-slate-400 mt-1">สถานที่: {selectedFacility.location}</div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 ml-1">
                    วันที่ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dateYmd}
                    onChange={(e) => setDateYmd(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 ml-1">หมายเหตุ (ไม่บังคับ)</label>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="เช่น ขออุปกรณ์เพิ่ม..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-800 mb-2 ml-1">
                  เวลา (จองครั้งละ 1 ชม) <span className="text-rose-500">*</span>
                </label>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {slots.length === 0 ? (
                    <div className="col-span-full text-sm font-bold text-slate-400 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                      ไม่มี slot ให้เลือก
                    </div>
                  ) : (
                    slots.map((t) => {
                      const active = selectedSlot === t;
                      const used = Number(slotCounts[t] || 0);

                      // ✅ EXCLUSIVE: ถ้ามีคนจองแล้ว = ล็อกทันที
                      const locked = used > 0;

                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={locked}
                          onClick={() => !locked && setSelectedSlot(t)}
                          className={[
                            "rounded-2xl px-3 py-4 font-black border transition text-center",
                            locked
                              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                              : active
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
                              : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50",
                          ].join(" ")}
                          title={locked ? "ช่วงเวลานี้มีคนจองแล้ว" : ""}
                        >
                          <div>{t}</div>
                          <div className={`text-[10px] font-extrabold mt-1 ${locked ? "text-rose-500" : "text-slate-400"}`}>
                            {locked ? "มีคนจองแล้ว" : "ว่าง"}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-4 items-stretch">
                <button
                  disabled={!lineUserId || !selectedFacilityId || !selectedSlot || loading}
                  onClick={submitBooking}
                  className={[
                    "flex-[2.5] relative overflow-hidden rounded-2xl py-5 transition-all duration-300",
                    !lineUserId || !selectedFacilityId || !selectedSlot || loading
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl shadow-slate-300 hover:shadow-indigo-200 hover:-translate-y-0.5 active:scale-[0.97]",
                  ].join(" ")}
                >
                  <div className={`flex items-center justify-center gap-3 font-black text-lg ${loading ? "opacity-0" : "opacity-100"}`}>
                    <i className="fa-solid fa-calendar-plus text-indigo-300" />
                    ยืนยันการจอง (1 ชม)
                  </div>
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 border-[3px] border-indigo-400/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => Promise.all([loadMyBookings(), loadAvailability()])}
                  className="flex-1 bg-white border-2 border-slate-100 py-5 rounded-2xl font-black text-slate-700 hover:bg-slate-50 hover:border-indigo-100 hover:text-indigo-600 transition shadow-sm active:scale-[0.97]"
                >
                  รีเฟรชรายการ
                </button>
              </div>
            </div>

            {/* My bookings */}
            <div className="mt-10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-lg font-black text-slate-900">การจองของฉัน (วันเลือก)</div>
                  <div className="text-xs font-bold text-slate-400">{dateYmd}</div>
                </div>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {myBookings.length} รายการ
                </span>
              </div>

              {myBookings.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm font-bold text-slate-500">
                  ยังไม่มีการจองในวันนี้
                </div>
              ) : (
                <div className="space-y-3">
                  {myBookings.map((b) => {
                    const facName = facilityNameById[b.facility_id] || b.facility_id;
                    const canCheckIn = b.status === "booked" && !b.checked_in_at;
                    const canCancel = b.status === "booked" && !b.checked_in_at;

                    return (
                      <div key={b.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-black text-slate-900">{fmtTime(b.start_at)} - {fmtTime(b.end_at)}</div>
                            <div className="text-xs font-bold text-slate-400 mt-1">
                              สถานที่: {facName} • เริ่ม: {fmtDateTime(b.start_at)} • หมด: {fmtDateTime(b.end_at)}
                            </div>
                            <div className="text-xs font-black mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-700">
                              สถานะ: {b.status}
                            </div>
                            {b.note ? <div className="text-sm font-semibold text-slate-600 mt-2">หมายเหตุ: {b.note}</div> : null}
                          </div>

                          <div className="flex flex-col gap-2 items-end">
                            <button
                              disabled={!canCheckIn || loading}
                              onClick={() => checkIn(b.id)}
                              className={[
                                "px-4 py-2 rounded-xl font-black transition border",
                                canCheckIn && !loading
                                  ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                                  : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed",
                              ].join(" ")}
                            >
                              ✅ ยืนยันเข้าใช้งาน
                            </button>

                            <button
                              disabled={!canCancel || loading}
                              onClick={() => cancelBooking(b.id)}
                              className={[
                                "px-4 py-2 rounded-xl font-black transition border",
                                canCancel && !loading
                                  ? "bg-white text-rose-600 border-rose-200 hover:bg-rose-50"
                                  : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed",
                              ].join(" ")}
                            >
                              ❌ ยกเลิกการจอง
                            </button>

                            {b.checked_in_at ? (
                              <div className="text-[11px] font-bold text-emerald-600">checked-in: {fmtDateTime(b.checked_in_at)}</div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
        </div>

        <p className="text-center mt-8 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
          Powered by RentSphere
        </p>
      </main>
    </div>
  );
}
