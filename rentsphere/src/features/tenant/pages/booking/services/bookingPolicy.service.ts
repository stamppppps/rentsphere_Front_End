import { api } from "@/shared/api/http";

export type BookingPolicy = {
    condoId: string;
    maxBookingsPerDay: number;
};

export async function getBookingPolicy(
    condoId: string
): Promise<BookingPolicy> {
    return api<BookingPolicy>(
        `/owner/condos/${encodeURIComponent(condoId)}/booking-policy`
    );
}