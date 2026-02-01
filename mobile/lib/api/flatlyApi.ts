//mobile/lib/api/flatlyApi.ts

import { apiRequest } from "./apiClient";
import { getProfile } from "../storage/profileStorage";
import type { FlatCard } from "../models";

// -------------------------
// Backend DTOs (OpenAPI)
// -------------------------
type FlatlyFlatImageDto = {
  id?: number;
  flat_id?: number;
  image_url?: string;
  sort_order?: number;
  created_at?: string;
};

type FlatlyPricingRuleDto = {
  price_per_night?: number;
  cleaning_fee?: number;
  min_nights?: number;
  is_active?: boolean;
  start_date?: string; // date
  end_date?: string; // date
};

type FlatlyFlatDto = {
  id: number;
  name?: string;
  description?: string;
  status?: string;
  country?: string;
  city?: string;
  location?: string;
  rooms?: number;
  beds?: number;
  bathrooms?: number;
  floor?: number;
  images?: FlatlyFlatImageDto[];
  pricing?: FlatlyPricingRuleDto[];
  address_line?: string;
  postal_code?: string;
  area_sqm?: number;
  max_guests?: number;
};

type FlatlyBookingDto = {
  id: number;
  currency?: string;
  status?: string;
  comment?: string;
  flat_id: number;
  user_id?: number;
  source_ref?: number;
  check_in_date?: string; // date
  check_out_date?: string; // date
  guests_count?: number;
  price_per_night?: number;
  total_price?: number;
  created_at?: string; // date-time
  updated_at?: string; // date-time
  cancelled_at?: string; // date-time
};

type CreateFlatlyBookingRequest = {
  userId: number;
  flatId: number;
  dateFrom: string; // date-time
  dateTo: string; // date-time
  guestsCount?: number;
};

type BookingResponse = { id: number };

// -------------------------
// Helpers
// -------------------------
function toBackendLocalDateTime(dayISO: string, hhmmss = "12:00:00"): string {
  // Flatly available endpoint expects date-time query params (OpenAPI says date-time)
  // We keep the same local-date-time style used elsewhere in your app.
  return `${dayISO}T${hhmmss}`;
}

function placeholder(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/900/600`;
}

function pickPricePerNight(dto: FlatlyFlatDto): number {
  // If pricing rules exist, pick the first active price_per_night; else 0.
  const rules = Array.isArray(dto.pricing) ? dto.pricing : [];
  const active = rules.find((r) => r?.is_active && typeof r.price_per_night === "number");
  const any = rules.find((r) => typeof r.price_per_night === "number");
  return (active?.price_per_night ?? any?.price_per_night ?? 0) as number;
}

function mapFlatDtoToCard(dto: FlatlyFlatDto): FlatCard {
  const id = String(dto.id);
  const title = (dto.name ?? "Flat").trim() || "Flat";
  const addressLine = (dto.address_line ?? dto.location ?? "—").trim() || "—";
  const city = (dto.city ?? "—").trim() || "—";

  const imgsRaw = Array.isArray(dto.images) ? dto.images : [];
  const urls = imgsRaw
    .map((x) => String(x?.image_url ?? "").trim())
    .filter((u) => u.length > 0);

  const imageUrls = urls.length ? urls : [placeholder(`flat_${id}`)];

  return {
    id,
    title,
    addressLine,
    city,
    currency: "PLN",
    pricePerNight: pickPricePerNight(dto),
    rating: undefined, // FlatlyFlatDto doesn’t expose rating in OpenAPI
    imageUrls,
    raw: dto,
  };
}

async function requireUserId(): Promise<number> {
  const p = await getProfile();
  if (!p.userId) throw new Error("No userId in profile. Please log in again.");
  return p.userId;
}

// -------------------------
// Public API
// -------------------------
export async function getAvailableFlats(dateFromDayISO: string, dateToDayISO: string): Promise<FlatCard[]> {
  const from = toBackendLocalDateTime(dateFromDayISO, "12:00:00");
  const to = toBackendLocalDateTime(dateToDayISO, "12:00:00");

  const qs = new URLSearchParams();
  qs.set("dateFrom", from);
  qs.set("dateTo", to);

  const rows = await apiRequest<FlatlyFlatDto[]>(`/flatly/flats/available?${qs.toString()}`, { method: "GET" });
  const list = Array.isArray(rows) ? rows : [];
  return list.map(mapFlatDtoToCard);
}

export async function getFlatDetails(flatId: number): Promise<FlatlyFlatDto> {
  return apiRequest<FlatlyFlatDto>(`/flatly/flats/${flatId}`, { method: "GET" });
}

export async function getFlatBookingDetails(flatBookingId: number): Promise<FlatlyBookingDto> {
  return apiRequest<FlatlyBookingDto>(`/flatly/flat-bookings/${flatBookingId}`, { method: "GET" });
}

export async function createFlatlyBooking(args: {
  flatId: number;
  dateFromDayISO: string;
  dateToDayISO: string;
  guestsCount?: number;
}): Promise<number> {
  const userId = await requireUserId();

  const body: CreateFlatlyBookingRequest = {
    userId,
    flatId: args.flatId,
    dateFrom: toBackendLocalDateTime(args.dateFromDayISO, "12:00:00"),
    dateTo: toBackendLocalDateTime(args.dateToDayISO, "12:00:00"),
    guestsCount: args.guestsCount ?? 1,
  };

  const res = await apiRequest<BookingResponse>(`/flatly/bookings`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res?.id) throw new Error("Flat booking created but no id returned by backend.");
  return res.id;
}

export async function cancelFlatlyBooking(flatBookingId: number): Promise<void> {
  await apiRequest<string>(`/flatly/bookings/${flatBookingId}`, { method: "DELETE" });
}
