import { api } from "@/shared/api/http";
import type { RoomDetail, MeterData } from "./types";


const ENDPOINT = {

  roomDetail: (roomId: string) => `/owner/rooms/${encodeURIComponent(roomId)}`,


  roomMeters: (roomId: string) => `/owner/rooms/${encodeURIComponent(roomId)}/meters`,
};


function normalizeRoomDetail(roomId: string, data: any): RoomDetail {
  const room = data?.room ?? data;
  const condo = data?.condo ?? room?.condo;

  const occupancy =
    String(room?.occupancyStatus ?? room?.status ?? "VACANT").toUpperCase() === "OCCUPIED"
      ? "OCCUPIED"
      : "VACANT";

  return {
    id: String(room?.id ?? roomId),
    condoId: String(room?.condoId ?? condo?.id ?? ""),
    condoName: (condo?.nameTh ?? condo?.nameEn ?? room?.condoName ?? null) as string | null,

    roomNo: String(room?.roomNo ?? "—"),
    floor: room?.floor == null ? null : Number(room.floor),

    price:
      room?.price == null && room?.rentPrice == null ? null : Number(room?.price ?? room?.rentPrice),

    isActive: Boolean(room?.isActive ?? true),
    occupancyStatus: occupancy,
  };
}

export async function fetchRoomDetail(roomId: string): Promise<RoomDetail> {
  const data = await api<any>(ENDPOINT.roomDetail(roomId));
  return normalizeRoomDetail(roomId, data);
}

export async function fetchRoomMeters(roomId: string): Promise<MeterData> {
  const data = await api<any>(ENDPOINT.roomMeters(roomId));
  const items: any[] = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

  const latest = (type: string) =>
    items.find((x) => String(x?.type).toUpperCase() === type)?.value ?? "";

  return {
    waterMeter: String(latest("WATER") ?? ""),
    elecMeter: String(latest("ELECTRICITY") ?? ""),
  };
}

export async function saveRoomMeters(roomId: string, meterData: MeterData): Promise<void> {
  await api<void>(ENDPOINT.roomMeters(roomId), {
    method: "PATCH",
    body: JSON.stringify(meterData),
  });
}