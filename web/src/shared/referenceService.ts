// referenceService.ts
import { API_CONFIG, apiRequest } from "./api.config";



export type ReferenceResponse = {
  referenceData: ReferenceDictionary[];
};


  
  export type ReferenceDictionary = {
    dictionaryId: number;
    name: string;          // "Brand", "Color", etc.
    values: string[];
  };


export const referenceService = {
  getCarReferences: async () => {
    const params = new URLSearchParams();
    [
      "CAR_COLORS",
      "CAR_BRANDS",
      "CAR_FUEL_TYPES",
      "CAR_MODELS",
      "CAR_STATUSES"
    ].forEach(v => params.append("include", v));

    const url = `${API_CONFIG.BASE_URL}/reference/data?${params.toString()}`;
    return apiRequest<ReferenceResponse>(url);
  }
};
