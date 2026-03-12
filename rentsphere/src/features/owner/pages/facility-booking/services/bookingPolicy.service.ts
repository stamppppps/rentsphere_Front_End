import { api } from "@/shared/api/http";
export type BookingPolicy = {
    condoId: string;
    maxBookingsPerDay: number;
};
export async function getBookingPolicy(condoId: string): Promise<BookingPolicy> {
    return api<BookingPolicy>(
        `/owner/condos/${encodeURIComponent(condoId)}/booking-policy`
    );
}

export async function updateBookingPolicy(
    condoId: string,
    payload: { maxBookingsPerDay: number }
): Promise<BookingPolicy & { ok?: boolean }> {
    return api<BookingPolicy & { ok?: boolean }>(
        `/owner/condos/${encodeURIComponent(condoId)}/booking-policy`,
        {
            method: "PUT",
            body: JSON.stringify(payload),
        }
    );
}