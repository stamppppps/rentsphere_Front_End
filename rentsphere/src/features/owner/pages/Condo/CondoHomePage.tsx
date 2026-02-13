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

function CondoIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M6 21V5a2 2 0 0 1 2-2h3v18M13 21V9h5a2 2 0 0 1 2 2v10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h.01M9 11h.01M9 15h.01M16 13h.01M16 17h.01" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21v-2a4 4 0 0 0-3-3.87" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

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

    const goDashboard = () => nav("/owner/dashboard");

    return (
        <div className="owner-ui min-h-[calc(100vh-64px)] bg-[#EEF4FF] font-sans text-black/85">
            <div className="px-8 py-8">
                <div className="mx-auto w-full max-w-6xl">
                    <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] border border-blue-100/60 overflow-hidden">
                        <div className="px-6 py-4 bg-[#f3f7ff] border-b border-blue-100/60">
                            <div className="text-2xl font-extrabold tracking-tight text-gray-900">คอนโดมิเนียม</div>
                        </div>

                        <div className="px-6 py-6">
                            <div className="flex items-center justify-center">
                                <div className="w-full max-w-3xl">
                                    <div className="flex items-end justify-center gap-14">
                                        <button
                                            type="button"
                                            onClick={() => setTab("condo")}
                                            className="group flex flex-col items-center gap-2"
                                        >
                                            <div
                                                className={[
                                                    "h-12 w-12 rounded-2xl flex items-center justify-center",
                                                    "shadow-[0_10px_20px_rgba(0,0,0,0.12)] border transition",
                                                    tab === "condo"
                                                        ? "bg-white border-blue-200 text-blue-700"
                                                        : "bg-white/70 border-gray-200 text-gray-500 group-hover:text-gray-700",
                                                ].join(" ")}
                                                aria-hidden
                                            >
                                                <CondoIcon />
                                            </div>

                                            <div
                                                className={[
                                                    "text-lg font-extrabold tracking-[0.2px] transition",
                                                    tab === "condo" ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700",
                                                ].join(" ")}
                                            >
                                                จัดการคอนโดมิเนียม
                                            </div>

                                            <div
                                                className={[
                                                    "h-[2px] rounded-full transition",
                                                    tab === "condo" ? "w-44 bg-[#5b86ff]" : "w-44 bg-transparent",
                                                ].join(" ")}
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setTab("users")}
                                            className="group flex flex-col items-center gap-2"
                                        >
                                            <div
                                                className={[
                                                    "h-12 w-12 rounded-2xl flex items-center justify-center",
                                                    "shadow-[0_10px_20px_rgba(0,0,0,0.12)] border transition",
                                                    tab === "users"
                                                        ? "bg-white border-blue-200 text-blue-700"
                                                        : "bg-white/70 border-gray-200 text-gray-500 group-hover:text-gray-700",
                                                ].join(" ")}
                                                aria-hidden
                                            >
                                                <UsersIcon />
                                            </div>

                                            <div
                                                className={[
                                                    "text-lg font-extrabold tracking-[0.2px] transition",
                                                    tab === "users" ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700",
                                                ].join(" ")}
                                            >
                                                จัดการผู้ใช้งาน
                                            </div>

                                            <div
                                                className={[
                                                    "h-[2px] rounded-full transition",
                                                    tab === "users" ? "w-36 bg-[#5b86ff]" : "w-36 bg-transparent",
                                                ].join(" ")}
                                            />
                                        </button>
                                    </div>

                                    <div className="mt-4 h-px w-full bg-blue-100/80" />

                                    <div className="mt-5 flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => nav("/owner/add-condo/step-0")}
                                            className={[
                                                "h-[46px] px-10 rounded-xl border-0 text-white font-extrabold text-base tracking-[0.2px]",
                                                "shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition",
                                                "!bg-[#93C5FD] hover:!bg-[#7fb4fb] active:scale-[0.98] cursor-pointer",
                                                "focus:outline-none focus:ring-2 focus:ring-blue-200",
                                            ].join(" ")}
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                                                    <span className="text-[12px] font-black leading-none">+</span>
                                                </span>
                                                เพิ่มคอนโดมิเนียม
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    className="text-gray-500 font-bold underline underline-offset-4 hover:text-gray-700"
                                    onClick={() => { }}
                                >
                                    จัดเรียงลำดับ
                                </button>
                            </div>

                            <div className="mt-8">
                                {tab === "condo" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {condos.map((c) => {
                                            const hasDebt = c.unpaidBills > 0;

                                            const debtBoxClass = hasDebt
                                                ? "bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B]"
                                                : "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]";

                                            return (
                                                <div
                                                    key={c.id}
                                                    className="rounded-2xl bg-white border border-blue-100/60 shadow-[0_18px_50px_rgba(15,23,42,0.10)] overflow-hidden"
                                                >
                                                    <div className="px-5 py-3 bg-[#f3f7ff] border-b border-blue-100/60">
                                                        <div className="text-sm font-extrabold tracking-[0.2px] text-gray-800">
                                                            {c.name}
                                                        </div>
                                                    </div>

                                                    <div className="px-5 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-16 w-16 rounded-2xl bg-white border border-blue-100/70 shadow-[0_10px_20px_rgba(0,0,0,0.12)] flex items-center justify-center text-blue-700">
                                                                <CondoIcon />
                                                            </div>

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
                                                                            "h-[40px] px-6 rounded-xl border-0 text-white font-extrabold text-sm tracking-[0.2px]",
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
                                        <div className="text-xl font-extrabold tracking-tight text-gray-900">จัดการผู้ใช้งาน</div>
                                        <div className="mt-2 text-base font-bold text-gray-500">(พื้นที่สำหรับหน้าจัดการผู้ใช้งาน — ทำต่อภายหลัง)</div>

                                        <div className="mt-6 rounded-2xl border border-dashed border-blue-200 bg-[#f3f7ff] px-6 py-10 flex items-center justify-center">
                                            <div className="text-sm font-extrabold text-gray-500">วางไอคอน / ตาราง / รายการผู้ใช้ตรงนี้</div>
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