// lib/referenceDataApi.ts
import { apiRequest } from "./apiClient";

export type ReferenceInclude =
  | "CAR_COLORS"
  | "CAR_BRANDS"
  | "CAR_FUEL_TYPES"
  | "CAR_MODELS"
  | "CAR_STATUSES"
  | "PICKUP_LOCATIONS"
  | "RETURN_LOCATIONS";

export type LocationDto = {
  id: number;
  address?: string;
  latitude?: number;
  longitude?: number;
};

export type LookupDictionaryDto = {
  dictionaryId?: number;
  name?: string;       // e.g. "CAR_BRANDS"
  values?: string[];   // e.g. ["BMW","Audi"]
};

export type ReferenceDataDto = {
  pickupLocations?: LocationDto[];
  returnLocations?: LocationDto[];
  referenceData?: LookupDictionaryDto[];
};

function buildIncludeQuery(include?: ReferenceInclude[]): string {
  if (!include || include.length === 0) return "";
  const qs = new URLSearchParams();
  for (const inc of include) qs.append("include", inc);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

/**
 * Calls ReferenceDataController:
 * GET /reference/data?include=CAR_COLORS&include=CAR_BRANDS...
 */
export async function getReferenceData(include?: ReferenceInclude[]): Promise<ReferenceDataDto> {
  const q = buildIncludeQuery(include);
  return apiRequest<ReferenceDataDto>(`/reference/data${q}`, { method: "GET" });
}
