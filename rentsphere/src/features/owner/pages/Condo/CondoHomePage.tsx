import { useAddCondoStore } from "@/features/owner/pages/AddCondo/store/addCondo.store";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type CondoItem = {
    id: string;
    name: string;
    roomsTotal: number;
    roomsActive: number;
    unpaidBills: number;
};

export default function CondoHomePage() {
    const nav = useNavigate();

    const { rooms } = useAddCondoStore();

    const roomsTotal = useMemo(() => rooms.length, [rooms]);
    const roomsActive = useMemo(() => rooms.filter((r) => r.isActive).length, [rooms]);

    const condoNameMock = "สวัสดีแมนชั่น";

    const condos: CondoItem[] = useMemo(
        () => [
            {
                id: "c-1",
                name: condoNameMock,
                roomsTotal: roomsTotal || 0,
                roomsActive: roomsActive || 0,
                unpaidBills: 0,
            },
        ],
        [roomsTotal, roomsActive]
    );

    const [tab, setTab] = useState<"condo" | "users">("condo");

    const goDashboard = () => {
        nav("/owner/dashboard");
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#eef5ff] font-sarabun">
            <div className="px-8 py-8">
                <div className="mx-auto w-full max-w-6xl">
                    <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] border border-blue-100/60 overflow-hidden">
                        <div className="px-6 py-4 bg-[#f3f7ff] border-b border-blue-100/60">
                            <div className="text-2xl font-extrabold text-gray-900">คอนโดมิเนียม</div>
                        </div>

                        <div className="px-6 py-6">
                            <div className="flex items-center justify-center">
                                <div className="w-full max-w-3xl">
                                    {/* tabs */}
                                    <div className="flex items-end justify-center gap-14">
                                        <button
                                            type="button"
                                            onClick={() => setTab("condo")}
                                            className="group flex flex-col items-center gap-2"
                                        >
                                            <div
                                                className={[
                                                    "h-12 w-12 rounded-2xl flex items-center justify-center",
                                                    "shadow-[0_10px_20px_rgba(0,0,0,0.12)] border",
                                                    tab === "condo" ? "bg-white border-blue-200" : "bg-white/70 border-gray-200",
                                                ].join(" ")}
                                                title="Icon slot"
                                            >
                                                <span className="text-xs font-extrabold text-gray-500">ICON</span>
                                            </div>

                                            <div className={["text-lg font-extrabold", tab === "condo" ? "text-gray-900" : "text-gray-500"].join(" ")}>
                                                จัดการคอนโดมิเนียม
                                            </div>

                                            <div className={["h-[2px] w-44 rounded-full transition", tab === "condo" ? "bg-gray-400" : "bg-transparent"].join(" ")} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setTab("users")}
                                            className="group flex flex-col items-center gap-2"
                                        >
                                            <div
                                                className={[
                                                    "h-12 w-12 rounded-2xl flex items-center justify-center",
                                                    "shadow-[0_10px_20px_rgba(0,0,0,0.12)] border",
                                                    tab === "users" ? "bg-white border-blue-200" : "bg-white/70 border-gray-200",
                                                ].join(" ")}
                                                title="Icon slot"
                                            >
                                                <span className="text-xs font-extrabold text-gray-500">ICON</span>
                                            </div>

                                            <div className={["text-lg font-extrabold", tab === "users" ? "text-gray-900" : "text-gray-500"].join(" ")}>
                                                จัดการผู้ใช้งาน
                                            </div>

                                            <div className={["h-[2px] w-36 rounded-full transition", tab === "users" ? "bg-gray-400" : "bg-transparent"].join(" ")} />
                                        </button>
                                    </div>

                                    <div className="mt-4 h-px w-full bg-gray-300/70" />

                                    {/* add condo */}
                                    <div className="mt-5 flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => nav("/owner/add-condo/step-3")}
                                            className={[
                                                "h-[46px] px-10 rounded-xl border-0 text-white font-extrabold text-base",
                                                "shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition",
                                                "!bg-[#93C5FD] hover:!bg-[#7fb4fb] active:scale-[0.98] cursor-pointer",
                                                "focus:outline-none focus:ring-2 focus:ring-blue-200",
                                            ].join(" ")}
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                                                    <span className="text-[10px] font-black">+</span>
                                                </span>
                                                เพิ่มคอนโดมิเนียม
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* right link */}
                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    className="text-gray-500 font-bold underline underline-offset-4 hover:text-gray-700"
                                    onClick={() => {
                                        // เผื่อทำ sort page / modal
                                    }}
                                >
                                    จัดเรียงลำดับ
                                </button>
                            </div>

                            {/* content */}
                            <div className="mt-8">
                                {tab === "condo" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {condos.map((c) => {
                                            const hasDebt = c.unpaidBills > 0;

                                            const debtBoxClass = hasDebt
                                                ? "!bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B]"
                                                : "!bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]";

                                            return (
                                                <div
                                                    key={c.id}
                                                    className="rounded-2xl bg-white border border-blue-100/60 shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden"
                                                >
                                                    <div className="px-5 py-3 bg-[#f3f7ff] border-b border-blue-100/60">
                                                        <div className="text-sm font-extrabold text-gray-700">{c.name}</div>
                                                    </div>

                                                    <div className="px-5 py-5">
                                                        <div className="flex items-center gap-4">
                                                            {/* icon placeholder */}
                                                            <div
                                                                className="h-16 w-16 rounded-2xl bg-white border border-gray-200 shadow-[0_10px_20px_rgba(0,0,0,0.12)] flex items-center justify-center"
                                                                title="Condo icon slot"
                                                            >
                                                                <span className="text-xs font-extrabold text-gray-500">ICON</span>
                                                            </div>

                                                            {/* stats + manage button */}
                                                            <div className="flex-1 grid grid-cols-3 gap-3">
                                                                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
                                                                    <div className="text-lg font-extrabold text-gray-900">
                                                                        {c.roomsActive} / {c.roomsTotal}
                                                                    </div>
                                                                    <div className="text-[11px] font-bold text-gray-500">ห้องใช้งาน / ทั้งหมด</div>
                                                                </div>

                                                                <div className={["rounded-xl border px-4 py-3 text-center", debtBoxClass].join(" ")}>
                                                                    <div className="text-lg font-extrabold">{c.unpaidBills}</div>
                                                                    <div className="text-[11px] font-bold opacity-80">บิลค้างชำระ</div>
                                                                </div>

                                                                <div className="flex items-center justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={goDashboard}
                                                                        className={[
                                                                            "h-[40px] px-6 rounded-xl border-0 text-white font-extrabold text-sm",
                                                                            "shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition",
                                                                            "!bg-[#93C5FD] hover:!bg-[#7fb4fb] active:scale-[0.98] cursor-pointer",
                                                                            "focus:outline-none focus:ring-2 focus:ring-blue-200",
                                                                        ].join(" ")}
                                                                    >
                                                                        จัดการ
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl bg-white border border-blue-100/60 shadow-[0_18px_50px_rgba(15,23,42,0.10)] px-8 py-8">
                                        <div className="text-xl font-extrabold text-gray-900">จัดการผู้ใช้งาน</div>
                                        <div className="mt-2 text-base font-bold text-gray-500">(พื้นที่สำหรับหน้าจัดการผู้ใช้งาน — ทำต่อภายหลัง)</div>

                                        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 flex items-center justify-center">
                                            <div className="text-sm font-extrabold text-gray-400">วางไอคอน / ตาราง / รายการผู้ใช้ตรงนี้</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="h-6" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
