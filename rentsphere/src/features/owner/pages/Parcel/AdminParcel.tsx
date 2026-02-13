import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import OwnerShell from "@/features/owner/components/OwnerShell";

const API = "http://localhost:3001";

type Tenant = {
  id: string;
  full_name: string;
  room?: string | null;
  line_user_id: string | null;
};

type ParcelRecord = {
  id: string;
  dormUserId: string;
  tenantName: string;
  room?: string | null;
  note?: string | null;
  imageUrl?: string | null;
  createdAt: string; // ISO
  status?: "sent" | "pending" | "failed" | string;
};

type TabType = "send" | "history";

export default function AdminParcel() {
  const adminSecret = localStorage.getItem("adminSecret") || "";

  const [activeTab, setActiveTab] = useState<TabType>("send");

  // ===== Send tab state =====
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [search, setSearch] = useState("");

  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [loadingTenants, setLoadingTenants] = useState(false);

  // ===== History tab state =====
  const [history, setHistory] = useState<ParcelRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  // ===== Messages =====
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const headers = useMemo(() => ({ "x-admin-secret": adminSecret }), [adminSecret]);

  const resetMessages = () => {
    setErr("");
    setOk("");
  };

  // ===== Load tenants =====
  useEffect(() => {
    const run = async () => {
      if (!adminSecret) {
        window.location.href = "/admin-login";
        return;
      }
      setLoadingTenants(true);
      setErr("");
      try {
        const r = await fetch(`${API}/admin/tenants`, { headers });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "โหลดรายชื่อผู้เช่าไม่สำเร็จ");
        setTenants(data.items || []);
      } catch (e: any) {
        setErr(e?.message || "error");
      } finally {
        setLoadingTenants(false);
      }
    };
    run();
  }, [adminSecret, headers]);

  // ===== Cleanup preview url =====
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const filteredTenants = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tenants;
    return tenants.filter((t) => {
      const name = (t.full_name || "").toLowerCase();
      const room = (t.room || "").toLowerCase();
      return name.includes(q) || room.includes(q);
    });
  }, [tenants, search]);

  // ===== Pick file =====
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

  // ===== Submit send =====
  const submit = async () => {
    resetMessages();

    if (!tenantId) return setErr("กรุณาเลือกผู้เช่า");
    if (!file) return setErr("กรุณาอัปโหลดรูปพัสดุ");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("dormUserId", tenantId);
      fd.append("note", note || "");
      fd.append("image", file);

      const r = await fetch(`${API}/admin/parcel/create`, {
        method: "POST",
        headers,
        body: fd,
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || "ส่งแจ้งพัสดุไม่สำเร็จ");

      setOk("ส่งแจ้งพัสดุพร้อมรูปไป LINE ผู้เช่าแล้ว ✅");
      setNote("");
      setTenantId("");
      setSearch("");

      if (preview) URL.revokeObjectURL(preview);
      setFile(null);
      setPreview("");

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e: any) {
      setErr(e?.message || "error");
    } finally {
      setLoading(false);
    }
  };

  // ===== History fetch =====
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    setErr("");
    try {
      const r = await fetch(`${API}/admin/parcel/history`, { headers });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || "โหลดประวัติไม่สำเร็จ");
      setHistory(Array.isArray(data.items) ? data.items : []);
    } catch (e: any) {
      setErr(e?.message || "error");
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [headers]);

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab, fetchHistory]);

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    const list = [...history].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (!q) return list;
    return list.filter((h) => {
      const hay = `${h.tenantName || ""} ${h.room || ""} ${h.note || ""} ${h.status || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [history, historySearch]);

  return (
    <OwnerShell title="จัดการพัสดุ" activeKey="parcel" showSidebar={true}>
      <div className="rounded-3xl border border-blue-100/60 bg-gradient-to-b from-[#EAF2FF] to-white/60 p-6">
        {/* ===== Top bar (แทน sticky header เดิม) ===== */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-lg">📦</span>
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 leading-tight">
                {activeTab === "send" ? "แจ้งพัสดุมาถึง" : "ประวัติการแจ้งพัสดุ"}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                {activeTab === "send"
                  ? "อัปโหลดรูป + ส่งข้อความไป LINE ของผู้เช่า"
                  : "ดูรายการที่เคยส่งย้อนหลัง"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab buttons */}
            <div className="bg-slate-100 rounded-2xl p-1 flex">
              <button
                onClick={() => {
                  resetMessages();
                  setActiveTab("send");
                }}
                className={`px-4 py-2 rounded-2xl font-black transition ${
                  activeTab === "send"
                    ? "bg-white shadow text-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ส่งแจ้ง
              </button>
              <button
                onClick={() => {
                  resetMessages();
                  setActiveTab("history");
                }}
                className={`px-4 py-2 rounded-2xl font-black transition ${
                  activeTab === "history"
                    ? "bg-white shadow text-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ประวัติ
              </button>
            </div>

            {/* เปลี่ยน path ได้ตาม routing ของนาย */}
            <button
              onClick={() => (window.location.href = "/owner/admin-repairs")}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition"
            >
              กลับหน้า Admin
            </button>
          </div>
        </div>

        {/* ===== Status ===== */}
        {err && (
          <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-rose-700 font-bold">
            {err}
          </div>
        )}
        {ok && (
          <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-700 font-bold">
            {ok}
          </div>
        )}

        {activeTab === "send" ? (
          // ================= SEND UI =================
          <div className="bg-white rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-100/30 overflow-hidden">
            <div className="p-6 md:p-8">
              {/* Tenant section */}
              <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
                <div className="flex-1">
                  <div className="text-sm font-black text-slate-900 mb-2">เลือกผู้เช่า</div>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition"
                    value={tenantId}
                    onChange={(e) => {
                      resetMessages();
                      setTenantId(e.target.value);
                    }}
                    disabled={loadingTenants}
                  >
                    <option value="">{loadingTenants ? "กำลังโหลด..." : "-- เลือกผู้เช่า --"}</option>
                    {filteredTenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name}
                        {t.room ? ` (ห้อง ${t.room})` : ""}
                      </option>
                    ))}
                  </select>

                  <div className="mt-2 text-xs text-slate-500 font-semibold">
                    เลือกจากรายชื่อที่ผูก LINE แล้วเท่านั้น
                  </div>
                </div>

                <div className="md:w-72">
                  <div className="text-sm font-black text-slate-900 mb-2">ค้นหา</div>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ค้นหาชื่อ/เลขห้อง..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition"
                  />
                </div>
              </div>

              {/* Note */}
              <div className="mt-6">
                <div className="text-sm font-black text-slate-900 mb-2">รายละเอียด (ไม่บังคับ)</div>
                <textarea
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 min-h-[110px] font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition"
                  placeholder="เช่น: พัสดุจาก Shopee / วางไว้ที่ชั้น A ช่อง 3"
                  value={note}
                  onChange={(e) => {
                    resetMessages();
                    setNote(e.target.value);
                  }}
                />
              </div>

              {/* Upload */}
              <div className="mt-6">
                <div className="flex items-end justify-between gap-3 mb-2">
                  <div>
                    <div className="text-sm font-black text-slate-900">รูปพัสดุ</div>
                    <div className="text-xs font-semibold text-slate-500">JPG/PNG/WEBP ≤ 5MB</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-black transition"
                  >
                    เลือกรูป
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                  className="hidden"
                />

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded-3xl border-2 border-dashed p-5 md:p-6 cursor-pointer transition ${
                    preview
                      ? "border-indigo-200 bg-indigo-50/30"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  {!preview ? (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                        📷
                      </div>
                      <div>
                        <div className="font-black text-slate-900">ลากรูปมาวาง หรือกดเพื่อเลือกไฟล์</div>
                        <div className="text-xs font-semibold text-slate-500">
                          ระบบจะส่งรูปนี้ไปใน LINE พร้อมข้อความแจ้งพัสดุ
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      <div className="rounded-2xl overflow-hidden bg-white border border-slate-200">
                        <img
                          src={preview}
                          className="w-full object-contain max-h-[320px]"
                          alt="preview"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-2xl bg-white border border-slate-200 p-4">
                          <div className="text-xs font-black text-slate-500 uppercase tracking-widest">
                            ไฟล์ที่เลือก
                          </div>
                          <div className="mt-1 font-black text-slate-900 break-words">{file?.name}</div>
                          <div className="mt-1 text-xs font-semibold text-slate-500">
                            ขนาด: {file ? (file.size / 1024 / 1024).toFixed(2) : "0"} MB
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              resetMessages();
                              if (preview) URL.revokeObjectURL(preview);
                              setPreview("");
                              setFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-black text-slate-800 transition"
                          >
                            ลบรูป
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="flex-1 px-4 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 font-black text-indigo-700 transition"
                          >
                            เปลี่ยนรูป
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="mt-7">
                <button
                  onClick={submit}
                  disabled={loading}
                  className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-black font-black py-3.5 transition disabled:opacity-50 disabled:hover:bg-indigo-600"
                >
                  {loading ? "กำลังส่ง..." : "ส่งแจ้งพัสดุ + ส่ง LINE"}
                </button>

                <div className="mt-3 text-xs text-slate-500 font-semibold">
                  * แอดมินจะส่งข้อความแจ้งเตือนใน LINE ไปยังผู้เช่าที่เลือก พร้อมรูปพัสดุ
                </div>
              </div>
            </div>

            <div className="h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
          </div>
        ) : (
          // ================= HISTORY UI =================
          <div className="bg-white rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-100/30 overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
                <div className="flex-1">
                  <div className="text-sm font-black text-slate-900 mb-2">ค้นหาในประวัติ</div>
                  <input
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="ค้นหาชื่อ/ห้อง/โน้ต/สถานะ..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition"
                  />
                </div>

                <div className="md:w-40">
                  <button
                    onClick={fetchHistory}
                    disabled={loadingHistory}
                    className="w-full px-4 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 font-black text-indigo-700 transition disabled:opacity-50"
                  >
                    {loadingHistory ? "กำลังโหลด..." : "รีเฟรช"}
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {loadingHistory && history.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 font-bold">กำลังโหลดประวัติ...</div>
                ) : filteredHistory.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="text-4xl mb-3">📭</div>
                    <div className="text-slate-700 font-black">ไม่พบประวัติ</div>
                    <div className="text-xs font-semibold text-slate-500 mt-1">
                      ลองเปลี่ยนคำค้น หรือกดรีเฟรช
                    </div>
                  </div>
                ) : (
                  filteredHistory.map((h) => (
                    <div
                      key={h.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                          {h.imageUrl ? (
                            <img src={h.imageUrl} alt="parcel" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-black">
                              N/A
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-black text-slate-900 truncate">
                                {h.tenantName} {h.room ? `(ห้อง ${h.room})` : ""}
                              </div>
                              <div className="text-xs font-semibold text-slate-500 mt-1">
                                {new Date(h.createdAt).toLocaleString("th-TH")}
                              </div>
                            </div>

                            <span className="inline-flex px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs">
                              {h.status || "sent"}
                            </span>
                          </div>

                          <div className="mt-2 text-sm font-semibold text-slate-700">
                            {h.note ? h.note : <span className="text-slate-400">ไม่มีรายละเอียด</span>}
                          </div>

                          {h.imageUrl && (
                            <div className="mt-3">
                              <a
                                href={h.imageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-slate-800 transition text-xs"
                              >
                                เปิดรูป
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
          </div>
        )}
      </div>
    </OwnerShell>
  );
}
