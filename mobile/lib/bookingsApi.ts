// lib/bookingsApi.ts
import { apiRequest } from "./apiClient";
import { getProfile } from "./profileStorage";

// -------------------------
// App-facing types
// -------------------------
export type BookingStatus = "current" | "history";
export type BookingState = "Booked" | "Cancelled";

export type BookingCar = {
  brand: string;
  model: string;

  // backend doesn't really store it -> keep for back-compat, but we won't show it in UI
  plate: string;

  images: string[];

  // ✅ extra car details (like Search)
  fuelType?: string;
  color?: string;
  pricePerDay?: number;
  currency?: string;
};

export type BookingFlat = {
  address: string;
  images: string[];
};

export type Booking = {
  id: string; // UI routes use string
  status: BookingStatus; // current/history
  state: BookingState; // Booked/Cancelled label

  startDate: string;
  endDate: string;

  car?: BookingCar;
  flat?: BookingFlat;

  createdAtISO: string;
  cancelledAtISO?: string;
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
  name?: string; // CREATED / COMPLETED / CANCELLED
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
// Small utils
// -------------------------
function normalizeKey(s: any): string {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function extractFeatureValue(features: CarFeatureDto[] | undefined, wanted: string): string | undefined {
  if (!Array.isArray(features)) return undefined;
  const w = normalizeKey(wanted);

  for (const f of features) {
    const k = normalizeKey(f?.name);
    if (!k) continue;

    if (k === w) return String(f.value ?? "").trim() || undefined;

    // common variants
    if (w === "fueltype" && (k === "fuel type" || k === "fuel" || k === "fueltype")) {
      return String(f.value ?? "").trim() || undefined;
    }
  }
  return undefined;
}

function makeSinglePlaceholderUrl(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed + "_" + Math.floor(Math.random() * 1e9))}/900/600`;
}

function toISODateOnlyOrDateTime(iso?: string): string {
  return iso ? String(iso) : "";
}

function upper(s?: string): string {
  return String(s ?? "").trim().toUpperCase();
}

type BackendBookingStatus = "CREATED" | "COMPLETED" | "CANCELLED" | "UNKNOWN";

/**
 * Prefer carStatus if present; otherwise use flatStatus.
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

function mapToUiStatus(b: GetBookingResponse): { status: BookingStatus; state: BookingState } | null {
  const s = getEffectiveBackendStatus(b);

  if (s === "CREATED") return { status: "current", state: "Booked" };
  if (s === "COMPLETED") return { status: "history", state: "Booked" };
  if (s === "CANCELLED") return { status: "history", state: "Cancelled" };

  return null;
}

async function enrichCar(carId: number): Promise<BookingCar | undefined> {
  const dto = await apiRequest<GetCarResponseDto>(`/cars/${carId}`, { method: "GET" });

  const brand = extractFeatureValue(dto.carFeatures, "brand") ?? "—";
  const model = extractFeatureValue(dto.carFeatures, "model") ?? "—";

  const fuelType =
    extractFeatureValue(dto.carFeatures, "fuelType") ??
    extractFeatureValue(dto.carFeatures, "fuel type") ??
    undefined;

  const color = extractFeatureValue(dto.carFeatures, "color") ?? undefined;

  const pricePerDay = typeof dto.price === "number" ? dto.price : undefined;
  const currency = "PLN"; // your app assumes PLN elsewhere too

  const urls = Array.isArray(dto.urls)
    ? dto.urls.filter((u): u is string => typeof u === "string" && u.trim())
    : [];
  const images = urls.length > 0 ? urls : [makeSinglePlaceholderUrl(`booking_car_${carId}`)];

  return {
    brand,
    model,
    plate: "—", // keep but DO NOT show in UI
    images,
    fuelType,
    color,
    pricePerDay,
    currency,
  };
}

async function requireUserId(): Promise<number> {
  const p = await getProfile();
  if (!p.userId) throw new Error("No userId in profile. Please log in again.");
  return p.userId;
}

function toBackendLocalDateTime(iso: string): string {
  // If you pass "YYYY-MM-DDTHH:mm:ss" already, keep it.
  // If you pass with timezone, backend expects LocalDateTime (no zone).
  // Safe quick strip: take first 19 chars "YYYY-MM-DDTHH:mm:ss"
  const s = String(iso ?? "").trim();
  if (!s) return s;
  if (s.length >= 19) return s.slice(0, 19);
  return s;
}

// -------------------------
// Public API
// -------------------------

/**
 * GET /bookings?userId=...
 */
export async function getBookingsFromBackend(): Promise<Booking[]> {
  const userId = await requireUserId();

  const qs = new URLSearchParams();
  qs.set("userId", String(userId));

  const rows = await apiRequest<GetBookingResponse[]>(`/bookings?${qs.toString()}`, { method: "GET" });
  const list = Array.isArray(rows) ? rows : [];

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
        createdAtISO: nowISO,
        cancelledAtISO: state === "Cancelled" ? nowISO : undefined,
      } satisfies Booking;
    })
  );

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
    createdAtISO: nowISO,
    cancelledAtISO: state === "Cancelled" ? nowISO : undefined,
  };
}

/**
 * POST /bookings
 */
export async function createCarBookingOnBackend(args: {
  carId: number;
  dateFromISO: string;
  dateToISO: string;
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
