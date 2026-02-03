import OwnerShell from "@/features/owner/components/OwnerShell";
import { useAddCondoStore } from "@/features/owner/pages/AddCondo/store/addCondo.store";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";


function getRoomLabel(room: any) {
    // ลองจับหลายชื่อ field ที่มักเจอ
    return (
        room?.roomNo ??
        room?.roomNumber ??
        room?.number ??
        room?.name ??
        room?.label ??
        room?.code ??
        "-"
    );
}

function StatusPill({ available }: { available: boolean }) {
    return (
        <span
            className={[
                "inline-flex items-center justify-center",
                "min-w-[56px] px-3 py-1 rounded-full text-xs font-extrabold",
                available
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200",
            ].join(" ")}
        >
            {available ? "ว่าง" : "ไม่ว่าง"}
        </span>
    );
}

export default function RoomsPage() {
    const nav = useNavigate();
    const { rooms } = useAddCondoStore();

    // ===== summary from AddCondo store =====
    const roomsTotal = useMemo(() => rooms?.length ?? 0, [rooms]);


    const roomsVacant = useMemo(
        () => (rooms ?? []).filter((r: any) => !!r?.isActive).length,
        [rooms]
    );

    // ค่าอื่น ๆ ยังไม่มีจริง -> mock ไว้ก่อน
    const advanceBooking = 0;
    const unpaidBills = 0;

    // สมมติชื่อคอนโดก่อน
    const condoName = "สวัสดีคอนโด";

    return (
        <OwnerShell
            title="ห้อง"
            activeKey="rooms"
            showSidebar={true}
        >
            {/* ===== breadcrumb/header inside card ===== */}
            <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-bold text-gray-500">
                    คอนโดมิเนียม : <span className="text-gray-800">{condoName}</span>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        // TODO: ไปหน้าสร้างรหัส / modal
                        // nav("/owner/create-login-codes")
                    }}
                    className="text-sm font-extrabold text-gray-600 underline underline-offset-4 hover:text-gray-900"
                >
                    สร้างรหัสเข้าสู่ระบบ
                </button>
            </div>

            {/* ===== summary cards ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white border border-blue-100/70 shadow-sm px-6 py-5 text-center">
                    <div className="text-4xl font-black text-indigo-700">
                        {roomsTotal}
                    </div>
                    <div className="mt-1 text-sm font-bold text-gray-600">
                        ห้องพักทั้งหมด
                    </div>
                </div>

                <div className="rounded-2xl bg-white border border-blue-100/70 shadow-sm px-6 py-5 text-center">
                    <div className="text-4xl font-black text-indigo-700">
                        {roomsVacant}
                    </div>
                    <div className="mt-1 text-sm font-bold text-gray-600">
                        ห้องว่าง
                    </div>
                </div>

                <div className="rounded-2xl bg-white border border-blue-100/70 shadow-sm px-6 py-5 text-center">
                    <div className="text-4xl font-black text-indigo-700">
                        {advanceBooking}
                    </div>
                    <div className="mt-1 text-sm font-bold text-gray-600">
                        จองล่วงหน้า
                    </div>
                </div>

                <div className="rounded-2xl bg-white border border-blue-100/70 shadow-sm px-6 py-5 text-center">
                    <div className="text-4xl font-black text-indigo-700">
                        {unpaidBills}
                    </div>
                    <div className="mt-1 text-sm font-bold text-gray-600">
                        ค้างชำระ
                    </div>
                </div>
            </div>

            {/* ===== table ===== */}
            <div className="mt-6 rounded-2xl border border-blue-100/70 bg-white overflow-hidden">
                {/* table header bar */}
                <div className="px-6 py-4 bg-[#f3f7ff] border-b border-blue-100/70 flex items-center justify-between">
                    <div className="text-lg font-extrabold text-gray-900">
                        รายการห้อง
                    </div>
                    <div className="text-sm font-bold text-gray-500">
                        ทั้งหมด {roomsTotal} ห้อง
                    </div>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="min-w-[980px] w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-700 border-b border-gray-100">
                                <th className="px-6 py-4 font-extrabold">ห้อง</th>
                                <th className="px-6 py-4 font-extrabold">สถานะ</th>
                                <th className="px-6 py-4 font-extrabold">ลูกค้า</th>
                                <th className="px-6 py-4 font-extrabold">ค่าเช่า</th>
                                <th className="px-6 py-4 font-extrabold">แจ้งออก</th>
                                <th className="px-6 py-4 font-extrabold">จองล่วงหน้า</th>
                                <th className="px-6 py-4 font-extrabold">ค้างชำระ</th>
                                <th className="px-6 py-4 font-extrabold text-right">รายละเอียด</th>
                            </tr>
                        </thead>

                        <tbody>
                            {(rooms ?? []).length === 0 ? (
                                <tr>
                                    <td className="px-6 py-10 text-gray-500 font-bold" colSpan={8}>
                                        ยังไม่มีข้อมูลห้องจากขั้นตอนเพิ่มห้อง (Add Condo)
                                    </td>
                                </tr>
                            ) : (
                                (rooms ?? []).map((r: any, idx: number) => {
                                    const roomId = r?.id ?? r?._id ?? String(idx);
                                    const label = getRoomLabel(r);
                                    const available = !!r?.isActive;

                                    // mock fields (ยังไม่เชื่อมจริง)
                                    const tenant = "-";
                                    const rent = "-";
                                    const moveOut = "-";
                                    const booking = "-";
                                    const unpaid = "-";

                                    return (
                                        <tr
                                            key={roomId}
                                            className="border-b border-gray-50 hover:bg-blue-50/30 transition"
                                        >
                                            <td className="px-6 py-4 font-extrabold text-gray-900">
                                                {label}
                                            </td>

                                            <td className="px-6 py-4">
                                                <StatusPill available={available} />
                                            </td>

                                            <td className="px-6 py-4 font-bold text-gray-600">
                                                {tenant}
                                            </td>

                                            <td className="px-6 py-4 font-bold text-gray-600">
                                                {rent}
                                            </td>

                                            <td className="px-6 py-4 font-bold text-gray-600">
                                                {moveOut}
                                            </td>

                                            <td className="px-6 py-4 font-bold text-gray-600">
                                                {booking}
                                            </td>

                                            <td className="px-6 py-4 font-bold text-gray-600">
                                                {unpaid}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // ถ้ามี route รายละเอียดห้องค่อยปลดคอมเมนต์
                                                        // nav(`/owner/rooms/${roomId}`);
                                                    }}
                                                    className="font-extrabold text-gray-700 underline underline-offset-4 hover:text-gray-900"
                                                >
                                                    รายละเอียด
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </OwnerShell>
    );
}
