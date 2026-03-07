import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function DormRegister() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [ok, setOk] = useState("");

    const lineUserId = localStorage.getItem("lineUserId") || "";

    useEffect(() => {
        if (!lineUserId) window.location.replace("/owner/line-login");
    }, [lineUserId]);

    const submit = async () => {
        setErr("");
        setOk("");

        const trimmed = code.trim();
        if (!trimmed) return setErr("กรุณากรอกรหัสเข้าพัก");
        if (!lineUserId) return setErr("ไม่พบ LINE User ID (ลอง login ใหม่)");

        setLoading(true);
        try {
            const r = await fetch(`${API}/dorm/link-line`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: trimmed,
                    lineUserId,
                }),
            });

            const data = await r.json();
            if (!r.ok) throw new Error(data?.error || "เชื่อมรหัสไม่สำเร็จ");

            const tenantData = {
                accessCode: trimmed,
                roomId: data.roomId || "",
                roomNo: data.roomNo || "",
                floor: data.floor || "",
                condoId: data.condoId || "",
                condoName: data.condoName || "RentSphere",
                tenantName: data.tenantName || "ผู้เช่า",
                loggedInAt: new Date().toISOString(),
            };
            localStorage.setItem("rentsphere_tenant", JSON.stringify(tenantData));

            setOk("เชื่อมรหัสสำเร็จ ✅ กำลังพาไปหน้าหลัก...");
            setTimeout(() => {
                window.location.replace("/tenant/home");
            }, 700);
        } catch (e: any) {
            const m = e?.message || "error";
            if (m === "invalid_code") setErr("รหัสไม่ถูกต้อง");
            else if (m === "code_already_used") setErr("รหัสนี้ถูกใช้งานแล้ว");
            else if (m === "room_not_found") setErr("ไม่พบห้องที่ผูกกับรหัสนี้");
            else setErr(m);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen bg-[#D2E8FF] flex items-center justify-center p-6">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-blue-100 p-8">
                <div className="text-center mb-6">
                    <div className="text-3xl font-black text-slate-900">RentSphere</div>
                    <div className="text-sm text-gray-500 font-semibold mt-1">
                        ผูกบัญชี LINE กับห้องพักของคุณ
                    </div>
                </div>

                <h2 className="text-xl font-black text-slate-900">กรอกรหัสเข้าพัก</h2>
                <p className="text-sm text-slate-500 mt-1 mb-6">
                    ใส่รหัส 6 หลักที่ได้รับจากเจ้าของคอนโด
                </p>

                <div className="space-y-4">
                    {err && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 font-bold p-3 rounded-2xl text-sm">
                            {err}
                        </div>
                    )}
                    {ok && (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold p-3 rounded-2xl text-sm">
                            {ok}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-extrabold text-gray-800 mb-2">
                            รหัสเข้าพัก (Access Code)
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                                setErr("");
                            }}
                            onKeyDown={(e) => e.key === "Enter" && submit()}
                            placeholder="xxxxxx"
                            className="w-full text-center text-3xl font-black tracking-[0.3em] rounded-2xl border-2 border-blue-200 bg-blue-50/50 px-4 py-4 text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-400 placeholder:text-blue-200 placeholder:tracking-[0.3em]"
                            autoFocus
                        />
                    </div>

                    <button
                        onClick={submit}
                        disabled={loading || code.length < 6}
                        className="w-full py-4 rounded-2xl text-white font-extrabold text-lg shadow-[0_12px_22px_rgba(37,99,235,0.25)] transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                            background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                        }}
                    >
                        {loading ? "กำลังตรวจสอบ..." : "ยืนยันรหัส"}
                    </button>

                    <button
                        onClick={() => {
                            localStorage.removeItem("lineUserId");
                            localStorage.removeItem("rentsphere_tenant");
                            window.location.replace("/owner/line-login");
                        }}
                        className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition"
                    >
                        เปลี่ยนบัญชี LINE
                    </button>

                    <div className="text-center text-xs text-gray-400 font-semibold">
                        LINE: {lineUserId ? lineUserId.slice(0, 10) + "..." : "-"}
                    </div>
                </div>
            </div>
        </div>
    );
}
