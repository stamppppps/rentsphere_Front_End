import { api } from "@/shared/api/http";
import {
  FacilityStatus,
  type Facility,
  type FacilityBookingSetting,
} from "../types/facility";

type FacilityBookingSettingDto = {
  id: string;
  openTime: string | null;
  closeTime: string | null;
  slotMinutes: number;
  maxPeople: number | null;
  maxBookingsPerDay: number | null;
  requiresApproval: boolean;
  feePerSlot: number;
  deposit: number;
  cancellationHours: number;
};

type FacilityDto = {
  id: string;
  condoId: string;
  facilityName: string;
  description?: string | null;
  coverImageUrl?: string | null;
  isActive?: boolean;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  bookingSetting?: FacilityBookingSettingDto | null;
};

function normalizeFacilityStatus(value?: string | null): FacilityStatus {
  if (String(value ?? "").toUpperCase() === "MAINTENANCE") {
    return FacilityStatus.MAINTENANCE;
  }
  return FacilityStatus.AVAILABLE;
}

function normalizeBookingSetting(
  setting?: FacilityBookingSettingDto | null
): FacilityBookingSetting | null {
  if (!setting) return null;

  return {
    id: String(setting.id),
    openTime: setting.openTime ?? null,
    closeTime: setting.closeTime ?? null,
    slotMinutes: Number(setting.slotMinutes ?? 60),
    maxPeople: setting.maxPeople == null ? null : Number(setting.maxPeople),
    maxBookingsPerDay:
      setting.maxBookingsPerDay == null
        ? null
        : Number(setting.maxBookingsPerDay),
    requiresApproval: Boolean(setting.requiresApproval),
    feePerSlot: Number(setting.feePerSlot ?? 0),
    deposit: Number(setting.deposit ?? 0),
    cancellationHours: Number(setting.cancellationHours ?? 0),
  };
}

function normalizeFacility(dto: FacilityDto): Facility {
  const status =
    dto.status != null
      ? normalizeFacilityStatus(dto.status)
      : dto.isActive === false
        ? FacilityStatus.MAINTENANCE
        : FacilityStatus.AVAILABLE;

  const isActive =
    typeof dto.isActive === "boolean"
      ? dto.isActive
      : status === FacilityStatus.AVAILABLE;

  return {
    id: String(dto.id),
    condoId: String(dto.condoId),
    name: String(dto.facilityName ?? ""),
    facilityName: String(dto.facilityName ?? ""),
    description: String(dto.description ?? ""),
    coverImageUrl: dto.coverImageUrl ?? null,
    isActive,
    status,
    createdAt: dto.createdAt ?? undefined,
    updatedAt: dto.updatedAt ?? undefined,
    bookingSetting: normalizeBookingSetting(dto.bookingSetting),
  };
}

type CreateFacilityPayload = {
  condoId: string;
  facilityName: string;
  description?: string | null;
  coverImageUrl?: string | null;
};

type UpdateFacilityPayload = Partial<{
  facilityName: string;
  description: string | null;
  coverImageUrl: string | null;
  status: "AVAILABLE" | "MAINTENANCE";
  isActive: boolean;
}>;

type SaveFacilitySettingsPayload = {
  openTime: string;
  closeTime: string;
  slotMinutes: number;
  maxPeople?: number | null;
  maxBookingsPerDay?: number | null;
  requiresApproval: boolean;
  feePerSlot: number;
  deposit: number;
  cancellationHours: number;
};

export const facilityService = {
  async getFacilities(condoId: string): Promise<Facility[]> {
    const rows = await api<FacilityDto[]>(
      `/owner/condos/${encodeURIComponent(condoId)}/facilities`
    );
    return (rows ?? []).map(normalizeFacility);
  },

  async uploadFacilityImage(facilityId: string, file: File): Promise<Facility> {
    const formData = new FormData();
    formData.append("image", file);

    const row = await api<FacilityDto>(
      `/owner/facilities/${encodeURIComponent(facilityId)}/image`,
      {
        method: "POST",
        body: formData,
      }
    );

    return normalizeFacility(row);
  },

  async deleteFacility(id: string): Promise<{ ok: true }> {
    return await api<{ ok: true }>(
      `/owner/facilities/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      }
    );
  },

  async getFacilityById(id: string): Promise<Facility | null> {
    try {
      const row = await api<FacilityDto>(
        `/owner/facilities/${encodeURIComponent(id)}`
      );
      if (!row) return null;
      return normalizeFacility(row);
    } catch {
      return null;
    }
  },

  async createFacility(payload: CreateFacilityPayload): Promise<Facility> {
    const row = await api<FacilityDto>(
      `/owner/condos/${encodeURIComponent(payload.condoId)}/facilities`,
      {
        method: "POST",
        body: JSON.stringify({
          facilityName: payload.facilityName,
          description: payload.description ?? null,
          coverImageUrl: payload.coverImageUrl ?? null,
        }),
      }
    );

    return normalizeFacility(row);
  },

  async updateFacility(
    id: string,
    data: UpdateFacilityPayload
  ): Promise<Facility> {
    const row = await api<FacilityDto>(
      `/owner/facilities/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );

    return normalizeFacility(row);
  },

  async updateFacilityStatus(
    id: string,
    status: "AVAILABLE" | "MAINTENANCE"
  ): Promise<Facility> {
    const row = await api<FacilityDto>(
      `/owner/facilities/${encodeURIComponent(id)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );

    return normalizeFacility(row);
  },

  async saveFacilitySettings(
    facilityId: string,
    payload: SaveFacilitySettingsPayload
  ): Promise<FacilityBookingSetting> {
    const row = await api<FacilityBookingSettingDto>(
      `/owner/facilities/${encodeURIComponent(facilityId)}/settings`,
      {
        method: "PUT",
        body: JSON.stringify({
          openTime: payload.openTime,
          closeTime: payload.closeTime,
          slotMinutes: payload.slotMinutes,
          maxPeople: payload.maxPeople ?? null,
          maxBookingsPerDay: payload.maxBookingsPerDay ?? null,
          requiresApproval: payload.requiresApproval,
          feePerSlot: payload.feePerSlot,
          deposit: payload.deposit,
          cancellationHours: payload.cancellationHours,
        }),
      }
    );

    const normalized = normalizeBookingSetting(row);
    if (!normalized) {
      throw new Error("Failed to normalize facility booking setting");
    }

    return normalized;
  },
};