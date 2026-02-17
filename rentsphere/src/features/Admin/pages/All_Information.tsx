import React, { useState, useCallback, useMemo } from 'react';
import {
  LayoutDashboard,
  Home,
  Wrench,
  Package,
  CalendarDays,
  Gauge,
  FileText,
  CircleDollarSign,
  BarChart3,
  User,
  LogOut,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ChartDataPoint, MenuItem, StatCardProps } from '../types/types';

// ============ Types ============
interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

interface DashboardChartProps {
  title: string;
  data: ChartDataPoint[];
  color: string;
}

// ============ Constants ============
const MENU_ITEMS: MenuItem[] = [
  { id: 'overview', label: 'ข้อมูลภาพรวม', active: true },
  { id: 'rooms', label: 'ห้อง' },
  { id: 'repairs', label: 'แจ้งซ่อม' },
  { id: 'parcels', label: 'แจ้งพัสดุ' },
  { id: 'booking', label: 'จองส่วนกลาง' },
  { id: 'meter', label: 'จดมิเตอร์' },
  { id: 'billing', label: 'ออกบิล' },
  { id: 'payment', label: 'แจ้งชำระเงิน' },
  { id: 'reports', label: 'รายงาน' },
];

const MENU_ICONS: Record<string, React.ReactNode> = {
  overview: <LayoutDashboard size={20} />,
  rooms: <Home size={20} />,
  repairs: <Wrench size={20} />,
  parcels: <Package size={20} />,
  booking: <CalendarDays size={20} />,
  meter: <Gauge size={20} />,
  billing: <FileText size={20} />,
  payment: <CircleDollarSign size={20} />,
  reports: <BarChart3 size={20} />,
};

const CHART_COLORS = {
  revenue: '#8884d8',
  rent: '#82ca9d',
  electricity: '#ffc658',
  water: '#3b82f6',
};

const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

// ============ Components ============

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-r-full mr-2
      ${active
        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
      }`}
    aria-current={active ? 'page' : undefined}
  >
    <span className={active ? 'text-blue-600' : 'text-gray-400'}>{icon}</span>
    {label}
  </button>
);

const StatCard: React.FC<StatCardProps> = ({ label, value, subLabel }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center min-w-[150px] flex-1">
    <div className="text-4xl font-bold text-slate-800 mb-1">{value}</div>
    <div className="text-sm font-medium text-slate-500 mb-1">{label}</div>
    {subLabel && <div className="text-xs text-slate-400">{subLabel}</div>}
  </div>
);

const DashboardChart: React.FC<DashboardChartProps> = ({ title, data, color }) => {
  const gradientId = `gradient-${title.replace(/\s/g, '-')}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
        {title}
      </h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px', color: '#1e293b' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ============ Helper Functions ============

const generateMockData = (): ChartDataPoint[] => {
  return MONTHS.map((month) => ({
    month,
    value: Math.floor(Math.random() * 50000) + 20000,
  }));
};

// ============ Main Component ============

export default function AllInformation(): React.JSX.Element {
  const [activeMenu, setActiveMenu] = useState<string>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Memoize chart data to prevent regeneration on every render
  const chartData = useMemo(() => {
    const baseData = generateMockData();
    return {
      revenue: baseData,
      rent: baseData.map((d) => ({ ...d, value: Math.floor(d.value * 0.7) })),
      electricity: baseData.map((d) => ({ ...d, value: Math.floor(d.value * 0.2) })),
      water: baseData.map((d) => ({ ...d, value: Math.floor(d.value * 0.1) })),
    };
  }, []);

  const toggleSidebar = useCallback((): void => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback((): void => {
    setIsSidebarOpen(false);
  }, []);

  const handleMenuClick = useCallback((menuId: string): void => {
    setActiveMenu(menuId);
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#F5F7FA] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              R
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">RentSphere</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          {MENU_ITEMS.map((item) => (
            <SidebarItem
              key={item.id}
              label={item.label}
              icon={MENU_ICONS[item.id]}
              active={activeMenu === item.id}
              onClick={() => handleMenuClick(item.id)}
            />
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-100">
          <button
            type="button"
            className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg w-full transition-colors"
          >
            <LogOut size={18} />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-blue-600 flex items-center justify-between px-6 shadow-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1 text-white hover:bg-blue-500 rounded-md lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-white font-medium text-lg hidden sm:block">
              คอนโดมิเนียม : <span className="font-bold">สวัสดีคอนโด</span>
            </h1>
            <h1 className="text-white font-medium text-lg sm:hidden">สวัสดีคอนโด</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-white cursor-pointer hover:bg-blue-500 py-1 px-3 rounded-lg transition-colors">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium">Mr. Kittidet Suksarn</div>
                <div className="text-xs text-blue-100">Admin</div>
              </div>
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center border border-white/30 text-white">
                <User size={18} />
              </div>
              <ChevronDown size={16} className="text-blue-100" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header Title */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">ข้อมูลภาพรวม</h2>
              <p className="text-slate-500 text-sm">สรุปสถานะปัจจุบันของโครงการ</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <StatCard label="ห้องว่าง" value={5} subLabel="ห้อง" />
              <StatCard label="ค้างชำระ" value={0} subLabel="ใบแจ้งหนี้ค้างชำระ" />
              <StatCard label="รอการซ่อม" value={0} subLabel="รายการแจ้งซ่อม" />
            </div>

            {/* Charts Section */}
            <div className="space-y-6">
              <DashboardChart
                title="รายการใบแจ้งหนี้ / ใบเสร็จ ย้อนหลัง 12 เดือน (รายรับ)"
                data={chartData.revenue}
                color={CHART_COLORS.revenue}
              />
              <DashboardChart
                title="ค่าเช่า"
                data={chartData.rent}
                color={CHART_COLORS.rent}
              />
              <DashboardChart
                title="ค่าไฟ"
                data={chartData.electricity}
                color={CHART_COLORS.electricity}
              />
              <DashboardChart
                title="ค่าน้ำ"
                data={chartData.water}
                color={CHART_COLORS.water}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}