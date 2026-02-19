
import React, { useMemo, useRef, useState } from "react";


const API = "https://backendlinefacality.onrender.com";

const MAX_FILES = 5;
const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

type Preview = {
  file: File;
  url: string;
  id: string;
};

export default function RepairCreate() {
  const lineUserId = localStorage.getItem("lineUserId") || "";

  // แยก state สำหรับ dropdown กับ "อื่นๆ"
  const [problemTypeSelect, setProblemTypeSelect] = useState("");
  const [problemTypeOther, setProblemTypeOther] = useState("");

  const [description, setDescription] = useState("");
  const [room, setRoom] = useState("");
  const [location, setLocation] = useState("");

  const [previews, setPreviews] = useState<Preview[]>([]);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const problemType = useMemo(() => {
    if (problemTypeSelect === "อื่นๆ") return problemTypeOther.trim();
    return problemTypeSelect.trim();
  }, [problemTypeSelect, problemTypeOther]);

  const canSubmit = useMemo(() => {
    return !!lineUserId && problemType.length > 0 && !loading;
  }, [lineUserId, problemType, loading]);

  const goBack = () => (window.location.href = "/tenant/repairs");
  const goHome = () => (window.location.href = "/tenant/app");

  const clearAll = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
  };

  const pickFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setErr("");
    setOkMsg("");

    const files = Array.from(e.target.files || []);
    e.target.value = "";

    if (files.length === 0) return;

    if (previews.length + files.length > MAX_FILES) {
      setErr(`แนบรูปได้สูงสุด ${MAX_FILES} รูป`);
      return;
    }

    const next: Preview[] = [];
    for (const f of files) {
      if (!f.type.startsWith("image/")) {
        setErr("อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น");
        return;
      }
      if (f.size > MAX_BYTES) {
        setErr(`ไฟล์ใหญ่เกินไป (จำกัด ${MAX_MB}MB ต่อรูป)`);
        return;
      }
      const url = URL.createObjectURL(f);
      next.push({ file: f, url, id: crypto.randomUUID() });
    }

    setPreviews((prev) => [...prev, ...next]);
  };

  const removeOne = (id: string) => {
    setPreviews((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const submit = async () => {
    setErr("");
    setOkMsg("");

    if (!lineUserId) {
      window.location.href = "/owner/line-login";
      return;
    }
    if (!problemType.trim()) {
      setErr("กรุณาเลือก/กรอกประเภทปัญหา");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("lineUserId", lineUserId);
      fd.append("problem_type", problemType);
      fd.append("description", description.trim());
      fd.append("room", room.trim());
      fd.append("location", location.trim());
      previews.forEach((p) => fd.append("images", p.file));

      const r = await fetch(`${API}/repair/create`, {
        method: "POST",
        body: fd,
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || data?.step || "ส่งข้อมูลไม่สำเร็จ");

      setOkMsg("ส่งคำขอแจ้งซ่อมเรียบร้อยแล้ว ✅");
      clearAll();

      setTimeout(() => {
        window.location.href = "/tenant/app";
      }, 1500);
    } catch (e: any) {
      setErr(e?.message || "ระบบขัดข้อง กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F3F7FF] pb-12">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-indigo-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
              <i className="fa-solid fa-wrench" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">แจ้งซ่อม</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Repair Request Form
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={goBack}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition shadow-sm"
            >
              <i className="fa-solid fa-list-check" /> รายการของฉัน
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
        {/* Alerts */}
        {err && (
          <div className="mb-6 rounded-2xl bg-rose-50 border-l-4 border-rose-500 p-4 flex items-center gap-3 text-rose-700 font-bold shadow-sm animate-in slide-in-from-top-4 duration-300">
            <i className="fa-solid fa-circle-exclamation" />
            {err}
          </div>
        )}
        {okMsg && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border-l-4 border-emerald-500 p-4 flex items-center gap-3 text-emerald-700 font-bold shadow-sm animate-in slide-in-from-top-4 duration-300">
            <i className="fa-solid fa-circle-check" />
            {okMsg}
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-200/40 border border-indigo-50 overflow-hidden">
          <div className="p-6 md:p-10">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  รายละเอียดการแจ้งซ่อม
                </h2>
                <p className="text-sm font-semibold text-slate-400 mt-1">
                  กรอกข้อมูลให้ครบถ้วนเพื่อให้เจ้าหน้าที่ดำเนินการได้รวดเร็ว
                </p>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Line User ID
                </span>
                <span className="text-xs font-bold text-slate-600 truncate max-w-[150px]">
                  {lineUserId || "U9849a131c52c0c8de1be6e82fd738232"}
                </span>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Problem Type */}
              <div>
                <label className="block text-sm font-black text-slate-800 mb-2 ml-1">
                  ประเภทปัญหา <span className="text-rose-500">*</span>
                </label>

                <div className="relative">
                  <select
                    value={problemTypeSelect}
                    onChange={(e) => {
                      setProblemTypeSelect(e.target.value);
                      if (e.target.value !== "อื่นๆ") setProblemTypeOther("");
                    }}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition"
                  >
                    <option value="">-- เลือกประเภทปัญหา --</option>
                    <option value="ไฟฟ้า">🔌 ระบบไฟฟ้า / หลอดไฟ</option>
                    <option value="ประปา">🚰 ระบบประปา / ท่อน้ำ</option>
                    <option value="แอร์">❄️ เครื่องปรับอากาศ</option>
                    <option value="เฟอร์นิเจอร์">🛋️ เฟอร์นิเจอร์ / อุปกรณ์ห้อง</option>
                    <option value="อื่นๆ">💡 อื่นๆ (โปรดระบุ)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <i className="fa-solid fa-chevron-down" />
                  </div>
                </div>

                {problemTypeSelect === "อื่นๆ" && (
                  <input
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition animate-in zoom-in-95"
                    placeholder="ระบุประเภทปัญหาของคุณ..."
                    value={problemTypeOther}
                    onChange={(e) => setProblemTypeOther(e.target.value)}
                  />
                )}
              </div>

              {/* Room & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 ml-1">
                    เลขห้อง
                  </label>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition"
                    placeholder="เช่น A888"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 ml-1">
                    จุดที่เกิดปัญหา
                  </label>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition"
                    placeholder="เช่น ระเบียง / ห้องน้ำ"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-black text-slate-800 mb-2 ml-1">
                  รายละเอียดอาการ
                </label>
                <textarea
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-4 min-h-[140px] font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition resize-none"
                  placeholder="อธิบายอาการเสีย / เวลาที่สะดวกให้เข้าตรวจสอบ..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Upload */}
              <div>
                <div className="flex items-end justify-between mb-3 px-1">
                  <div>
                    <label className="block text-sm font-black text-slate-800">แนบรูปประกอบ</label>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      สูงสุด {MAX_FILES} รูป (จำกัด {MAX_MB}MB/รูป)
                    </p>
                  </div>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {previews.length} / {MAX_FILES} รูป
                  </span>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-3xl border-2 border-dashed p-8 text-center cursor-pointer transition-all group ${
                    previews.length > 0
                      ? "border-indigo-200 bg-indigo-50/20"
                      : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={pickFiles}
                    className="hidden"
                  />

                  {previews.length === 0 ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-500 group-hover:scale-110 transition duration-300">
                        <i className="fa-solid fa-camera-retro text-2xl" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800">กดที่นี่เพื่อเพิ่มรูปภาพ</p>
                        <p className="text-xs font-semibold text-slate-500">
                          ช่วยให้ช่างเตรียมอุปกรณ์ได้แม่นยำขึ้น
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {previews.map((p) => (
                        <div
                          key={p.id}
                          className="relative aspect-square rounded-xl overflow-hidden border border-white shadow-sm group/item"
                        >
                          <img src={p.url} className="w-full h-full object-cover" alt="preview" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeOne(p.id);
                            }}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover/item:opacity-100 transition"
                            title="ลบรูป"
                          >
                            <i className="fa-solid fa-trash-can" />
                          </button>
                        </div>
                      ))}

                      {previews.length < MAX_FILES && (
                        <div className="aspect-square rounded-xl border-2 border-dashed border-indigo-200 bg-white flex flex-col items-center justify-center text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition">
                          <i className="fa-solid fa-plus text-xl" />
                          <span className="text-[10px] font-black mt-1">เพิ่มรูป</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {previews.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="mt-3 text-xs font-bold text-rose-500 hover:text-rose-600 transition ml-1"
                  >
                    <i className="fa-solid fa-xmark mr-1" /> ลบรูปทั้งหมด
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 items-stretch">
              <button
                disabled={!canSubmit}
                onClick={submit}
                className={`
                  flex-[2.5] relative overflow-hidden rounded-2xl py-5 transition-all duration-300
                  ${!canSubmit 
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                    : "bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl shadow-slate-300 hover:shadow-indigo-200 hover:-translate-y-0.5 active:scale-[0.97]"
                  }
                `}
              >
                <div className={`flex items-center justify-center gap-3 font-black text-lg transition-all duration-300 ${loading ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}> 
                  <i className="fa-solid fa-paper-plane text-indigo-400"></i>
                  ส่งคำขอแจ้งซ่อม
                </div>

                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center animate-in fade-in zoom-in duration-300">
                    <div className="w-6 h-6 border-[3px] border-indigo-400/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </button>

              <button
                onClick={goBack}
                className="flex-1 bg-white border-2 border-slate-100 py-5 rounded-2xl font-black text-slate-700 hover:bg-slate-50 hover:border-indigo-100 hover:text-indigo-600 transition shadow-sm active:scale-[0.97]"
              >
                ตั๋วของฉัน
              </button>
            </div>
          </div>

          <div className="h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
        </div>
        
        <p className="text-center mt-8 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
          Powered by Dormitory Management System
        </p>
      </main>
    </div>
  );
}
