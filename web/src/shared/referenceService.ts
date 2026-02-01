// src/shared/api/referenceService.ts

import { API_CONFIG, apiRequest, buildApiUrl } from "./api.config";
import type { PickupLocation } from "../components/Bookings/BookingCreatePage/types";

/* =======================
   Generic reference types
   ======================= */

export type ReferenceDictionary = {
  dictionaryId: number;
  name: string;      // e.g. "CAR_BRANDS", "CAR_COLORS"
  values: string[];
};

export type ReferenceResponse = {
  referenceData: ReferenceDictionary[];
};

/* =======================
   API service
   ======================= */

export const referenceService = {
  /**
   * Car-related dictionaries (used in car create/edit forms)
   */
  getCarReferences: async (): Promise<ReferenceResponse> => {
    const params = new URLSearchParams();

    [
      "CAR_COLORS",
      "CAR_BRANDS",
      "CAR_FUEL_TYPES",
      "CAR_MODELS",
      "CAR_STATUSES",
    ].forEach((v) => params.append("include", v));

    const url = `${API_CONFIG.BASE_URL}/reference/data?${params.toString()}`;
    return apiRequest<ReferenceResponse>(url);
  },

  /**
   * Pickup / return locations (used in bookings)
   */
  fetchPickupLocations: async (): Promise<PickupLocation[]> => {
    const url = buildApiUrl("/reference/data") + "?include=PICKUP_LOCATIONS";
  
    const res = await apiRequest<{
      pickupLocations: PickupLocation[];
    }>(url);
  
    return res.pickupLocations;
  },
  
};
