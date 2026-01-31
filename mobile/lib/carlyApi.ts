// lib/carlyApi.ts
import type { CarCard, CarColor, CarSearchFilters, FuelType } from "./models";
import { getReferenceData } from "./referenceDataApi";
import { getCachedReferenceData, setCachedReferenceData } from "./referenceDataStorage";
import { apiRequest, ApiError } from "./apiClient";

export type SearchLookups = {
  brands: string[];
  modelsByBrand: Record<string, string[]>; // UI expects this shape
  colors: CarColor[];
  fuels: FuelType[]; // not currently used by UI (fuel UI is hardcoded), but useful later
};

// ---------------------
// Fallback (if backend down)
// ---------------------
const FALLBACK_LOOKUPS: SearchLookups = {
  brands: ["BMW", "Audi", "Toyota", "Skoda", "Mercedes"],
  modelsByBrand: {
    "*": ["X5", "A4", "Corolla", "Octavia", "C-Class"],
    BMW: ["X5", "3 Series", "5 Series"],
    Audi: ["A3", "A4", "Q5"],
    Toyota: ["Corolla", "Yaris", "RAV4"],
    Skoda: ["Octavia", "Fabia", "Superb"],
    Mercedes: ["C-Class", "E-Class", "GLA"],
  },
  colors: ["black", "white", "silver", "gray", "red", "blue", "green", "yellow", "orange", "brown"],
  fuels: ["gas", "diesel", "electric", "hybrid"],
};

// ---------------------
// In-memory memo for lookups
// ---------------------
let MEMO_LOOKUPS: SearchLookups | null = null;

// ---------------------
// Small utils
// ---------------------
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeKey(s: any): string {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " "); // "Fuel type" -> "fuel type"
}

function normalizeFuel(v: string): FuelType | null {
  const s = v.trim().toLowerCase();
  if (s === "gas") return "gas";
  if (s === "diesel") return "diesel";
  if (s === "electric") return "electric";
  if (s === "hybrid") return "hybrid";
  return null;
}

const ALLOWED_COLORS = new Set<CarColor>([
  "black",
  "white",
  "silver",
  "gray",
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "brown",
]);

function normalizeColor(v: string): CarColor | null {
  const s = v.trim().toLowerCase();
  return ALLOWED_COLORS.has(s as CarColor) ? (s as CarColor) : null;
}

