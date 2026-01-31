// lib/models.ts

export type FuelType = "gas" | "diesel" | "electric" | "hybrid";

export type CarColor =
  | "black"
  | "white"
  | "silver"
  | "gray"
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "brown";

export type PriceRange = {
  min: number;
  max: number;
};

export type CarSearchFilters = {
  fuelType?: FuelType;
  brand?: string;
  model?: string;
  color?: CarColor;
  priceRange: PriceRange;
};

export type CarCard = {
  id: string;
  title: string;
  subtitle?: string;

  brand: string;
  model: string;
  fuelType: FuelType;
  color: CarColor;

  currency: "PLN" | "EUR" | "USD";
  pricePerDay: number;

  rating?: number;

  /** Back-compat: first image */
  imageUrl?: string;

  /** ✅ 0..N images from backend. If backend returns none, we store exactly ONE placeholder. */
  imageUrls?: string[];

  raw?: unknown;
};


// --------------------
// Flatly partner models
// --------------------
export type FlatCard = {
  id: string;

  title: string; // e.g. "Cozy Studio"
  addressLine: string; // e.g. "Sesame Street 123"
  city: string;

  currency: "PLN" | "EUR" | "USD";
  pricePerNight: number;

  rating?: number;
  imageUrls: string[]; // swipable images
  raw?: unknown;
};
