// mobile/lib/api/flatlyApi.ts
import { apiRequest, ApiError } from "./apiClient";
import { getProfile } from "../storage/profileStorage";

// -------------------------
// OpenAPI DTOs
// -------------------------
// From openapi.json (FlatlyFlatDto, FlatlyBookingDetailsResponse, etc.)
export type FlatlyFlatImageDto = {
  sort_order?: number;
  image_url?: string;
};

export type FlatlyFlatDto = {
  id: string; // uuid
  name?: string;
  city?: string;
  country?: string;
  rooms?: number;
  maxGuests?: number;
  images?: FlatlyFlatImageDto[];
};

export type FlatlyFlatDetailsDto = {
  id?: string; // uuid
  name?: string;
  city?: string;
  country?: string;
  rooms?: number;
  maxGuests?: number;
  lat?: number;
  lon?: number;
};

export type FlatlyBookingDto = {
  id: string; // uuid
  flatId?: string; // uuid
  userId?: string; // uuid (note: not the Carly numeric userId)
  source?: string;
  checkInDate?: string; // date (YYYY-MM-DD)
  checkOutDate?: string; // date (YYYY-MM-DD)
  guestsCount?: number;
};

export type FlatlyBookingDetailsResponse = {
  booking?: FlatlyBookingDto;
  flat?: FlatlyFlatDetailsDto;
  flatImages?: FlatlyFlatImageDto[];
};

export type CreateFlatlyBookingRequest = {
  userId: number; // Carly userId (int32)
  flatId: string; // uuid
  checkInDate: string; // date
  checkOutDate: string; // date
  guestsCount: number; // >= 1
};

export type CreateFlatlyBookingResponse = { id?: string }; // uuid

// -------------------------
// Helpers
// -------------------------
function asDateOnly(dayISO: string): string {
  // Accept "YYYY-MM-DD" and also tolerate full strings; we only send date-only.
  const s = String(dayISO ?? "").trim();
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function toBackendLocalDateTime(dayISO: string, hhmmss = "12:00:00"): string {
  // GET /flatly/flats/available expects date-time query params
  return `${asDateOnly(dayISO)}T${hhmmss}`;
}

function friendlyFlatlyError(err: unknown): { title: string; message: string } {
  if (err instanceof ApiError) {
    // Typical HTTP-friendly UX
    if (err.status === 401 || err.status === 403) {
      return { title: "Not allowed", message: "Please log in again and retry." };
    }
    if (err.status === 404) {
      return { title: "Not found", message: "That Flatly resource no longer exists." };
    }
    if (err.status === 409) {
      return {
        title: "Unavailable",
        message: "Those dates aren’t available anymore. Pick different dates and try again.",
      };
    }
    if (err.status === 422) {
      return { title: "Invalid data", message: "Check the dates / guest count and try again." };
    }
    return { title: "Flatly error", message: err.message || "Request failed." };
  }
  return { title: "Flatly error", message: (err as any)?.message ?? "Request failed." };
}

async function requireCarlyUserId(): Promise<number> {
  const p = await getProfile();
  if (!p.userId) throw new Error("No userId in profile. Please log in again.");
  return p.userId;
}

// -------------------------
// Public API
// -------------------------

/**
 * GET /flatly/flats/available?dateFrom=...&dateTo=...
 * Returns FlatlyFlatDto[] (uuid ids).
 */
export async function getAvailableFlats(dateFromDayISO: string, dateToDayISO: string): Promise<FlatlyFlatDto[]> {
  const qs = new URLSearchParams();
  qs.set("dateFrom", toBackendLocalDateTime(dateFromDayISO, "12:00:00"));
  qs.set("dateTo", toBackendLocalDateTime(dateToDayISO, "12:00:00"));

  try {
    const rows = await apiRequest<FlatlyFlatDto[]>(`/flatly/flats/available?${qs.toString()}`, { method: "GET" });
    return Array.isArray(rows) ? rows : [];
  } catch (e) {
    const ui = friendlyFlatlyError(e);
    throw new Error(ui.message);
  }
}

/**
 * POST /flatly/bookings
 * Returns { id: uuid }
 */
export async function createFlatlyBooking(args: {
  flatId: string; // uuid
  checkInDayISO: string; // YYYY-MM-DD
  checkOutDayISO: string; // YYYY-MM-DD
  guestsCount: number; // >= 1
}): Promise<string> {
  const userId = await requireCarlyUserId();

  const body: CreateFlatlyBookingRequest = {
    userId,
    flatId: String(args.flatId),
    checkInDate: asDateOnly(args.checkInDayISO),
    checkOutDate: asDateOnly(args.checkOutDayISO),
    guestsCount: Math.max(1, Number(args.guestsCount || 1)),
  };

  try {
    const res = await apiRequest<CreateFlatlyBookingResponse>(`/flatly/bookings`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const id = String(res?.id ?? "").trim();
    if (!id) throw new Error("Flat booking created but no id returned by backend.");
    return id;
  } catch (e) {
    const ui = friendlyFlatlyError(e);
    throw new Error(ui.message);
  }
}

/**
 * DELETE /flatly/bookings/{flatBookingId}
 */
export async function cancelFlatlyBooking(flatBookingId: string): Promise<void> {
  const id = String(flatBookingId ?? "").trim();
  if (!id) throw new Error("Invalid Flatly booking id.");

  try {
    await apiRequest<string>(`/flatly/bookings/${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch (e) {
    const ui = friendlyFlatlyError(e);
    throw new Error(ui.message);
  }
}

/**
 * GET /flatly/flat-bookings/{flatBookingId}
 * Returns FlatlyBookingDetailsResponse
 */
export async function getFlatBookingDetails(flatBookingId: string): Promise<FlatlyBookingDetailsResponse> {
  const id = String(flatBookingId ?? "").trim();
  if (!id) throw new Error("Invalid Flatly booking id.");

  try {
    return await apiRequest<FlatlyBookingDetailsResponse>(`/flatly/flat-bookings/${encodeURIComponent(id)}`, {
      method: "GET",
    });
  } catch (e) {
    const ui = friendlyFlatlyError(e);
    throw new Error(ui.message);
  }
}

/**
 * GET /flatly/flat-bookings/user/{userId}
 * Returns FlatlyBookingDetailsResponse[]
 */
export async function getUserFlatBookings(userId: number): Promise<FlatlyBookingDetailsResponse[]> {
  const n = Number(userId);
  if (!Number.isFinite(n)) throw new Error("Invalid userId.");

  try {
    const rows = await apiRequest<FlatlyBookingDetailsResponse[]>(
      `/flatly/flat-bookings/user/${encodeURIComponent(String(n))}`,
      { method: "GET" }
    );
    return Array.isArray(rows) ? rows : [];
  } catch (e) {
    const ui = friendlyFlatlyError(e);
    throw new Error(ui.message);
  }
}
