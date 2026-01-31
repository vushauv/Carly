// Car types based on API schema
export interface CarFeature {
  dictionaryId: number;
  name: string;
  value: string;
}

export interface Car {
  carId: number;
  carFeatures: CarFeature[];
  urls: string[];
  price: number;
}

export interface CreateCarRequest {
  carFeatures: CarFeature[];
  price: number;
}

export interface UpdateCarRequest {
  carFeatures?: CarFeature[];
  price: number;
}

export interface CarImage {
  imageId: number;
  fileUri: string;
  fileType: string;
  fileSize: number;
}

export interface CarSearchFilters {
  color?: string;
  brand?: string;
  model?: string;
  fuelType?: string;
  status?: string;
  availability?: "AVAILABLE" | "RENTED";
  priceMin?: number;
  priceMax?: number;
}