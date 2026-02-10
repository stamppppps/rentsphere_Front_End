import React from 'react';
import { FileText, Printer } from 'lucide-react';

// Logo icon
const LogoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="url(#logoGrad2)" />
        <defs>
            <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
        </defs>
        <path d="M10 20 L16 10 L22 20 Z" fill="white" opacity="0.9" />
    </svg>
);

// Sidebar menu items
const menuItems = [
    { id: 'overview', label: 'ข้อมูลภาพรวม' },
    { id: 'rooms', label: 'ห้อง' },
    { id: 'repair', label: 'แจ้งซ่อม' },
    { id: 'parcel', label: 'แจ้งพัสดุ' },
    { id: 'booking', label: 'จองส่วนกลาง' },
    { id: 'meter', label: 'จดมิเตอร์' },
    { id: 'billing', label: 'ออกบิล' },
    { id: 'payment', label: 'แจ้งชำระเงิน' },
    { id: 'report', label: 'รายงาน', active: true, hasSubmenu: true },
];

// Mock data for monthly report
const mockReportData = [
    { room: '101', invoiceNo: 'I2026010001', roomFee: 8000.00, water: 0.00, electric: 0.00, other: 0.00, pending: 8240.00, total: 8240.00 },
    { room: '102', invoiceNo: '-', roomFee: 0.00, water: 0.00, electric: 0.00, other: 0.00, pending: 0.00, total: 0.00 },
    { room: '202', invoiceNo: '-', roomFee: 0.00, water: 0.00, electric: 0.00, other: 0.00, pending: 0.00, total: 0.00, highlight: true },
    { room: '203', invoiceNo: 'I2028010022', roomFee: 7500.00, water: 120.00, electric: 840.00, other: 0.00, pending: 0.00, total: 8460.00 },
    { room: '301', invoiceNo: '-', roomFee: 0.00, water: 0.00, electric: 0.00, other: 0.00, pending: 0.00, total: 0.00 },
    { room: '302', invoiceNo: '-', roomFee: 0.00, water: 0.00, electric: 0.00, other: 0.00, pending: 0.00, total: 0.00 },
];

