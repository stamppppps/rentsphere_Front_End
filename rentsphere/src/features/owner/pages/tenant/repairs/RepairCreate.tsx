import React, { useMemo, useState } from "react";

const API = "http://localhost:3001";

const MAX_FILES = 5;
const MAX_MB = 5; // จำกัดขนาดไฟล์ต่อรูป
const MAX_BYTES = MAX_MB * 1024 * 1024;

type Preview = {
  file: File;
  url: string;
  id: string;
};

export default function RepairCreate() {
  const lineUserId = localStorage.getItem("lineUserId") || "";

  const [problemType, setProblemType] = useState("");
  const [description, setDescription] = useState("");
  const [room, setRoom] = useState("");
  const [location, setLocation] = useState("");

  const [previews, setPreviews] = useState<Preview[]>([]);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return !!lineUserId && problemType.trim().length > 0 && !loading;
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
    e.target.value = ""; // ให้เลือกไฟล์เดิมซ้ำได้

    if (files.length === 0) return;

    // รวมจำนวนเดิม + ใหม่
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
      window.location.href = "/login";
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
      fd.append("problem_type", problemType.trim());
      fd.append("description", description.trim());
      fd.append("room", room.trim());
      fd.append("location", location.trim());

      // สำคัญ: field ต้องชื่อ "images" ให้ตรงกับ multer upload.array("images", 5)
      previews.forEach((p) => fd.append("images", p.file));

      const r = await fetch(`${API}/repair/create`, {
        method: "POST",
        body: fd,
      });
      const data = await r.json();
      if (!r.ok) {
        throw new Error(data?.error || data?.step || "create failed");
      }

      setOkMsg("ส่งคำขอแจ้งซ่อมเรียบร้อยแล้ว ✅");
      clearAll();

      // ไปหน้ารายการของฉัน
      setTimeout(() => {
        window.location.href = "/tenant/app";
      }, 800);
    } catch (e: any) {
      setErr(e?.message || "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#E9E6FF] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-4xl font-black tracking-tight">แจ้งซ่อม</div>
            <div className="text-sm text-gray-600 mt-1">สร้าง ticket ใหม่ พร้อมแนบรูปประกอบ</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={goBack}
              className="bg-white px-4 py-2 rounded-2xl font-bold shadow hover:opacity-90"
            >
              รายการของฉัน
            </button>
            <button
              onClick={goHome}
              className="bg-white px-4 py-2 rounded-2xl font-bold shadow hover:opacity-90"
            >
              หน้าหลัก
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[28px] shadow-xl p-6 md:p-8">
          {/* Top info */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="text-lg font-black">ฟอร์มแจ้งซ่อม</div>
              <div className="text-xs text-gray-500">
                แนบรูปได้สูงสุด {MAX_FILES} รูป (ไม่เกิน {MAX_MB}MB/รูป)
              </div>
            </div>

            <div className="text-xs bg-gray-100 px-3 py-2 rounded-2xl break-all">
              LINE: {lineUserId || "-"}
            </div>
          </div>

          {/* Form grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* problem type */}
            <div className="md:col-span-2">
              <label className="text-sm font-bold">ประเภทปัญหา *</label>
              <select
                value={problemType}
                onChange={(e) => setProblemType(e.target.value)}
                className="mt-2 w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="">-- เลือกประเภท --</option>
                <option value="ไฟฟ้า">ไฟฟ้า</option>
                <option value="ประปา">ประปา</option>
                <option value="แอร์">แอร์</option>
                <option value="เฟอร์นิเจอร์">เฟอร์นิเจอร์</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>

              {/* ถ้าเลือก อื่นๆ ให้พิมพ์เอง */}
              {problemType === "อื่นๆ" && (
                <input
                  className="mt-3 w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="ระบุประเภทปัญหา"
                  value={problemType === "อื่นๆ" ? "" : problemType}
                  onChange={(e) => setProblemType(e.target.value)}
                />
              )}
            </div>

            {/* room */}
            <div>
              <label className="text-sm font-bold">ห้อง</label>
              <input
                className="mt-2 w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                placeholder="เช่น A888"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>

            {/* location */}
            <div>
              <label className="text-sm font-bold">จุดที่เกิดปัญหา</label>
              <input
                className="mt-2 w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                placeholder="เช่น ระเบียง / ห้องน้ำ / ครัว"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* description */}
            <div className="md:col-span-2">
              <label className="text-sm font-bold">รายละเอียด</label>
              <textarea
                className="mt-2 w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 min-h-[120px]"
                placeholder="อธิบายอาการ / เวลาที่เกิด / สิ่งที่ลองแก้แล้ว"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* upload */}
            <div className="md:col-span-2">
              <label className="text-sm font-bold">แนบรูป (สูงสุด {MAX_FILES} รูป)</label>

              <div className="mt-2 flex flex-col md:flex-row md:items-center gap-3">
                <label className="inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-black text-white font-bold cursor-pointer hover:opacity-90">
                  เลือกรูป
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={pickFiles}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={clearAll}
                  disabled={previews.length === 0}
                  className="px-4 py-3 rounded-2xl bg-gray-100 font-bold disabled:opacity-40"
                >
                  ลบรูปทั้งหมด
                </button>

                <div className="text-xs text-gray-500">
                  {previews.length}/{MAX_FILES} รูป
                </div>
              </div>

              {/* preview grid */}
              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                  {previews.map((p) => (
                    <div key={p.id} className="relative group">
                      <img
                        src={p.url}
                        alt="preview"
                        className="w-full h-28 object-cover rounded-2xl border"
                      />
                      <button
                        type="button"
                        onClick={() => removeOne(p.id)}
                        className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-xl opacity-0 group-hover:opacity-100"
                      >
                        ลบ
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          {err && <div className="mt-5 text-sm text-red-600 font-bold">{err}</div>}
          {okMsg && <div className="mt-5 text-sm text-green-700 font-bold">{okMsg}</div>}

          {/* Actions */}
          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <button
              disabled={!canSubmit}
              onClick={submit}
              className="flex-1 bg-black text-black font-black py-4 rounded-2xl shadow disabled:"
            >
              {loading ? "กำลังส่ง..." : "ส่งคำขอแจ้งซ่อม"}
            </button>

            <button
              onClick={() => (window.location.href = "/tenant/repairs")}
              className="md:w-56 bg-white font-black py-4 rounded-2xl shadow hover:opacity-90"
            >
              ดู Ticket ของฉัน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