function uniqueStrings(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    const t = s.trim();
    if (!t) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function buildFlatModelsByBrand(brands: string[], models: string[]): Record<string, string[]> {
  // No brand-model coupling: every brand sees the same models list
  const map: Record<string, string[]> = { "*": models };
  for (const b of brands) map[b] = models;
  return map;
}

function parseReferenceDataToLookups(ref: any): SearchLookups {
  const dicts = Array.isArray(ref?.referenceData) ? ref.referenceData : [];

  // Map friendly name -> values
  const byName: Record<string, string[]> = {};
  for (const d of dicts) {
    const key = normalizeKey(d?.name);
    const vals = Array.isArray(d?.values) ? d.values.filter((x: any) => typeof x === "string") : [];
    if (!key) continue;
    byName[key] = vals;
  }

  // Backend example names: "Fuel type", "Brand", "Color", "Model", "Status"
  const rawBrands = byName["brand"] ?? [];
  const rawModels = byName["model"] ?? [];
  const rawColors = byName["color"] ?? [];
  const rawFuels = byName["fuel type"] ?? byName["fuel"] ?? [];

  const brands = uniqueStrings(rawBrands);
  const models = uniqueStrings(rawModels);
  const colors = uniqueStrings(rawColors)
    .map(normalizeColor)
    .filter((x): x is CarColor => !!x);

  const fuels = uniqueStrings(rawFuels)
    .map(normalizeFuel)
    .filter((x): x is FuelType => !!x);

  return {
    brands,
    modelsByBrand: buildFlatModelsByBrand(brands, models),
    colors,
    fuels,
  };
}

// ---------------------
// Public API used by SearchTab
// ---------------------
export async function getSearchLookups(): Promise<SearchLookups> {
  // in-memory memo first (fast)
  if (MEMO_LOOKUPS) return MEMO_LOOKUPS;

  // AsyncStorage cache second
  const cached = await getCachedReferenceData();
  if (cached) {
    const lookups = parseReferenceDataToLookups(cached);
    MEMO_LOOKUPS = lookups;

    if (__DEV__) {
      console.log("[REFDATA] cache hit");
      console.log("[REFDATA] parsed lookups", lookups);
    }

    return lookups;
  }

  // Backend fetch
  try {
    const ref = await getReferenceData([
      "CAR_COLORS",
      "CAR_BRANDS",
      "CAR_FUEL_TYPES",
      "CAR_MODELS",
      "CAR_STATUSES",
      "PICKUP_LOCATIONS",
      "RETURN_LOCATIONS",
    ]);

    await setCachedReferenceData(ref);

    if (__DEV__) {
      console.log("[REFDATA] fetched /reference/data ok");
      console.log("[REFDATA] raw response", ref);
    }

    const lookups = parseReferenceDataToLookups(ref);
    MEMO_LOOKUPS = lookups;

    if (__DEV__) {
      console.log("[REFDATA] parsed lookups", lookups);
      console.log(
        "[REFDATA] brands#",
        lookups.brands.length,
        "models#",
        lookups.modelsByBrand["*"]?.length ?? 0,
        "colors#",
        lookups.colors.length,
        "fuels#",
        lookups.fuels.length
      );
    }

    return lookups;
  } catch (e: any) {
    if (__DEV__) {
      console.log("[REFDATA] fetch failed, using fallback", e?.message ?? e);
    }
    MEMO_LOOKUPS = FALLBACK_LOOKUPS;
    return FALLBACK_LOOKUPS;
  }
}

// ---------------------
// Mocked cars (old approach)
// (kept for offline fallback / debug, but searchCars now hits backend)
// ---------------------
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function seededNumber(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // 0..1
  return (h >>> 0) / 4294967295;
}

function makeMockCars(seed: string, count: number, lookups: SearchLookups): CarCard[] {
  const cars: CarCard[] = [];

  const brands = lookups.brands.length ? lookups.brands : FALLBACK_LOOKUPS.brands;
  const models = (lookups.modelsByBrand["*"] ?? []).length
    ? lookups.modelsByBrand["*"] ?? []
    : FALLBACK_LOOKUPS.modelsByBrand["*"] ?? [];
  const colors = lookups.colors.length ? lookups.colors : FALLBACK_LOOKUPS.colors;
  const fuels = lookups.fuels.length ? lookups.fuels : FALLBACK_LOOKUPS.fuels;

  for (let i = 0; i < count; i++) {
    const s = `${seed}::${i}`;

    const brand = brands[Math.floor(seededNumber(s + "::brand") * brands.length)] ?? "Brand";
    const model = models[Math.floor(seededNumber(s + "::model") * models.length)] ?? "Model";
    const fuelType = fuels[Math.floor(seededNumber(s + "::fuel") * fuels.length)] ?? "gas";
    const color = colors[Math.floor(seededNumber(s + "::color") * colors.length)] ?? "black";

    const pricePerDay = 40 + Math.floor(seededNumber(s + "::price") * 560);
    const rating = Math.round(clamp(3.4 + seededNumber(s + "::rating") * 1.6, 0, 5) * 10) / 10;

    const id = `mock_${brand}_${model}_${fuelType}_${color}_${i}`;

    cars.push({
      id,
      title: `${brand} ${model}`,
      subtitle: `${fuelType} • ${color}`,
      brand,
      model,
      fuelType,
      color,
      currency: "PLN",
      pricePerDay,
      rating,
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(id)}/900/600`,
      raw: { seed, i },
    });
  }

  return cars;
}

function applyFilters(all: CarCard[], filters: CarSearchFilters): CarCard[] {
  let out = [...all];

  if (filters.fuelType) out = out.filter((c) => c.fuelType === filters.fuelType);
  if (filters.brand) out = out.filter((c) => c.brand === filters.brand);
  if (filters.model) out = out.filter((c) => c.model === filters.model);
  if (filters.color) out = out.filter((c) => c.color === filters.color);

  if (filters.priceRange?.min != null) out = out.filter((c) => c.pricePerDay >= filters.priceRange.min);
  if (filters.priceRange?.max != null) out = out.filter((c) => c.pricePerDay <= filters.priceRange.max);

  return out;
}

// ---------------------
// Backend DTOs (from OpenAPI)
// ---------------------
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

// ---------------------
// DTO -> UI mapping
// ---------------------
function extractFeatureValue(features: CarFeatureDto[] | undefined, wanted: string): string | undefined {
  if (!Array.isArray(features)) return undefined;
  const w = normalizeKey(wanted);

  for (const f of features) {
    const k = normalizeKey(f?.name);
    if (!k) continue;
    if (k === w) return String(f.value ?? "").trim() || undefined;

    // common variants
    if (w === "fuel type" && (k === "fuel" || k === "fuel type")) return String(f.value ?? "").trim() || undefined;
  }
  return undefined;
}

function normalizeFuelMaybe(v: string | undefined): FuelType | null {
  if (!v) return null;
  return normalizeFuel(v);
}

function normalizeColorMaybe(v: string | undefined): CarColor | null {
  if (!v) return null;
  return normalizeColor(v);
}

function dtoToCard(dto: GetCarResponseDto): CarCard | null {
  const id = String(dto.carId);

  const brand = extractFeatureValue(dto.carFeatures, "brand") ?? "—";
  const model = extractFeatureValue(dto.carFeatures, "model") ?? "—";

  const fuelRaw = extractFeatureValue(dto.carFeatures, "fuel type") ?? extractFeatureValue(dto.carFeatures, "fuel");
  const colorRaw = extractFeatureValue(dto.carFeatures, "color");
if (__DEV__) console.log("[CARS] dto colorRaw:", colorRaw);

  const fuelType = (normalizeFuelMaybe(fuelRaw) ?? "gas") as FuelType;
  const color = (normalizeColorMaybe(colorRaw) ?? "black") as CarColor;

  const pricePerDay = typeof dto.price === "number" ? dto.price : 0;

  const imageUrl =
    Array.isArray(dto.urls) && dto.urls.length > 0 && typeof dto.urls[0] === "string" ? dto.urls[0] : undefined;

  const title = `${brand} ${model}`.trim();
  const subtitle = `${fuelType} • ${color}`;

  return {
    id,
    title: title || "Car",
    subtitle,

    brand,
    model,
    fuelType,
    color,

    currency: "PLN",
    pricePerDay,

    // backend doesn't provide rating in GetCarResponseDto
    rating: undefined,

    imageUrl,
    raw: dto,
  };
}

function applyPriceRange(cards: CarCard[], filters: CarSearchFilters): CarCard[] {
  const min = filters.priceRange?.min ?? 0;
  const max = filters.priceRange?.max ?? Number.POSITIVE_INFINITY;
  return cards.filter((c) => c.pricePerDay >= min && c.pricePerDay <= max);
}

// ---------------------
// ✅ REAL backend search (used by SearchTab)
// ---------------------
function norm(s: any): string {
  return String(s ?? "").trim().toLowerCase();
}

function matchesFilter(a: any, b: any): boolean {
  // case-insensitive equality
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return false;
  return na === nb;
}

function applyLocalFilters(cards: CarCard[], filters: CarSearchFilters): CarCard[] {
  let out = cards;

  if (filters.brand) out = out.filter((c) => matchesFilter(c.brand, filters.brand));
  if (filters.model) out = out.filter((c) => matchesFilter(c.model, filters.model));
  if (filters.color) out = out.filter((c) => matchesFilter(c.color, filters.color));
  if (filters.fuelType) out = out.filter((c) => matchesFilter(c.fuelType, filters.fuelType));

  // priceRange is already local anyway
  const min = filters.priceRange?.min ?? 0;
  const max = filters.priceRange?.max ?? Number.POSITIVE_INFINITY;
  out = out.filter((c) => c.pricePerDay >= min && c.pricePerDay <= max);

  return out;
}
function toBackendEnum(v: string | undefined | null): string | undefined {
  const s = String(v ?? "").trim();
  return s ? s.toUpperCase() : undefined;
}

function normCi(s: any): string {
  return String(s ?? "").trim().toLowerCase();
}
function eqCi(a: any, b: any): boolean {
  const na = normCi(a);
  const nb = normCi(b);
  return !!na && !!nb && na === nb;
}
function applyLocalFiltersCaseInsensitive(cards: CarCard[], filters: CarSearchFilters): CarCard[] {
  let out = cards;

  if (filters.brand) out = out.filter((c) => eqCi(c.brand, filters.brand));
  if (filters.model) out = out.filter((c) => eqCi(c.model, filters.model));
  if (filters.color) out = out.filter((c) => eqCi(c.color, filters.color));
  if (filters.fuelType) out = out.filter((c) => eqCi(c.fuelType, filters.fuelType));

  const min = filters.priceRange?.min ?? 0;
  const max = filters.priceRange?.max ?? Number.POSITIVE_INFINITY;
  out = out.filter((c) => c.pricePerDay >= min && c.pricePerDay <= max);

  return out;
}

export async function searchCars(filters: CarSearchFilters & { __page?: number }): Promise<CarCard[]> {
  const uiPage = filters.__page ?? 0;
  const uiPageSize = 12;

  const hasFeatureFilters = !!(filters.brand || filters.model || filters.color || filters.fuelType);

  // Normalize outgoing filters to backend ALL CAPS
  const bBrand = toBackendEnum(filters.brand);
  const bModel = toBackendEnum(filters.model);
  const bColor = toBackendEnum(filters.color);
  const bFuel = toBackendEnum(filters.fuelType);

  // -------------------------
  // FAST PATH (no filters): use backend paging
  // -------------------------
  if (!hasFeatureFilters) {
    const qs = new URLSearchParams();
    qs.set("page", String(uiPage));
    qs.set("size", String(uiPageSize));

    if (__DEV__) console.log("[CARS] GET /cars (paged)", qs.toString());

    const dtos = await apiRequest<GetCarResponseDto[]>(`/cars?${qs.toString()}`, { method: "GET" });
    const mapped = (Array.isArray(dtos) ? dtos : [])
      .map(dtoToCard)
      .filter((x): x is CarCard => !!x);

    return applyPriceRange(mapped, filters);
  }

  // -------------------------
  // FILTERS ON: DO NOT send page/size
  // This forces backend onto the `page == null` branch (getAll),
  // which is the one that actually applies your criteria reliably.
  // Then we paginate locally for the UI deck.
  // -------------------------
  const qs = new URLSearchParams();

  if (bBrand) qs.set("features.brand", bBrand);
  if (bModel) qs.set("features.model", bModel);
  if (bColor) qs.set("features.color", bColor);
  if (bFuel) qs.set("features.fuelType", bFuel);

  // Optional: explicitly send availability if you ever change default on backend
  // qs.set("availability", "AVAILABLE");

  if (__DEV__) console.log("[CARS] GET /cars (UNPAGED, filtered)", qs.toString());

  const dtosAll = await apiRequest<GetCarResponseDto[]>(`/cars?${qs.toString()}`, { method: "GET" });

  const mappedAll = (Array.isArray(dtosAll) ? dtosAll : [])
    .map(dtoToCard)
    .filter((x): x is CarCard => !!x);

  // Defensive local filtering too (in case backend still does something weird)
  const filteredAll = applyLocalFiltersCaseInsensitive(mappedAll, filters);

  const start = uiPage * uiPageSize;
  const end = start + uiPageSize;
  // If first page has results but next pages don't, DO NOT signal "no more cars"
  if (uiPage > 0 && filteredAll.length <= start) {
    if (__DEV__) {
      console.log("[CARS] end of filtered results, returning null to prevent empty-state");
    }
    // IMPORTANT: prevents SearchTab from showing "No more cars"
    return [];
  }

  const slice = filteredAll.slice(start, end);
  return slice;

}

// These exist because SearchTab calls them (even though they do nothing now)
export async function likeCar(_carId: string): Promise<void> {
  await sleep(60);
}

export async function dislikeCar(_carId: string): Promise<void> {
  await sleep(60);
}
