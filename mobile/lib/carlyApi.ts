// lib/carlyApi.ts
import type { CarCard, CarColor, CarSearchFilters, FlatCard, FuelType } from "./models";

export type SearchLookups = {
  brands: string[];
  modelsByBrand: Record<string, string[]>;
  colors: CarColor[];
};

const LOOKUPS: SearchLookups = {
  brands: ["Volkswagen", "BMW", "Audi", "Toyota", "Skoda"],
  modelsByBrand: {
    Volkswagen: ["Passat", "Golf", "Polo"],
    BMW: ["3 Series", "1 Series", "X1"],
    Audi: ["A4", "A3", "Q3"],
    Toyota: ["Corolla", "Yaris", "RAV4"],
    Skoda: ["Octavia", "Fabia", "Superb"],
  },
  colors: ["black", "white", "silver", "gray", "red", "blue", "green", "yellow", "orange", "brown"],
};

const FUELS: FuelType[] = ["gas", "diesel", "electric", "hybrid"];

export async function getSearchLookups(): Promise<SearchLookups> {
  await sleep(120);
  return LOOKUPS;
}

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

function makeMockCars(seed: string, count: number): CarCard[] {
  const cars: CarCard[] = [];

  for (let i = 0; i < count; i++) {
    const s = `${seed}::${i}`;

    const brandIdx = Math.floor(seededNumber(s + "::brand") * LOOKUPS.brands.length);
    const brand = LOOKUPS.brands[brandIdx];
    const modelList = LOOKUPS.modelsByBrand[brand] ?? [];
    const modelIdx = modelList.length ? Math.floor(seededNumber(s + "::model") * modelList.length) : 0;
    const model = modelList[modelIdx] ?? "Model";

    const fuelType = FUELS[Math.floor(seededNumber(s + "::fuel") * FUELS.length)];
    const color = LOOKUPS.colors[Math.floor(seededNumber(s + "::color") * LOOKUPS.colors.length)];

    const pricePerDay = 40 + Math.floor(seededNumber(s + "::price") * 560); // 40..599
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

  const min = filters.priceRange?.min ?? 0;
  const max = filters.priceRange?.max ?? 500;

  out = out.filter((c) => c.pricePerDay >= min && c.pricePerDay <= max);

  out.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.pricePerDay - b.pricePerDay);

  return out;
}

export async function searchCars(filters: CarSearchFilters & { __page?: number }): Promise<CarCard[]> {
  const page = filters.__page ?? 0;
  const seed = JSON.stringify({ ...filters, __page: page });

  const base = makeMockCars(seed, 120);
  const filtered = applyFilters(base, filters);

  await sleep(220);
  return filtered;
}

export async function likeCar(carId: string): Promise<void> {
  await sleep(80);
  // eslint-disable-next-line no-console
  console.log("[likeCar]", carId);
}

export async function dislikeCar(carId: string): Promise<void> {
  await sleep(80);
  // eslint-disable-next-line no-console
  console.log("[dislikeCar]", carId);
}

// --------------------
// Flatly partner mocks
// --------------------

function makeMockFlats(seed: string, count: number): FlatCard[] {
  const titles = ["Cozy Studio", "Modern Apartment", "Sunny Loft", "Family Flat", "Old Town Place", "Business Suite"];
  const streets = ["Sesame Street", "Main Street", "River Road", "Oak Avenue", "Pine Street", "Market Square"];
  const cities = ["Warsaw", "Krakow", "Gdansk", "Wroclaw", "Poznan"];

  const flats: FlatCard[] = [];
  for (let i = 0; i < count; i++) {
    const s = `${seed}::flat::${i}`;
    const title = titles[Math.floor(seededNumber(s + "::t") * titles.length)];
    const street = streets[Math.floor(seededNumber(s + "::s") * streets.length)];
    const city = cities[Math.floor(seededNumber(s + "::c") * cities.length)];
    const no = 10 + Math.floor(seededNumber(s + "::n") * 190);

    const pricePerNight = 90 + Math.floor(seededNumber(s + "::p") * 360); // 90..449
    const rating = Math.round(clamp(3.5 + seededNumber(s + "::r") * 1.5, 0, 5) * 10) / 10;

    const id = `flat_${city}_${street}_${no}_${i}`;

    flats.push({
      id,
      title,
      addressLine: `${street} ${no}`,
      city,
      currency: "PLN",
      pricePerNight,
      rating,
      imageUrls: [
        `https://picsum.photos/seed/${encodeURIComponent(id + "_1")}/900/600`,
        `https://picsum.photos/seed/${encodeURIComponent(id + "_2")}/900/600`,
        `https://picsum.photos/seed/${encodeURIComponent(id + "_3")}/900/600`,
      ],
      raw: { seed, i },
    });
  }
  return flats;
}

/**
 * Flatly returns flats available for the *same period* as the booked car.
 * No filtering, no changing dates on the client.
 */
export async function getPartnerFlatsForPeriod(dateFromISO: string, dateToISO: string): Promise<FlatCard[]> {
  const seed = JSON.stringify({ dateFromISO, dateToISO });
  await sleep(260);
  return makeMockFlats(seed, 10);
}

/** Flat booking stub */
export async function bookFlat(flatId: string, dateFromISO: string, dateToISO: string): Promise<void> {
  await sleep(220);
  // eslint-disable-next-line no-console
  console.log("[bookFlat]", { flatId, dateFromISO, dateToISO });
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
