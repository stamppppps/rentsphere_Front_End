import { useEffect, useState } from "react";
import { api } from "@/shared/api/http";
import { useAuthStore } from "@/features/auth/auth.store";
import { useNavigate } from "react-router-dom";

/* ---------- Types ---------- */
type CondoInfo = {
  id: string;
  name: string;
  status: string;
  roomCount: number;
};

type OwnerInfo = {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  condoCount: number;
  totalRooms: number;
  condos: CondoInfo[];
};

type PlatformStats = {
  summary: {
    totalUsers: number;
    owners: number;
    tenants: number;
    admins: number;
    totalCondos: number;
    totalRooms: number;
    totalActiveContracts: number;
  };
  owners: OwnerInfo[];
};

/* ---------- Stat Card ---------- */
function StatCard({
  label,
  value,
  gradient,
  icon,
}: {
  label: string;
  value: number | string;
  gradient: string;
  icon: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ${gradient}`}
    >
      {/* Glow circle */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-lg" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />

      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-white/80 mb-1">{label}</div>
          <div className="text-4xl font-black tracking-tight">{value}</div>
        </div>
        <div className="text-5xl opacity-30 select-none">{icon}</div>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */
function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

/* ---------- Page ---------- */
export default function PlatformAdminPage() {
  const nav = useNavigate();
  const { user, logout } = useAuthStore();
  const [data, setData] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOwner, setExpandedOwner] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api<PlatformStats>("/admin/platform-stats");
        setData(res);
      } catch (e: any) {
        setError(e?.message ?? "ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = () => {
    logout();
    nav("/auth/owner/login");
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
          </div>
          <div className="text-sm font-bold text-blue-300/70">
            กำลังโหลดข้อมูล...
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md w-full mx-4 text-center space-y-5 border border-slate-700/50">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
          <div className="text-xl font-bold text-white">
            ไม่สามารถโหลดข้อมูลได้
          </div>
          <div className="text-sm text-red-400 font-semibold">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  const s = data.summary;

  /* Search filter */
  const filteredOwners = data.owners.filter((o) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (o.name ?? "").toLowerCase().includes(q) ||
      (o.email ?? "").toLowerCase().includes(q) ||
      (o.phone ?? "").includes(q) ||
      o.condos.some((c) => c.name.toLowerCase().includes(q))
    );
  });

  /* ---------- Main ---------- */
  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0f172a]/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-black text-lg">R</span>
            </div>
            <div>
              <div className="text-lg font-black text-white">
                RentSphere
              </div>
              <div className="text-[11px] font-bold text-blue-400/80 tracking-widest uppercase">
                Platform Admin
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-200">
                {user?.name || user?.email || "Admin"}
              </div>
              <div className="text-[11px] text-slate-500 font-semibold">
                {user?.email}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
              {(user?.name || user?.email || "A")[0].toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Summary Cards */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
            <h2 className="text-xl font-black text-white">ภาพรวมระบบ</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Owner ทั้งหมด"
              value={s.owners}
              gradient="bg-gradient-to-br from-blue-600 to-blue-700"
              icon="👤"
            />
            <StatCard
              label="Tenant ทั้งหมด"
              value={s.tenants}
              gradient="bg-gradient-to-br from-emerald-600 to-teal-700"
              icon="🏠"
            />
            <StatCard
              label="คอนโดทั้งหมด"
              value={s.totalCondos}
              gradient="bg-gradient-to-br from-violet-600 to-purple-700"
              icon="🏢"
            />
            <StatCard
              label="ห้องทั้งหมด"
              value={s.totalRooms}
              gradient="bg-gradient-to-br from-amber-500 to-orange-600"
              icon="🚪"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <StatCard
              label="สัญญาที่ Active"
              value={s.totalActiveContracts}
              gradient="bg-gradient-to-br from-rose-600 to-pink-700"
              icon="📝"
            />
            <StatCard
              label="ผู้ใช้ทั้งหมด"
              value={s.totalUsers}
              gradient="bg-gradient-to-br from-slate-600 to-slate-700"
              icon="👥"
            />
            <StatCard
              label="Admin"
              value={s.admins}
              gradient="bg-gradient-to-br from-indigo-600 to-indigo-700"
              icon="🛡️"
            />
          </div>
        </section>

        {/* Owner Table */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
              <h2 className="text-xl font-black text-white">
                รายชื่อ Owner
                <span className="ml-2 text-sm font-bold text-slate-500">
                  ({filteredOwners.length} คน)
                </span>
              </h2>
            </div>

            {/* Search */}
            <div className="relative max-w-xs w-full">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="ค้นหา Owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-sm font-semibold text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              />
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/40 overflow-hidden shadow-xl">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-800/80 border-b border-slate-700/40 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="col-span-3">ชื่อ / อีเมล</div>
              <div className="col-span-2">เบอร์โทร</div>
              <div className="col-span-2 text-center">คอนโด</div>
              <div className="col-span-2 text-center">ห้อง</div>
              <div className="col-span-2">สมัครเมื่อ</div>
              <div className="col-span-1 text-center">สถานะ</div>
            </div>

            {/* Rows */}
            {filteredOwners.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-3xl mb-3 opacity-30">🔍</div>
                <div className="text-slate-500 font-bold">
                  {searchTerm ? "ไม่พบ Owner ที่ค้นหา" : "ยังไม่มี Owner ในระบบ"}
                </div>
              </div>
            ) : (
              filteredOwners.map((owner, idx) => (
                <div
                  key={owner.id}
                  className={`border-b border-slate-700/30 last:border-b-0 ${
                    idx % 2 === 0 ? "bg-transparent" : "bg-slate-800/20"
                  }`}
                >
                  {/* Main row */}
                  <div
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-blue-500/5 cursor-pointer transition-colors group"
                    onClick={() =>
                      setExpandedOwner(
                        expandedOwner === owner.id ? null : owner.id
                      )
                    }
                  >
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
                        {(owner.name || owner.email || "O")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                          {owner.name || "-"}
                        </div>
                        <div className="text-xs text-slate-500 font-semibold truncate">
                          {owner.email || "-"}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center text-sm font-semibold text-slate-400">
                      {owner.phone || "-"}
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold">
                        🏢 {owner.condoCount}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                        🚪 {owner.totalRooms}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center text-xs font-semibold text-slate-500">
                      {formatDate(owner.createdAt)}
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          owner.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-700/50 text-slate-500 border border-slate-600/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            owner.isActive ? "bg-emerald-400" : "bg-slate-500"
                          }`}
                        />
                        {owner.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Expanded: condo details */}
                  {expandedOwner === owner.id && owner.condos.length > 0 && (
                    <div className="px-6 pb-5">
                      <div className="bg-slate-900/50 rounded-xl p-4 space-y-2 border border-slate-700/30">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                          คอนโดทั้งหมดของ{" "}
                          <span className="text-blue-400">
                            {owner.name || owner.email}
                          </span>
                        </div>
                        {owner.condos.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-700/30 hover:border-blue-500/20 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/15 to-violet-500/15 border border-blue-500/15 flex items-center justify-center text-sm">
                                🏢
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-200">
                                  {c.name}
                                </div>
                                <div className="text-xs text-slate-500 font-semibold">
                                  {c.roomCount} ห้อง
                                </div>
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                c.status === "ACTIVE"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-slate-700/40 text-slate-500 border border-slate-600/30"
                              }`}
                            >
                              {c.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {expandedOwner === owner.id && owner.condos.length === 0 && (
                    <div className="px-6 pb-5">
                      <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30 text-center">
                        <div className="text-slate-500 font-semibold text-sm">
                          ยังไม่มีคอนโด
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 text-center">
        <div className="text-xs font-semibold text-slate-600">
          © 2026 RentSphere — Platform Admin Dashboard
        </div>
      </footer>
    </div>
  );
}
