// referenceService.ts
import { API_CONFIG, buildApiUrl, apiRequest } from "./api.config";
import type { ReferenceDictionary } from "./reference.types";

export const referenceService = {
  get: async (include: string[]) => {
    const params = new URLSearchParams();
    include.forEach(i => params.append("include", i));

    const url = `${buildApiUrl(API_CONFIG.ENDPOINTS.REFERENCE)}?${params.toString()}`;
    return apiRequest<ReferenceDictionary[]>(url);
  }
};