const Report: React.FC = () => {
    const totalAmount = 142500.00;
    const paidAmount = 125750.00;
    const pendingAmount = 16750.00;
    const totalRooms = 45;

    // Calculate totals for footer row
    const totals = mockReportData.reduce((acc, row) => ({
        roomFee: acc.roomFee + row.roomFee,
        water: acc.water + row.water,
        electric: acc.electric + row.electric,
        other: acc.other + row.other,
        pending: acc.pending + row.pending,
        total: acc.total + row.total,
    }), { roomFee: 0, water: 0, electric: 0, other: 0, pending: 0, total: 0 });

    return (
        <div className="min-h-screen flex font-sans" style={{ background: 'linear-gradient(180deg, #e9d5ff 0%, #ddd6fe 50%, #c4b5fd 100%)' }}>

            {/* Sidebar */}
            <aside className="w-56 flex flex-col py-6 px-4">
                {/* Logo */}
                <div className="flex items-center gap-3 px-2 mb-8">
                    <LogoIcon />
                    <span className="text-xl font-bold text-indigo-600">RentSphere</span>
                </div>

                {/* Condo Title */}
                <div className="px-2 mb-6">
                    <h2 className="text-lg font-bold text-purple-900">คอนโดมิเนียม</h2>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 flex flex-col gap-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-between ${item.active
                                    ? 'bg-white/80 text-purple-700 shadow-sm'
                                    : 'text-purple-600 hover:bg-white/40'
                                }`}
                        >
                            <span>{item.label}</span>
                            {item.hasSubmenu && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            )}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6">
                {/* Header */}
                <div className="flex justify-end items-start mb-6">
                    <div className="text-gray-700 font-medium">
                        Mr. Kittidet Suksarn
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-white/90 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
                    {/* Title Section */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 mb-1">รายงานบิลรายเดือน</h1>
                            <p className="text-sm text-gray-500">สรุปรายละเอียดค่าเช่าและค่าใช้จ่ายประจำเดือน มกราคม 2026</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition">
                                <FileText size={16} />
                                Export PDF
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-green-600 border border-green-200 hover:bg-green-50 transition">
                                <FileText size={16} />
                                Export Excel
                            </button>
                            <button className="p-2 rounded-lg text-white" style={{ background: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)' }}>
                                <Printer size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {/* Total Amount */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className="text-xs text-gray-500 mb-1">ยอดรวมทั้งหมด</div>
                            <div className="text-xl font-bold text-purple-600">฿ {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        </div>

                        {/* Paid Amount */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className="text-xs text-gray-500 mb-1">ชำระแล้ว</div>
                            <div className="text-xl font-bold text-green-600">฿ {paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        </div>

                        {/* Pending Amount */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className="text-xs text-gray-500 mb-1">ค้างชำระ</div>
                            <div className="text-xl font-bold text-pink-600">฿ {pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        </div>

                        {/* Total Rooms */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className="text-xs text-gray-500 mb-1">จำนวนห้อง</div>
                            <div className="text-xl font-bold text-gray-800">{totalRooms} ห้อง</div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-xl overflow-hidden border border-purple-200">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-purple-50 text-purple-800 text-sm">
                                    <th className="py-3 px-4 font-semibold text-left">ห้อง</th>
                                    <th className="py-3 px-4 font-semibold text-left">ใบเรียกเก็บ</th>
                                    <th className="py-3 px-4 font-semibold text-right">ค่าห้อง</th>
                                    <th className="py-3 px-4 font-semibold text-right">ค่าน้ำ</th>
                                    <th className="py-3 px-4 font-semibold text-right">ค่าไฟ</th>
                                    <th className="py-3 px-4 font-semibold text-right">อื่นๆ</th>
                                    <th className="py-3 px-4 font-semibold text-right">ค้างชำระ</th>
                                    <th className="py-3 px-4 font-semibold text-right">รวม</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm bg-white">
                                {mockReportData.map((row, index) => (
                                    <tr
                                        key={row.room}
                                        className={`border-b border-gray-100 ${row.highlight ? 'bg-purple-50/50' : 'hover:bg-purple-50/30'} transition-colors`}
                                    >
                                        <td className="py-3 px-4 font-medium text-gray-800">{row.room}</td>
                                        <td className="py-3 px-4 text-purple-600">{row.invoiceNo}</td>
                                        <td className="py-3 px-4 text-right text-gray-600">{row.roomFee.toFixed(2)}</td>
                                        <td className="py-3 px-4 text-right text-gray-600">{row.water.toFixed(2)}</td>
                                        <td className="py-3 px-4 text-right text-gray-600">{row.electric.toFixed(2)}</td>
                                        <td className="py-3 px-4 text-right text-gray-600">{row.other.toFixed(2)}</td>
                                        <td className="py-3 px-4 text-right text-pink-600">{row.pending.toFixed(2)}</td>
                                        <td className="py-3 px-4 text-right font-medium text-gray-800">{row.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {/* Summary Row */}
                                <tr className="bg-gray-50 font-semibold">
                                    <td className="py-3 px-4 text-gray-800" colSpan={2}>ยอดรวมประจำหน้า:</td>
                                    <td className="py-3 px-4 text-right text-gray-800">{totals.roomFee.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-right text-gray-800">{totals.water.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-right text-gray-800">{totals.electric.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-right text-gray-800">{totals.other.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-right text-pink-600">{totals.pending.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-right text-purple-600">{totals.total.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-xs text-gray-500">
                            กำลังแสดง 1 ถึง 6 จาก 45 รายการ
                        </div>
                        <div className="flex gap-1">
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 text-xs">&lt;</button>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-white text-xs"
                                style={{ background: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)' }}
                            >
                                1
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 text-xs">2</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 text-xs">3</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 text-xs">&gt;</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Report;
