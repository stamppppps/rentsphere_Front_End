import React, { useState } from 'react';
import { Settings, Eye, FileText, Clock } from 'lucide-react';

// Logo icon
const LogoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="url(#logoGrad)" />
        <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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
    { id: 'payment', label: 'แจ้งชำระเงิน', active: true },
    { id: 'report', label: 'รายงาน' },
];

// Mock data for payment tracking
const mockPayments = [
    {
        id: 1,
        invoiceNo: 'I2026010002',
        room: '101',
        tenant: 'สุดหล่อ เท่มาก',
        dueDate: 'Sent: 15 ม.ค 09:30',
        amount: 8240.00,
        status: 'ค้างชำระ',
        autoNotify: true,
    },
    {
        id: 2,
        invoiceNo: 'I2026010003',
        room: '102',
        tenant: 'วิวัธร เทพลอ',
        dueDate: '',
        amount: 0.00,
        status: 'ส่งแล้ว',
        autoNotify: false,
    },
    {
        id: 3,
        invoiceNo: 'I2026010004',
        room: '103',
        tenant: 'นลสกนธ์ ศักดิ์',
        dueDate: '',
        amount: 4000.00,
        status: 'ยังไม่ส่ง',
        autoNotify: false,
    },
    {
        id: 4,
        invoiceNo: 'I2026010006',
        room: '202',
        tenant: 'ปวีณา วรรณดี',
        dueDate: 'Sent: 18 ม.ค 06:15',
        amount: 9200.00,
        status: 'ค้างชำระ',
        autoNotify: true,
    },
];

const PaymentNotification: React.FC = () => {
    const [payments, setPayments] = useState(mockPayments);

    const totalAmount = 124500.00;
    const paidAmount = 98240.00;
    const unpaidAmount = 26260.00;
    const paidPercentage = Math.round((paidAmount / totalAmount) * 100);

    const toggleAutoNotify = (id: number) => {
        setPayments(prev => prev.map(p =>
            p.id === id ? { ...p, autoNotify: !p.autoNotify } : p
        ));
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ค้างชำระ':
                return 'bg-pink-100 text-pink-600';
            case 'ส่งแล้ว':
                return 'bg-gray-100 text-gray-500';
            case 'ยังไม่ส่ง':
                return 'bg-yellow-100 text-yellow-600';
            default:
                return 'bg-gray-100 text-gray-500';
        }
    };

    const getAvatarColor = (room: string) => {
        const colors = ['#f472b6', '#a855f7', '#6366f1', '#22c55e'];
        const index = parseInt(room) % colors.length;
        return colors[index];
    };

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
                            className={`text-left px-4 py-3 rounded-xl transition-all font-medium ${item.active
                                    ? 'bg-white/80 text-purple-700 shadow-sm'
                                    : 'text-purple-600 hover:bg-white/40'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1"></div>
                    <div className="text-gray-700 font-medium">
                        Mr. Kittidet Suksarn
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-white/90 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
                    {/* Title Section */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 mb-1">ติดตามการชำระเงิน</h1>
                            <p className="text-sm text-gray-500">ภาพรวมสถานะการค้างชำระของอาคาร A ประจำเดือน มกราคม 2569</p>
                        </div>
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-purple-600 border border-purple-200 hover:bg-purple-50 transition"
                        >
                            <Settings size={16} />
                            ตั้งค่าแจ้งเตือนอัตโนมัติ
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {/* Total Amount */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <FileText size={18} className="text-purple-600" />
                                </div>
                                <span className="text-xs text-gray-500">ยอดรวมทั้งหมด</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            <div className="text-xs text-gray-400 mt-1">จากทั้งหมด 20 ห้อง</div>
                        </div>

                        {/* Paid Amount */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                </div>
                                <span className="text-xs text-gray-500">ชำระเเล้ว</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">{paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            <div className="mt-2">
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{ width: `${paidPercentage}%`, background: 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)' }}
                                    />
                                </div>
                                <div className="text-xs text-green-600 mt-1">{paidPercentage}%</div>
                            </div>
                        </div>

                        {/* Unpaid Amount */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                    <Clock size={18} className="text-red-500" />
                                </div>
                                <span className="text-xs text-gray-500">ยังไม่ชำระ</span>
                            </div>
                            <div className="text-2xl font-bold text-red-500">{unpaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            <div className="text-xs text-gray-400 mt-1">จำนวน 4 ห้องที่ยังค้างชำระ</div>
                            {/* Decorative chart placeholder */}
                            <div className="absolute right-4 bottom-4 opacity-20">
                                <svg width="40" height="40" viewBox="0 0 40 40">
                                    <path d="M20 5 L35 35 L5 35 Z" fill="#f87171" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-xl overflow-hidden border border-purple-200">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-white text-gray-600 text-sm border-b border-gray-100">
                                    <th className="py-3 px-4 font-medium text-center w-12">#</th>
                                    <th className="py-3 px-4 font-medium text-left">เลขใบเรียกเก็บ</th>
                                    <th className="py-3 px-4 font-medium text-left">ห้อง</th>
                                    <th className="py-3 px-4 font-medium text-left">ผู้เช่า</th>
                                    <th className="py-3 px-4 font-medium text-right">ยอดค้าง</th>
                                    <th className="py-3 px-4 font-medium text-center">สถานะ</th>
                                    <th className="py-3 px-4 font-medium text-center">AUTO-NOTIFY</th>
                                    <th className="py-3 px-4 font-medium text-center">การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {payments.map((payment, index) => (
                                    <tr key={payment.id} className="border-b border-gray-50 hover:bg-purple-50/30 transition-colors">
                                        <td className="py-4 px-4 text-center text-gray-500">{index + 1}</td>
                                        <td className="py-4 px-4 text-gray-700">{payment.invoiceNo}</td>
                                        <td className="py-4 px-4">
                                            <span className="font-medium text-gray-800">{payment.room}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                                    style={{ background: getAvatarColor(payment.room) }}
                                                >
                                                    {payment.tenant.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-800">{payment.tenant}</span>
                                                    {payment.dueDate && (
                                                        <span className="text-xs text-green-500">{payment.dueDate}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span className={`font-medium ${payment.amount > 0 ? 'text-pink-600' : 'text-gray-400'}`}>
                                                {payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(payment.status)}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <button
                                                onClick={() => toggleAutoNotify(payment.id)}
                                                className={`w-12 h-6 rounded-full transition-all relative ${payment.autoNotify ? 'bg-blue-500' : 'bg-gray-200'
                                                    }`}
                                            >
                                                <div
                                                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${payment.autoNotify ? 'right-0.5' : 'left-0.5'
                                                        }`}
                                                />
                                            </button>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {payment.status === 'ค้างชำระ' ? (
                                                <button
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                                                    style={{ background: 'linear-gradient(90deg, #f472b6 0%, #c084fc 100%)' }}
                                                >
                                                    แจ้งเตือนทันที
                                                </button>
                                            ) : (
                                                <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-xs text-gray-500">
                            แสดง 1 ถึง 4 จาก 20 รายการ
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
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 text-xs">&gt;</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PaymentNotification;
