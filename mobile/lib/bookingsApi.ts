// lib/bookingsApi.ts
import { apiRequest } from "./apiClient";
import { getProfile } from "./profileStorage";

// -------------------------
// App-facing types (same shape as your old bookingsStorage)
// -------------------------
export type BookingStatus = "current" | "history";
export type BookingState = "Booked" | "Cancelled";

export type BookingCar = {
  brand: string;
  model: string;
  plate: string; // backend doesn't have this -> we fill with "—"
  images: string[];
};

export type BookingFlat = {
  address: string;
  images: string[];
};

export type Booking = {
  id: string; // we keep string for UI routing; backend is int
  status: BookingStatus; // controls current/history list
  state: BookingState; // label
  startDate: string;
  endDate: string;
  car?: BookingCar;
  flat?: BookingFlat; // currently we can't populate from booking response
  createdAtISO: string; // not in backend -> set on fetch time
  cancelledAtISO?: string; // not in backend -> best-effort if CANCELLED
};

// -------------------------
// Backend DTOs (from OpenAPI)
// -------------------------
type LocationDto = {
  id: number;
  address?: string;
  latitude?: number;
  longitude?: number;
};

type BookingStatusDto = {
  id?: number;
  name?: string; // CREATED / COMPLETED / CANCELLED (expected)
};

type GetBookingResponse = {
  id: number;
  userId?: number;
  carId?: number;
  pickupLocation?: LocationDto;
  returnLocation?: LocationDto;
  carStatus?: BookingStatusDto;
  flatStatus?: BookingStatusDto;
  providerExternalBookingId?: number;
  carBookingDateFrom?: string; // date-time
  carBookingDateTo?: string; // date-time
};

type BookingResponse = { id: number };

type CreateBookingRequest = {
  userId: number;
  carId: number;
  pickupLocationId?: number;
  returnLocationId?: number;
  carBookingDateFrom: string; // date-time
  carBookingDateTo: string; // date-time
};

type CarFeatureDto = {
  dictionaryId?: number;
  name?: string;
  value: string;
};

type GetCarResponseDto = {
  carId: number;
  carFeatures?: CarFeatureDto[];
  urls?: string[];
  price?: number;
};

