import { api } from "@/shared/api/http";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const STEP_CONDO_ID_KEY = "add_condo_condoId";
const STEP_ROOM_NAMES_KEY_PREFIX = "add_condo_room_name_drafts_";

type NavState = {
  condoId?: string;
};

type CondoService = {
  id: string;
  name: string;
  price: number | null;
  isVariable: boolean;
  variableType: string;
};

type FloorConfigRes = {
  floorCount: number;
  roomsPerFloor: number[];
  totalRooms: number;
};

type UtilityRow = {
  utilityType?: string;
  billingType?: string | null;
  rate?: number | string | null;
};

type BankAccountRow = {
  id: string;
  bankCode?: string;
  accountName?: string;
  accountNo?: string;
  accountNumber?: string;
};

type RoomRes = {
  id: string;
  floor: number;
  roomNo: string;
  price: number;
  isActive: boolean;
  occupancyStatus: string;
  roomStatus: string;
  serviceIds: string[];
};

type RoomNameDrafts = Record<string, string>;

function roomNamesKey(condoId: string) {
  return `${STEP_ROOM_NAMES_KEY_PREFIX}${condoId}`;
}

function readRoomNameDrafts(condoId: string): RoomNameDrafts {
  try {
    const raw = localStorage.getItem(roomNamesKey(condoId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      Object.entries(parsed).map(([k, v]) => [k, String(v ?? "")])
    );
  } catch {
    return {};
  }
}

function getDisplayRoomNo(room: RoomRes, drafts: RoomNameDrafts) {
  const draft = drafts[room.id];
  if (typeof draft === "string" && draft.trim() !== "") {
    return draft;
  }
  return room.roomNo ?? "";
}

function sortRooms(a: RoomRes, b: RoomRes) {
  if (a.floor !== b.floor) return a.floor - b.floor;
  return a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true });
}

