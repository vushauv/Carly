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
  min: number; // always present in this app (default 0)
  max: number; // always present in this app (default 500)
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

  // Display
  title: string; // e.g. "Volkswagen Passat"
  subtitle?: string; // e.g. "Diesel • blue"

  // Car attributes (subset for now)
  brand: string;
  model: string;
  fuelType: FuelType;
  color: CarColor;

  // Pricing
  currency: "PLN" | "EUR" | "USD";
  pricePerDay: number;

  // Optional
  rating?: number; // 0..5
  imageUrl?: string; // https URL
  raw?: unknown; // backend DTO later
};