// -------------------------
// Helpers
// -------------------------
function normalizeKey(name: unknown): string {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function toBackendLocalDateTime(input: string): string {
  // Accept either:
  // - "YYYY-MM-DD"  -> "YYYY-MM-DDT12:00:00"
  // - ISO with Z    -> strip millis and Z, then keep local "YYYY-MM-DDTHH:mm:ss"
  const s = String(input ?? "").trim();
  if (!s) return s;

  // If it's date-only
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T12:00:00`;

  // If it's ISO like 2026-05-01T12:00:00.000Z -> 2026-05-01T12:00:00
  const m = s.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
  if (m?.[1]) return m[1];

  // Otherwise pass through
  return s;
}

function extractFeatureValue(features: CarFeatureDto[] | undefined, wanted: string): string | undefined {
  if (!Array.isArray(features)) return undefined;
  const w = normalizeKey(wanted);
  for (const f of features) {
    const k = normalizeKey(f?.name);
    if (!k) continue;
    if (k === w) return String(f.value ?? "").trim() || undefined;

    if (w === "fuel type" && (k === "fuel" || k === "fuel type")) {
      return String(f.value ?? "").trim() || undefined;
    }
  }
  return undefined;
}

function makeSinglePlaceholderUrl(seed: string): string {
  // one random placeholder per mapping pass
  return `https://picsum.photos/seed/${encodeURIComponent(seed + "_" + Math.floor(Math.random() * 1e9))}/900/600`;
}

function toISODateOnlyOrDateTime(iso?: string): string {
  // UI currently stores YYYY-MM-DD, but accepts ISO strings too.
  // We keep ISO if provided; otherwise empty string.
  return iso ? String(iso) : "";
}

function upper(s?: string): string {
  return String(s ?? "").trim().toUpperCase();
}

type BackendBookingStatus = "CREATED" | "COMPLETED" | "CANCELLED" | "UNKNOWN";

/**
 * Prefer carStatus if present; otherwise use flatStatus.
 * If both exist and differ, this picks carStatus first (car booking-centric UI).
 */
function getEffectiveBackendStatus(b: GetBookingResponse): BackendBookingStatus {
  const car = upper(b.carStatus?.name);
  const flat = upper(b.flatStatus?.name);

  const s = car || flat;

  if (s === "CREATED") return "CREATED";
  if (s === "COMPLETED") return "COMPLETED";
  if (s === "CANCELLED") return "CANCELLED";
  return "UNKNOWN";
}

/**
 * Maps backend booking status to UI sections and labels.
 * Current: CREATED
 * History: COMPLETED or CANCELLED
 */
function mapToUiStatus(b: GetBookingResponse): { status: BookingStatus; state: BookingState } | null {
  const s = getEffectiveBackendStatus(b);

  if (s === "CREATED") return { status: "current", state: "Booked" };
  if (s === "COMPLETED") return { status: "history", state: "Booked" };
  if (s === "CANCELLED") return { status: "history", state: "Cancelled" };

  // Ignore anything else (unknown statuses)
  return null;
}


async function enrichCar(carId: number): Promise<BookingCar | undefined> {
  const dto = await apiRequest<GetCarResponseDto>(`/cars/${carId}`, { method: "GET" });

  const brand = extractFeatureValue(dto.carFeatures, "brand") ?? "—";
  const model = extractFeatureValue(dto.carFeatures, "model") ?? "—";

  const urls = Array.isArray(dto.urls) ? dto.urls.filter((u): u is string => typeof u === "string" && u.trim()) : [];
  const images = urls.length > 0 ? urls : [makeSinglePlaceholderUrl(`booking_car_${carId}`)];

  return {
    brand,
    model,
    plate: "—", // backend doesn't store plate in car DTO
    images,
  };
}

async function requireUserId(): Promise<number> {
  const p = await getProfile();
  if (!p.userId) {
    throw new Error("No userId in profile. Please log in again.");
  }
  return p.userId;
}

// -------------------------
// Public API
// -------------------------

/**
 * GET /bookings?userId=...
 * Returns bookings that actually exist in DB.
 */
export async function getBookingsFromBackend(): Promise<Booking[]> {
  const userId = await requireUserId();

  const qs = new URLSearchParams();
  qs.set("userId", String(userId));

  const rows = await apiRequest<GetBookingResponse[]>(`/bookings?${qs.toString()}`, { method: "GET" });
  const list = Array.isArray(rows) ? rows : [];

  // Enrich car data in parallel (best effort)
  const nowISO = new Date().toISOString();
  const enriched = await Promise.all(
    list.map(async (b) => {
      const mapped = mapToUiStatus(b);
      if (!mapped) return null;

      const { status, state } = mapped;

      const car = b.carId ? await enrichCar(b.carId).catch(() => undefined) : undefined;

      const start = toISODateOnlyOrDateTime(b.carBookingDateFrom);
      const end = toISODateOnlyOrDateTime(b.carBookingDateTo);

      const nowISO = new Date().toISOString();

      return {
        id: String(b.id),
        status,
        state,
        startDate: start,
        endDate: end,
        car,
        flat: undefined,
        rating: undefined,
        createdAtISO: nowISO,
        cancelledAtISO: state === "Cancelled" ? nowISO : undefined,
      } satisfies Booking;
    })
  );

  // drop nulls
  const cleaned = enriched.filter((x): x is Booking => !!x);

  // Newest first
  cleaned.sort((a, b) => Number(b.id) - Number(a.id));
  return cleaned;

}

/**
 * GET /bookings/{bookingId}
 */
export async function getBookingByIdFromBackend(bookingId: string): Promise<Booking | null> {
  const idNum = Number(bookingId);
  if (!Number.isFinite(idNum)) return null;

  const b = await apiRequest<GetBookingResponse>(`/bookings/${idNum}`, { method: "GET" }).catch(() => null);
  if (!b) return null;

  const mapped = mapToUiStatus(b);
  if (!mapped) return null;
  const { status, state } = mapped;
  const nowISO = new Date().toISOString();

  const car = b.carId ? await enrichCar(b.carId).catch(() => undefined) : undefined;

  return {
    id: String(b.id),
    status,
    state,
    startDate: toISODateOnlyOrDateTime(b.carBookingDateFrom),
    endDate: toISODateOnlyOrDateTime(b.carBookingDateTo),
    car,
    flat: undefined,
    rating: undefined,
    createdAtISO: nowISO,
    cancelledAtISO: state === "Cancelled" ? nowISO : undefined,
  };
}

/**
 * POST /bookings
 * Backend expects an ARRAY of CreateBookingRequest and returns ARRAY of BookingResponse.
 */
export async function createCarBookingOnBackend(args: {
  carId: number;
  dateFromISO: string; // date-time ISO
  dateToISO: string; // date-time ISO
  pickupLocationId?: number;
  returnLocationId?: number;
}): Promise<string> {
  const userId = await requireUserId();

  const body: CreateBookingRequest[] = [
    {
      userId,
      carId: args.carId,
      pickupLocationId: args.pickupLocationId,
      returnLocationId: args.returnLocationId,
      carBookingDateFrom: toBackendLocalDateTime(args.dateFromISO),
      carBookingDateTo: toBackendLocalDateTime(args.dateToISO),
    },
  ];

  const res = await apiRequest<BookingResponse[]>("/bookings", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const first = Array.isArray(res) ? res[0] : undefined;
  if (!first?.id) throw new Error("Booking created but no id returned by backend.");

  return String(first.id);
}

/**
 * POST /bookings/{bookingId}/cancel-car
 */
export async function cancelCarBookingOnBackend(bookingId: string): Promise<void> {
  const idNum = Number(bookingId);
  if (!Number.isFinite(idNum)) throw new Error("Invalid bookingId.");
  await apiRequest<void>(`/bookings/${idNum}/cancel-car`, { method: "POST" });
}

/**
 * POST /bookings/{bookingId}/cancel-flat
 */
export async function cancelFlatBookingOnBackend(bookingId: string): Promise<void> {
  const idNum = Number(bookingId);
  if (!Number.isFinite(idNum)) throw new Error("Invalid bookingId.");
  await apiRequest<void>(`/bookings/${idNum}/cancel-flat`, { method: "POST" });
}
