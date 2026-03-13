import {
  History,
  LayoutGrid,
  List,
  Plus,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import OwnerShell from "@/features/owner/components/OwnerShell";
import { useCondoStore } from "@/features/owner/stores/condoStore";
import EmptyState from "../components/EmptyState";
import FacilityCard from "../components/FacilityCard";
import { useFacilities } from "../hooks/useFacilities";
import CreateFacilityModal from "../modals/CreateFacilityModal";
import {
  getBookingPolicy,
  updateBookingPolicy,
} from "../services/bookingPolicy.service";

const STEP_CONDO_ID_KEY = "add_condo_condoId";

type NavState = {
  condoId?: string;
};

const FacilityListPage: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const st = (location.state as NavState | null) ?? null;
  const condoName = useCondoStore((s) => s.condoName);

  const condoId = useMemo(() => {
    const fromQuery = searchParams.get("condoId");
    const fromState = st?.condoId;
    const fromStorage = localStorage.getItem(STEP_CONDO_ID_KEY);
    return String(fromQuery ?? fromState ?? fromStorage ?? "").trim();
  }, [searchParams, st?.condoId]);

  const { facilities, loading, error, refresh } = useFacilities(condoId);

  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [bookingPolicy, setBookingPolicy] = useState({
    maxBookingsPerDay: 2,
  });
  const [policyInput, setPolicyInput] = useState("2");

  const [isLoadingPolicy, setIsLoadingPolicy] = useState(false);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  useEffect(() => {
    const loadPolicy = async () => {
      if (!condoId) return;

      try {
        setIsLoadingPolicy(true);
        const policy = await getBookingPolicy(condoId);
        const value = policy?.maxBookingsPerDay ?? 2;

        setBookingPolicy({
          maxBookingsPerDay: value,
        });
        setPolicyInput(String(value));
      } catch (err) {
        console.error("LOAD BOOKING POLICY ERROR:", err);
      } finally {
        setIsLoadingPolicy(false);
      }
    };

    loadPolicy();
  }, [condoId]);

  const filteredFacilities = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return facilities.filter((f) => {
      if (!keyword) return true;

      const name = String(f.name ?? f.facilityName ?? "").toLowerCase();
      const description = String(f.description ?? "").toLowerCase();

      return name.includes(keyword) || description.includes(keyword);
    });
  }, [facilities, search]);

  const historyHref = condoId
    ? `/owner/common-area-booking/history?condoId=${encodeURIComponent(condoId)}`
    : "/owner/common-area-booking/history";

  const handleSavePolicy = async () => {
    if (!condoId) return;

    const parsed = Number(policyInput);

    if (!policyInput.trim() || !Number.isFinite(parsed) || parsed < 1) {
      alert("กรุณากรอกสิทธิ์ต่อห้อง / วัน เป็นตัวเลขตั้งแต่ 1 ขึ้นไป");
      return;
    }

    const safeValue = Math.floor(parsed);

    try {
      setIsSavingPolicy(true);

      await updateBookingPolicy(condoId, {
        maxBookingsPerDay: safeValue,
      });

      setBookingPolicy({
        maxBookingsPerDay: safeValue,
      });
      setPolicyInput(String(safeValue));

      alert("บันทึกกติกาการจองเรียบร้อย");
      setIsPolicyOpen(false);
    } catch (err: unknown) {
      console.error("SAVE BOOKING POLICY ERROR:", err);
      alert((err instanceof Error ? err.message : null) ?? "บันทึกไม่สำเร็จ");
    } finally {
      setIsSavingPolicy(false);
    }
  };

  return (
    <OwnerShell
      activeKey="common-area-booking"
      showSidebar
      condoName={condoName || "คอนโดมิเนียม"}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              พื้นที่ส่วนกลาง
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              จัดการรายการพื้นที่และการเข้าใช้งานของลูกบ้าน
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={historyHref}
              state={condoId ? { condoId } : undefined}
              className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <History size={18} />
              ประวัติการจอง
            </Link>

            <button
              type="button"
              onClick={() => setIsPolicyOpen((prev) => !prev)}
              disabled={!condoId}
              className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPolicyOpen ? <X size={18} /> : <Settings2 size={18} />}
              {isPolicyOpen ? "ปิดการตั้งค่า" : "ตั้งค่าการจอง"}
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              disabled={!condoId}
              className="flex items-center gap-2 px-6 py-3.5 bg-[#2C92D6] text-white rounded-[20px] font-bold hover:bg-[#2F5F93] transition-all shadow-xl shadow-[#3970AE]/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              เพิ่มพื้นที่
            </button>
          </div>
        </div>

        {condoId && isPolicyOpen && (
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 md:p-7 mb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 font-black text-slate-900 text-lg">
                  <ShieldCheck size={20} />
                  ตั้งค่ากติกาการจองของลูกบ้าน
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  กำหนดสิทธิ์การจองต่อห้องต่อวันสำหรับลูกบ้านในคอนโดนี้
                </p>
              </div>

              <button
                onClick={handleSavePolicy}
                disabled={isSavingPolicy || isLoadingPolicy}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all disabled:opacity-60"
              >
                <Save size={16} />
                {isSavingPolicy ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[220px_140px_1fr] items-center gap-4">
              <label className="text-sm font-bold text-slate-700">
                สิทธิ์ต่อห้อง / วัน
              </label>

              <input
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                aria-label="สิทธิ์ต่อห้องต่อวัน"
                value={policyInput}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    setPolicyInput("");
                    return;
                  }

                  if (/^\d+$/.test(value)) {
                    setPolicyInput(value);
                  }
                }}
                onBlur={() => {
                  const parsed = Number(policyInput);

                  if (
                    !policyInput.trim() ||
                    !Number.isFinite(parsed) ||
                    parsed < 1
                  ) {
                    setPolicyInput(String(bookingPolicy.maxBookingsPerDay));
                    return;
                  }

                  const safeValue = Math.floor(parsed);
                  setPolicyInput(String(safeValue));
                }}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-200"
              />

              <p className="text-sm text-slate-500">
                1 ห้องสามารถจองพื้นที่ส่วนกลางได้กี่ครั้งต่อวัน
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">
                * การจองแต่ละครั้งถูกจำกัดไม่เกิน 2 ชั่วโมงโดยอัตโนมัติ
              </p>
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm mb-10 flex flex-col lg:flex-row items-center gap-6">
          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="ค้นหาชื่อพื้นที่ส่วนกลาง..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] outline-none focus:ring-2 focus:ring-sky-100"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setViewMode("grid")}
              aria-label="มุมมองตาราง"
              className={`p-2 rounded-xl ${viewMode === "grid" ? "bg-white shadow-sm" : ""
                }`}
            >
              <LayoutGrid size={18} />
            </button>

            <button
              onClick={() => setViewMode("list")}
              aria-label="มุมมองรายการ"
              className={`p-2 rounded-xl ${viewMode === "list" ? "bg-white shadow-sm" : ""
                }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {!condoId ? (
          <EmptyState
            title="ไม่พบคอนโด"
            description="กรุณาเลือกคอนโดก่อน แล้วค่อยเข้ามาจัดการพื้นที่ส่วนกลาง"
          />
        ) : loading ? (
          <div className="text-center py-20 text-slate-400">
            กำลังโหลดข้อมูล...
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : filteredFacilities.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                : "flex flex-col gap-4"
            }
          >
            {filteredFacilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="ไม่พบพื้นที่"
            description="ลองเปลี่ยนคำค้นหา หรือเพิ่มพื้นที่ส่วนกลางใหม่"
          />
        )}

        {isCreateModalOpen && condoId && (
          <CreateFacilityModal
            condoId={condoId}
            onClose={() => setIsCreateModalOpen(false)}
            onCreated={async () => {
              await refresh();
              setIsCreateModalOpen(false);
            }}
          />
        )}
      </div>
    </OwnerShell>
  );
};

export default FacilityListPage;