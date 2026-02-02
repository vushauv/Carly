// lib/carlyApi.ts
import type { CarCard, CarColor, CarSearchFilters, FuelType } from "./models";
import { getReferenceData } from "./referenceDataApi";
import { getCachedReferenceData, setCachedReferenceData } from "./referenceDataStorage";

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
  brands: ["Volkswagen", "BMW", "Audi", "Toyota", "Skoda"],
  modelsByBrand: {
    "*": ["Passat", "Golf", "Polo", "3 Series", "1 Series", "X1", "A4", "A3", "Q3", "Corolla", "Yaris", "RAV4", "Octavia", "Fabia", "Superb"],
  },
  colors: ["black", "white", "silver", "gray", "red", "blue", "green", "yellow", "orange", "brown"],
  fuels: ["gas", "diesel", "electric", "hybrid"],
};

let MEMO_LOOKUPS: SearchLookups | null = null;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------
// Normalizers
// ---------------------
function normalizeKey(name: unknown): string {
  return String(name ?? "")
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
      console.log("[REFDATA] brands#", lookups.brands.length, "models#", lookups.modelsByBrand["*"]?.length ?? 0, "colors#", lookups.colors.length, "fuels#", lookups.fuels.length);
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
// Mock car generation (still local for now)
// ---------------------
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function seededNumber(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

function makeMockCars(seed: string, count: number, lookups: SearchLookups): CarCard[] {
  const cars: CarCard[] = [];
  const brands = lookups.brands.length ? lookups.brands : FALLBACK_LOOKUPS.brands;
  const models = (lookups.modelsByBrand["*"] ?? []).length ? (lookups.modelsByBrand["*"] ?? []) : (FALLBACK_LOOKUPS.modelsByBrand["*"] ?? []);
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

export async function searchCars(filters: CarSearchFilters & { __page?: number }): Promise<CarCard[]> {
  // Keeping your original mocked paging behavior
  await sleep(220);

  const lookups = await getSearchLookups();

  const page = filters.__page ?? 0;
  const seed = JSON.stringify({ filters, page });

  const all = makeMockCars(seed, 12, lookups);
  return applyFilters(all, filters);
}

// These exist because SearchTab calls them (even though they do nothing now)
export async function likeCar(_carId: string): Promise<void> {
  await sleep(60);
}

export async function dislikeCar(_carId: string): Promise<void> {
  await sleep(60);
}
