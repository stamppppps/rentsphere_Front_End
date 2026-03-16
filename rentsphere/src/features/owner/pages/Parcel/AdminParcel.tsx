import React, { useMemo, useRef, useState, useEffect } from "react";
import OwnerShell from "@/features/owner/components/OwnerShell";
import { getSelectedCondoId, useCondoStore } from "@/features/owner/stores/condoStore";



type ParcelRecord = {
  id: string;
  dormUserId?: string;
  tenantName: string;
  trackingNo?: string | null;
  carrier?: string | null;
  room?: string | null;
  note?: string | null;
  imageUrl?: string | null;
  createdAt: string; // ISO
  status?: "sent" | "pending" | "failed" | string;
};

type TabType = "send" | "history";

export default function AdminParcel() {
  const [activeTab, setActiveTab] = useState<TabType>("send");

  // ===== Send tab state =====
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomId, setRoomId] = useState("");
  const [search, setSearch] = useState("");
  const [trackingNo, setTrackingNo] = useState("");
  const [carrier, setCarrier] = useState("");
  const [senderName, setSenderName] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  // ===== History tab state =====
  const [history, setHistory] = useState<ParcelRecord[]>([]);
  const [historySearch, setHistorySearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [pickupConfirmId, setPickupConfirmId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetMessages = () => {
    setErr("");
    setOk("");
  };

  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Helper to get token from zustand auth store
  const getToken = (): string | null => {
    try {
      const raw = localStorage.getItem("rentsphere_auth");
      if (!raw) return null;
      return JSON.parse(raw)?.state?.token ?? null;
    } catch { return null; }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const condoId = getSelectedCondoId();
        if (!condoId) return;
        const token = getToken();
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API}/api/v1/owner/condos/${condoId}/rooms`, { headers });
        if (!res.ok) throw new Error("Failed to load rooms");
        const data = await res.json();

        // Backend returns a raw array of rooms
        const roomList = Array.isArray(data) ? data : (data.rooms || data.items || []);
        setRooms(roomList);
      } catch (e) {
        console.error("Failed to load rooms", e);
      }
    };
    fetchRooms();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    resetMessages();
    try {
      const condoId = getSelectedCondoId();
      if (!condoId) throw new Error("Please select a condo first.");
      const res = await fetch(`${API}/parcel/condo/${condoId}`);
      if (!res.ok) throw new Error("Failed to load history");
      const data = await res.json();
      setHistory(data.items || []);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error loading history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);


  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => {
      const roomNo = (r.roomNo || "").toLowerCase();
      return roomNo.includes(q);
    });
  }, [rooms, search]);

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    const list = [...history].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );
    if (!q) return list;
    return list.filter((h) => {
      const hay = `${h.tenantName || ""} ${h.room || ""} ${h.note || ""} ${h.status || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [history, historySearch]);

  const onPickFile = (f: File | null) => {
    resetMessages();
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");

    if (!f) return;

    const okType = ["image/jpeg", "image/png", "image/webp"].includes(f.type);
    if (!okType) {
      setErr("รองรับเฉพาะ JPG / PNG / WEBP เท่านั้น");
      return;
    }

    const maxMB = 5;
    if (f.size > maxMB * 1024 * 1024) {
      setErr(`ไฟล์ใหญ่เกินไป (เกิน ${maxMB}MB)`);
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0] || null;
    onPickFile(f);
  };

  const submit = async () => {
    resetMessages();
    if (!roomId) return setErr("กรุณาเลือกห้อง/ผู้เช่า");
    setLoading(true);
    try {
      const condoId = getSelectedCondoId();
      if (!condoId) throw new Error("Please select condo");

      // Convert file to base64 if present
      let imageBase64: string | undefined;
      if (file) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      const res = await fetch(`${API}/parcel/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          condoId,
          roomId,
          trackingNo,
          carrier,
          senderName,
          note,
          imageBase64,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "บันทึกไม่สำเร็จ");

      setOk("บันทึกพัสดุสำเร็จ! ระบบแจ้งเตือนผู้เช่าผ่าน LINE แล้ว");
      setRoomId("");
      setTrackingNo("");
      setCarrier("");
      setSenderName("");
      setNote("");
      if (preview) URL.revokeObjectURL(preview);
      setFile(null);
      setPreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to submit parcel");
    } finally {
      setLoading(false);
    }
  };

  const markPickedUp = async (id: string) => {
    setPickupConfirmId(id);
  };

  const confirmPickup = async () => {
    if (!pickupConfirmId) return;
    try {
      const res = await fetch(`${API}/parcel/${pickupConfirmId}/pickup`, { method: "PATCH" });
      if (!res.ok) throw new Error("อัพเดตไม่สำเร็จ");
      loadHistory();
      setOk("อัพเดตสถานะสำเร็จ");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "อัพเดตสถานะไม่สำเร็จ");
    } finally {
      setPickupConfirmId(null);
    }
  };

  const condoName = useCondoStore(s => s.condoName);

  return (
    <OwnerShell title="จัดการพัสดุ" activeKey="parcel" showSidebar={true} condoName={condoName || "คอนโดมิเนียม"}>
      <div className="rounded-3xl border border-blue-100/60 bg-gradient-to-b from-[#EAF2FF] to-white/60 p-6">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-indigo-200 bg-gradient-to-r from-blue-600/90 to-sky-500/90">
              <span className="text-lg">📦</span>
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 leading-tight">
                {activeTab === "send" ? "แจ้งพัสดุมาถึง" : "ประวัติการแจ้งพัสดุ"}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                {activeTab === "send"
                  ? "ส่งพัสดุใหม่ให้ลูกบ้าน"
                  : "ประวัติการรับ-ส่งพัสดุทั้งหมดของตึก"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-100 rounded-2xl p-1 flex">
              <button
                onClick={() => { resetMessages(); setActiveTab("send"); }}
                className={`px-4 py-2 rounded-2xl font-black transition ${activeTab === "send" ? "bg-white shadow text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
              >
                ส่งแจ้ง
              </button>
              <button
                onClick={() => { resetMessages(); setActiveTab("history"); }}
                className={`px-4 py-2 rounded-2xl font-black transition ${activeTab === "history" ? "bg-white shadow text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
              >
                ประวัติ
              </button>
            </div>
          </div>
        </div>

        {err && <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-rose-700 font-bold">{err}</div>}
        {ok && <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-700 font-bold">{ok}</div>}

        {activeTab === "send" ? (
          <div className="bg-white rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-100/30 overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
                <div className="flex-1">
                  <div className="text-sm font-black text-slate-900 mb-2">เลือกห้องผู้รับ</div>
                  <select
                    aria-label="เลือกห้องผู้รับ"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition"
                    value={roomId}
                    onChange={(e) => { resetMessages(); setRoomId(e.target.value); }}
                    disabled={filteredRooms.length === 0}
                  >
                    <option value="">{filteredRooms.length === 0 ? "โหลดข้อมูล..." : "-- เลือกห้อง --"}</option>
                    {filteredRooms.map((r) => {
                      const label = r.tenantName
                        ? r.tenantName
                        : r.occupancyStatus === "OCCUPIED" ? "มีผู้เช่า" : "ว่าง";
                      return (
                        <option key={r.id} value={r.id}>ห้อง {r.roomNo} ({label})</option>
                      )
                    })}
                  </select>
                </div>
                <div className="md:w-72">
                  <div className="text-sm font-black text-slate-900 mb-2">ค้นหาห้อง/ชื่อ</div>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="พิมพ์ที่นี่..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition"
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="text-sm font-black text-slate-900 mb-2">รายละเอียดพัสดุ (ชื่อผู้ส่ง/กล่องสีอะไร)</div>
                <textarea
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 min-h-[90px] font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-100"
                  placeholder="เช่น: พัสดุจาก Shopee / วางไว้ที่ชั้น A ช่อง 3"
                  value={note}
                  onChange={(e) => { resetMessages(); setNote(e.target.value); }}
                />
              </div>

              <div className="mt-6">
                <div className="flex items-end justify-between gap-3 mb-2">
                  <div>
                    <div className="text-sm font-black text-slate-900">รูปพัสดุ (อัปโหลดได้ทีละ 1 รูป/ครั้ง)</div>
                    <div className="text-xs font-semibold text-slate-500">JPG/PNG ≤ 5MB</div>
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-xl bg-indigo-50 text-blue-700 hover:bg-indigo-100 font-black transition">
                    เลือกรูป
                  </button>
                </div>

                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onPickFile(e.target.files?.[0] || null)} className="hidden" aria-label="เลือกรูปพัสดุ" />

                <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} onClick={() => fileInputRef.current?.click()} className={`rounded-3xl border-2 border-dashed p-5 md:p-6 cursor-pointer transition ${preview ? "border-indigo-200 bg-indigo-50/30" : "border-slate-200 bg-slate-50 hover:bg-slate-100"}`}>
                  {!preview ? (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">📷</div>
                      <div>
                        <div className="font-black text-slate-900">ลากรูปมาวาง หรือกดเพื่อเลือกไฟล์ </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      <div className="rounded-2xl overflow-hidden bg-white border border-slate-200">
                        <img src={preview} className="w-full object-contain max-h-[320px]" alt="preview" />
                      </div>
                      <div className="space-y-3">
                        <div className="rounded-2xl bg-white border border-slate-200 p-4">
                          <div className="text-xs font-black text-slate-500 uppercase tracking-widest">ไฟล์ที่เลือก</div>
                          <div className="mt-1 font-black text-slate-900 break-words">{file?.name}</div>
                          <div className="mt-1 text-xs font-semibold text-slate-500">ขนาด: {file ? (file.size / 1024 / 1024).toFixed(2) : "0"} MB</div>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={(e) => { e.stopPropagation(); onPickFile(null); }} className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-black text-slate-800 transition">ลบรูป</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-7">
                <button
                  onClick={submit}
                  disabled={loading}
                  className="w-full rounded-2xl text-white font-black py-3.5 transition disabled:opacity-50 bg-gradient-to-r from-blue-600/90 to-sky-500/90"
                >
                  {loading ? "กำลังบันทึก..." : "ส่งแจ้งพัสดุเข้าสู่ระบบ"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-100/30 overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
                <div className="flex-1">
                  <div className="text-sm font-black text-slate-900 mb-2">ค้นหาในประวัติ</div>
                  <input
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="ค้นหาชื่อ/ห้อง/รายละเอียด..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 transition"
                  />
                </div>
                <div className="md:w-40">
                  <button onClick={loadHistory} className="w-full px-4 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 font-black text-blue-700 transition">
                    รีเฟรช
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {loading && history.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 font-bold">กำลังโหลดประวัติ...</div>
                ) : filteredHistory.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="text-4xl mb-3">📭</div>
                    <div className="text-slate-700 font-black">ไม่พบข้อมูลพัสดุ</div>
                  </div>
                ) : (
                  filteredHistory.map((h) => (
                    <div key={h.id} className="rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md transition">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center text-slate-400 font-black text-2xl">
                          {h.imageUrl ? (
                            <img src={h.imageUrl} alt="parcel" className="w-full h-full object-cover" />
                          ) : "📦"}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-black text-slate-900 truncate">
                                ห้อง {h.room || "-"} ({h.tenantName || "ไม่มีผู้รับ"})
                              </div>
                              <div className="text-xs font-semibold text-slate-500 mt-1">
                                {new Date(h.createdAt).toLocaleString("th-TH")}
                              </div>
                            </div>

                            <span className={`inline-flex px-3 py-1.5 rounded-xl font-black text-xs ${h.status === "PICKED_UP" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                              {h.status === "RECEIVED" ? "รอรับ" : h.status === "PICKED_UP" ? "รับแล้ว" : h.status}
                            </span>
                          </div>

                        
                          <div className="mt-2 text-sm text-slate-600 line-clamp-2">
                            {h.note || "ไม่มีรายละเอียดอื่น"}
                          </div>

                          {h.status !== "PICKED_UP" && (
                            <div className="mt-3">
                              <button
                                onClick={() => markPickedUp(h.id)}
                                className="inline-flex px-4 py-2 rounded-xl font-black text-white transition text-xs bg-gradient-to-r from-blue-600/90 to-sky-500/90"
                              >
                                กดเมื่อลูกบ้านมารับพัสดุ
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Pickup Confirmation Popup */}
      {pickupConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">ยืนยันการรับพัสดุ</h3>
              <p className="text-sm font-medium text-slate-500 mb-6">
                ลูกบ้านได้รับพัสดุชิ้นนี้เรียบร้อยแล้วใช่หรือไม่?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setPickupConfirmId(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmPickup}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all active:scale-95"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </OwnerShell>
  );
}