const stats = [
  { label: 'ห้องทั้งหมด', value: '128', tone: 'bg-blue-50 text-blue-700 border-blue-100' },
  { label: 'ห้องใช้งาน', value: '114', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { label: 'แจ้งซ่อมค้าง', value: '7', tone: 'bg-amber-50 text-amber-700 border-amber-100' },
  { label: 'บิลค้างชำระ', value: '12', tone: 'bg-rose-50 text-rose-700 border-rose-100' },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold text-purple-600">RentSphere Owner</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">แดชบอร์ดเจ้าของ</h1>
          <p className="mt-2 text-sm text-slate-500">ภาพรวมการจัดการคอนโด ห้องพัก และการจองส่วนกลาง</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className={`inline-flex rounded-xl border px-3 py-1 text-xs font-black ${item.tone}`}>{item.label}</div>
              <div className="mt-4 text-3xl font-black text-slate-900">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-black text-slate-900">กิจกรรมล่าสุด</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-700">
                มีคำขอจองส่วนกลางใหม่ 3 รายการ
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-700">
                ผู้เช่าแจ้งซ่อมใหม่ 1 รายการ
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-700">
                บิลค้างชำระเกินกำหนด 12 รายการ
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">ทางลัด</h2>
            <div className="mt-4 space-y-3">
              <button className="w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white hover:bg-purple-700">
                เพิ่มคอนโด
              </button>
              <button className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">
                จัดการห้อง
              </button>
              <button className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700">
                ดูการจองส่วนกลาง
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