export default function Step8_RoomService() {
  const nav = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const st = (location.state as NavState | null) ?? null;

  const isSettingsPath = location.pathname.startsWith("/owner/settings");
  const mode =
    params.get("mode") === "edit" || isSettingsPath ? "edit" : "create";

  const condoId = useMemo(() => {
    const fromQuery = params.get("condoId");
    const fromState = st?.condoId;
    const fromStorage = localStorage.getItem(STEP_CONDO_ID_KEY);
    return String(fromQuery ?? fromState ?? fromStorage ?? "").trim();
  }, [params, st?.condoId]);

  const [floorCount, setFloorCount] = useState<number>(0);
  const [roomsPerFloor, setRoomsPerFloor] = useState<number[]>([]);
  const [rooms, setRooms] = useState<RoomRes[]>([]);
  const [services, setServices] = useState<CondoService[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingNext, setCheckingNext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  useEffect(() => {
    if (!condoId) {
      nav("/owner/add-condo/step-0");
      return;
    }
    localStorage.setItem(STEP_CONDO_ID_KEY, condoId);
  }, [condoId, nav]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        if (!condoId) {
          setErrorMsg("ไม่พบ condoId");
          setLoading(false);
          return;
        }

        const [cfg, roomList, svcList] = await Promise.all([
          api<FloorConfigRes>(`/owner/condos/${condoId}/floor-config`),
          api<RoomRes[]>(`/owner/condos/${condoId}/rooms`),
          api<CondoService[]>(`/owner/condos/${condoId}/services`),
        ]);

        if (cancelled) return;

        const drafts = readRoomNameDrafts(condoId);

        const normalizedRooms = (roomList ?? [])
          .map((r: any) => ({
            ...r,
            serviceIds: Array.isArray(r.serviceIds) ? r.serviceIds : [],
          }))
          .map((r: RoomRes) => ({
            ...r,
            roomNo: getDisplayRoomNo(r, drafts),
          }))
          .sort(sortRooms);

        setFloorCount(cfg.floorCount);
        setRoomsPerFloor(cfg.roomsPerFloor ?? []);
        setRooms(normalizedRooms);
        setServices(svcList ?? []);
      } catch (e: any) {
        if (cancelled) return;
        setErrorMsg(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [condoId]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedCount = selectedIds.length;

  const roomsByFloor = useMemo(() => {
    const map = new Map<number, RoomRes[]>();
    for (let f = 1; f <= floorCount; f++) map.set(f, []);

    rooms.forEach((r) => {
      if (!r.isActive) return;
      map.get(r.floor)?.push(r);
    });

    map.forEach((arr) => arr.sort(sortRooms));
    return map;
  }, [rooms, floorCount]);

  const toggleRoom = (id: string) => {
    setSuccessMsg("");
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllOnFloor = (floor: number) => {
    const ids = (roomsByFloor.get(floor) ?? []).map((r) => r.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const unselectAllOnFloor = (floor: number) => {
    const ids = new Set((roomsByFloor.get(floor) ?? []).map((r) => r.id));
    setSelectedIds((prev) => prev.filter((id) => !ids.has(id)));
  };

  const [openModal, setOpenModal] = useState(false);
  const [serviceId, setServiceId] = useState<string | "">("");

  const selectedService = useMemo(() => {
    if (serviceId === "") return null;
    return services.find((x) => x.id === serviceId) ?? null;
  }, [serviceId, services]);

  const openAssign = () => {
    if (selectedCount === 0) return;
    setServiceId("");
    setOpenModal(true);
  };

  const getServicesByIds = (ids: string[] | undefined) => {
    if (!ids || ids.length === 0) return [];
    const set = new Set(ids);
    return services.filter((s) => set.has(s.id));
  };

  const reloadRooms = async () => {
    const roomList = await api<RoomRes[]>(`/owner/condos/${condoId}/rooms`);
    const drafts = readRoomNameDrafts(condoId);

    setRooms(
      (roomList ?? [])
        .map((r: any) => ({
          ...r,
          serviceIds: Array.isArray(r.serviceIds) ? r.serviceIds : [],
        }))
        .map((r: RoomRes) => ({
          ...r,
          roomNo: getDisplayRoomNo(r, drafts),
        }))
        .sort(sortRooms)
    );
  };

  const assignServiceBulk = async (roomIds: string[], serviceId: string) => {
    if (!condoId) return;

    const idSet = new Set(roomIds);

    setRooms((prev) =>
      prev.map((r) =>
        idSet.has(r.id)
          ? {
            ...r,
            serviceIds: Array.from(
              new Set([...(r.serviceIds ?? []), serviceId])
            ),
          }
          : r
      )
    );

    try {
      await api(`/owner/condos/${condoId}/room-services/assign-bulk`, {
        method: "PUT",
        body: JSON.stringify({ roomIds, serviceId }),
      });
    } catch (e) {
      await reloadRooms();
      throw e;
    }
  };

  const removeServiceBulk = async (roomIds: string[], serviceId: string) => {
    if (!condoId) return;

    const idSet = new Set(roomIds);

    setRooms((prev) =>
      prev.map((r) =>
        idSet.has(r.id)
          ? {
            ...r,
            serviceIds: (r.serviceIds ?? []).filter((x) => x !== serviceId),
          }
          : r
      )
    );

    try {
      await api(`/owner/condos/${condoId}/room-services/remove-bulk`, {
        method: "PUT",
        body: JSON.stringify({ roomIds, serviceId }),
      });
    } catch (e) {
      await reloadRooms();
      throw e;
    }
  };

  const onSaveService = async () => {
    if (!selectedService || selectedCount === 0) return;

    try {
      setSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      await assignServiceBulk(selectedIds, selectedService.id);

      setOpenModal(false);
      setSelectedIds([]);

      if (mode === "edit") {
        setSuccessMsg("บันทึกค่าบริการรายห้องเรียบร้อยแล้ว");
      }
    } catch (e: any) {
      setErrorMsg(e?.message ?? "บันทึกค่าบริการไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const onRemoveService = async () => {
    if (!selectedService || selectedCount === 0) return;

    try {
      setSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      await removeServiceBulk(selectedIds, selectedService.id);

      setOpenModal(false);
      setSelectedIds([]);

      if (mode === "edit") {
        setSuccessMsg("ลบค่าบริการรายห้องเรียบร้อยแล้ว");
      }
    } catch (e: any) {
      setErrorMsg(e?.message ?? "ลบค่าบริการไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const validateRequiredBeforeNext = async () => {
    if (!condoId) return ["ไม่พบ condoId"];

    const [cfg, roomList, utilityList, bankList] = await Promise.all([
      api<FloorConfigRes>(`/owner/condos/${condoId}/floor-config`),
      api<RoomRes[]>(`/owner/condos/${condoId}/rooms`),
      api<UtilityRow[]>(`/owner/condos/${condoId}/utilities`),
      api<BankAccountRow[]>(`/owner/condos/${condoId}/bank-accounts`),
    ]);

    const drafts = readRoomNameDrafts(condoId);

    const normalizedRooms = (roomList ?? []).map((r: any) => ({
      ...r,
      roomNo: getDisplayRoomNo(
        {
          ...r,
          serviceIds: Array.isArray(r.serviceIds) ? r.serviceIds : [],
        },
        drafts
      ),
      price:
        r?.price === null || r?.price === undefined ? null : Number(r.price),
      serviceIds: Array.isArray(r.serviceIds) ? r.serviceIds : [],
    }));

    const missing: string[] = [];

    const utilities = new Map<string, UtilityRow>(
      (utilityList ?? []).map((u) => [String(u?.utilityType ?? "").toUpperCase(), u])
    );

    const water = utilities.get("WATER");
    const electric = utilities.get("ELECTRIC");

    const hasValidUtility = (u?: UtilityRow) => {
      if (!u) return false;
      const hasBillingType = String(u.billingType ?? "").trim().length > 0;
      const rateNum = Number(u.rate);
      return hasBillingType && Number.isFinite(rateNum);
    };

    if (!hasValidUtility(water) || !hasValidUtility(electric)) {
      missing.push("Step2: ข้อมูลไม่ครบ");
    }

    const accounts = bankList ?? [];
    if (accounts.length === 0) {
      missing.push("Step3: ข้อมูลไม่ครบ");
    } else {
      const invalidBank = accounts.some((acc) => {
        const accountNo = String(
          acc?.accountNo ?? acc?.accountNumber ?? ""
        ).trim();

        return (
          String(acc?.bankCode ?? "").trim().length === 0 ||
          String(acc?.accountName ?? "").trim().length === 0 ||
          accountNo.length === 0
        );
      });

      if (invalidBank) missing.push("Step3: ข้อมูลไม่ครบ");
    }

    if (!cfg?.floorCount || Number(cfg.floorCount) <= 0) {
      missing.push("Step4: ข้อมูลไม่ครบ");
    }
    const missingRoomNoCount = normalizedRooms.filter(
      (r) => String(r?.roomNo ?? "").trim().length === 0
    ).length;
    if (missingRoomNoCount > 0) {
      missing.push("Step5: ข้อมูลไม่ครบ");
    }

    const missingPriceCount = normalizedRooms.filter(
      (r) =>
        r?.price === null ||
        r?.price === undefined ||
        !Number.isFinite(Number(r.price)) ||
        Number(r.price) <= 0
    ).length;
    if (missingPriceCount > 0) {
      missing.push("Step6: ข้อมูลไม่ครบ");
    }

    return missing;
  };

  const handleNext = async () => {
    if (!condoId || checkingNext) return;

    try {
      setCheckingNext(true);
      setErrorMsg("");
      setSuccessMsg("");

      const missing = await validateRequiredBeforeNext();
      if (missing.length > 0) {
        alert(["ข้อมูลไม่ครบ กรุณาแก้ไขก่อน:", ...missing].join("\n"));
        return;
      }

      nav(`../step-9?condoId=${encodeURIComponent(condoId)}`, {
        state: { condoId },
      });
    } catch (e: any) {
      setErrorMsg(e?.message ?? "ตรวจสอบข้อมูลไม่สำเร็จ");
    } finally {
      setCheckingNext(false);
    }
  };

  const handleSaveInEdit = () => {
    setSuccessMsg("บันทึกค่าบริการรายห้องเรียบร้อยแล้ว");
  };

  return (
    <div className="w-full max-w-[1120px] mx-auto flex flex-col gap-[18px] pb-[110px]">
      <h1 className="text-center text-[34px] font-extrabold text-black/85 tracking-[0.2px] mb-[6px] mt-[6px]">
        {mode === "edit" ? "แก้ไขค่าบริการรายห้อง" : "ตั้งค่าคอนโดมิเนียม"}
      </h1>

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700 font-extrabold">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-700 font-extrabold">
          {successMsg}
        </div>
      )}

      <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-blue-100/60 overflow-hidden">
        <div className="flex items-center gap-3 px-8 py-5 bg-[#f3f7ff] border-b border-blue-100/60">
          <div className="h-9 w-1.5 rounded-full bg-[#5b86ff]" />
          <div>
            <div className="text-xl font-extrabold text-gray-900 tracking-tight">
              ค่าบริการรายห้อง
            </div>
            <div className="mt-1 text-sm font-bold text-gray-600">
              เลือกห้อง แล้วกำหนด “ค่าบริการเพิ่มเติม” ให้แต่ละห้อง
            </div>
          </div>
        </div>

        <div className="px-8 py-7 space-y-5">
          {loading ? (
            <div className="rounded-2xl border border-blue-100/60 bg-white px-6 py-8 shadow-sm text-center">
              <div className="text-sm font-extrabold text-gray-900">
                กำลังโหลดข้อมูล...
              </div>
            </div>
          ) : floorCount <= 0 ? (
            <div className="rounded-2xl border border-blue-100/60 bg-white px-6 py-8 shadow-sm text-center">
              <div className="text-sm font-extrabold text-gray-900">
                ยังไม่มีข้อมูลห้อง
              </div>
              <div className="mt-1 text-sm font-bold text-gray-600">
                ต้องตั้งค่า floor-config / generate rooms ก่อน
              </div>
            </div>
          ) : (
            Array.from({ length: floorCount }, (_, i) => i + 1).map((floor) => {
              const floorRooms = roomsByFloor.get(floor) ?? [];
              const countHint = roomsPerFloor?.[floor - 1] ?? floorRooms.length;

              return (
                <div
                  key={floor}
                  className="rounded-2xl border border-blue-100/60 bg-white shadow-sm overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-4 px-6 py-4 bg-[#f3f7ff] border-b border-blue-100/60">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-1.5 rounded-full bg-[#5b86ff]" />
                      <div className="text-lg font-extrabold text-gray-900">
                        ชั้นที่ {floor}
                      </div>
                      <div className="text-sm font-bold text-gray-600">
                        · {countHint} ห้อง
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => selectAllOnFloor(floor)}
                        className="h-[44px] px-5 rounded-xl bg-white border border-blue-200 text-blue-700 font-extrabold text-sm shadow-sm hover:bg-blue-50 active:scale-[0.98]
                      focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        เลือกทั้งชั้น
                      </button>

                      <button
                        type="button"
                        onClick={() => unselectAllOnFloor(floor)}
                        className="h-[44px] px-5 rounded-xl bg-white border border-gray-200 text-gray-700 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98]
                      focus:outline-none focus:ring-2 focus:ring-gray-200"
                      >
                        ยกเลิกทั้งชั้น
                      </button>
                    </div>
                  </div>

                  <div className="px-6 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {floorRooms.map((r) => {
                        const isSelected = selectedSet.has(r.id);
                        const roomServices = getServicesByIds(r.serviceIds);

                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => toggleRoom(r.id)}
                            className={[
                              "rounded-2xl border px-6 py-5 bg-white shadow-sm transition text-left",
                              "active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-200",
                              isSelected
                                ? "border-blue-300 ring-4 ring-blue-200/60"
                                : "border-blue-100/70 hover:border-blue-200",
                            ].join(" ")}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-base font-extrabold text-gray-900">
                                ห้อง {r.roomNo}
                              </div>

                              <div
                                className={[
                                  "h-[34px] px-3 rounded-xl text-xs font-extrabold border flex items-center",
                                  isSelected
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-700 border-gray-200",
                                ].join(" ")}
                              >
                                {isSelected ? "เลือกแล้ว" : "เลือก"}
                              </div>
                            </div>

                            <div className="mt-3 text-sm font-bold text-gray-600">
                              ราคา:{" "}
                              <span className="font-extrabold text-gray-900">
                                {Number(r.price ?? 0).toLocaleString()} บาท
                              </span>
                            </div>

                            <div
                              className={[
                                "mt-4 inline-flex items-center px-4 py-2 rounded-xl border text-sm font-extrabold",
                                roomServices.length > 0
                                  ? "bg-blue-50 border-blue-200 text-blue-900"
                                  : "bg-gray-50 border-gray-200 text-gray-700",
                              ].join(" ")}
                            >
                              {roomServices.length > 0
                                ? `${roomServices[0].name} · ${Number(
                                  roomServices[0].price
                                ).toLocaleString()} บาท${roomServices.length > 1
                                  ? ` (+อีก ${roomServices.length - 1})`
                                  : ""
                                }`
                                : "ยังไม่ได้เลือกค่าบริการ"}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-6 text-sm font-bold text-gray-600">
                      ชั้นนี้มี{" "}
                      <span className="font-extrabold text-gray-900">
                        {countHint}
                      </span>{" "}
                      ห้อง
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-[14px] flex-wrap pt-5">
        <div className="h-[46px] min-w-[260px] px-6 rounded-xl bg-[#161A2D] text-white flex items-center justify-center shadow-[0_12px_22px_rgba(0,0,0,0.18)] font-extrabold text-sm">
          จำนวนห้องที่เลือก {selectedCount} ห้อง
        </div>

        <button
          type="button"
          onClick={openAssign}
          disabled={selectedCount === 0 || saving}
          className={[
            "h-[46px] px-5 rounded-xl border-0 font-extrabold text-sm transition shadow-[0_12px_22px_rgba(0,0,0,0.18)]",
            "focus:outline-none focus:ring-2 focus:ring-blue-300",
            selectedCount === 0 || saving
              ? "bg-[#1F80DB]/40 cursor-not-allowed text-white/70"
              : "bg-[#1F80DB] hover:bg-[#7fb4fb] active:scale-[0.98] cursor-pointer text-white",
          ].join(" ")}
        >
          ระบุค่าบริการ
        </button>

        {mode === "create" ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={checkingNext || loading || saving}
            className="h-[46px] w-24 rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition
          bg-[#1F80DB] hover:bg-[#7fb4fb] active:scale-[0.98] disabled:bg-[#1F80DB]/40 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {checkingNext ? "กำลังตรวจ..." : "ต่อไป"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSaveInEdit}
            disabled={loading || saving}
            className="h-[46px] min-w-[110px] rounded-xl border-0 text-white font-black text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition
          bg-[#1F80DB] hover:bg-[#7fb4fb] active:scale-[0.98] disabled:bg-[#1F80DB]/40 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            บันทึก
          </button>
        )}
      </div>

      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpenModal(false)}
          />

          <div
            className="relative w-full max-w-[560px] rounded-2xl bg-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] overflow-hidden border border-blue-100/60"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-3 px-7 py-5 bg-[#f3f7ff] border-b border-blue-100/60">
              <div className="h-8 w-1.5 rounded-full bg-[#5b86ff]" />
              <div>
                <div className="text-lg font-extrabold text-gray-900 tracking-tight">
                  ระบุค่าบริการเพิ่มเติม
                </div>
                <div className="mt-1 text-xs font-bold text-gray-600">
                  เลือกบริการให้กับ {selectedCount.toLocaleString()} ห้องที่เลือก
                </div>
              </div>
            </div>

            <div className="px-7 py-6">
              <div className="text-sm font-bold text-gray-700 mb-2">
                บริการ <span className="text-rose-600">*</span>
              </div>

              <select
                value={serviceId}
                onChange={(e) =>
                  setServiceId(e.target.value === "" ? "" : e.target.value)
                }
                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-extrabold text-gray-900 shadow-sm
              focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-300"
              >
                <option value="">เลือกบริการ</option>
                {services.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} · {Number(o.price).toLocaleString()} บาท
                  </option>
                ))}
              </select>
            </div>

            <div className="px-7 py-5 bg-white border-t border-blue-100/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="h-[44px] px-6 rounded-xl bg-white border border-gray-200 text-gray-800 font-extrabold text-sm shadow-sm hover:bg-gray-50 active:scale-[0.98] transition
              focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                ปิด
              </button>

              <button
                type="button"
                onClick={onRemoveService}
                disabled={!selectedService || selectedCount === 0 || saving}
                className={[
                  "h-[44px] px-6 rounded-xl bg-white border font-extrabold text-sm shadow-sm transition active:scale-[0.98]",
                  "focus:outline-none focus:ring-2",
                  !selectedService || selectedCount === 0 || saving
                    ? "border-rose-100 text-rose-300 cursor-not-allowed"
                    : "border-rose-200 text-rose-700 hover:bg-rose-50 focus:ring-rose-200",
                ].join(" ")}
              >
                ลบค่าบริการ
              </button>

              <button
                type="button"
                disabled={!selectedService || saving}
                onClick={onSaveService}
                className={[
                  "h-[44px] px-7 rounded-xl border-0 text-white font-extrabold text-sm shadow-[0_12px_22px_rgba(0,0,0,0.18)] transition",
                  "focus:outline-none focus:ring-2 focus:ring-blue-300",
                  selectedService && !saving
                    ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
                    : "bg-blue-200 cursor-not-allowed text-white/70 shadow-none",
                ].join(" ")}
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}