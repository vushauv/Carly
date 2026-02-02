// Car API service - connects to localhost:8080
import type { Car, CreateCarRequest, UpdateCarRequest, CarImage, CarSearchFilters } from "./types";
import { API_CONFIG, buildApiUrl, apiRequest } from "../../../shared/api.config";

export const carService = {
  /**
   * Retrieves a paginated list of cars with optional filtering
   * Maps to: GET /api/cars?searchParams={filters}&page={pageNumber}&size={pageSize}
   */


  async getAllCars(pageNumber: number = 0, pageSize: number = 3, filters?: Partial<CarSearchFilters>): Promise<{cars: Car[], totalCount: number}> {
    console.log(`[CarService] Fetching cars: page ${pageNumber}, size ${pageSize}`, filters ? `with filters: ${JSON.stringify(filters)}` : '');
    
    const params = new URLSearchParams({
      page: pageNumber.toString(),
      size: pageSize.toString(),
    });

    // Add filters as individual query parameters instead of JSON searchParams
    if (filters && Object.keys(filters).length > 0) {
      // Add feature filters with dot notation
      if (filters.color) params.append('features.color', filters.color);
      if (filters.brand) params.append('features.brand', filters.brand);
      if (filters.model) params.append('features.model', filters.model);
      if (filters.fuelType) params.append('features.fuelType', filters.fuelType);
      if (filters.status) params.append('features.status', filters.status);
      
      // Add date filters
      if (filters.dateFrom) params.append('date.from', `${filters.dateFrom}T08:49:22.761Z`);
      if (filters.dateTo) params.append('date.to', `${filters.dateTo}T08:49:22.761Z`);
      
      // Add price filters
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    }

    console.log("Params:")
    console.log(params)

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CARS) + `?${params}`;
    console.log(`[CarService] request URL: ${url}`);
    
    try {
      const response = await apiRequest<Car[]>(url);
      console.log(`[CarService] Raw response:`, response);
      
      // API returns array directly, not paginated response object
      const cars = Array.isArray(response) ? response : [];
      console.log(`[CarService] Extracted cars:`, cars);
      
      return {
        cars: cars,
        totalCount: cars.length // For now, using array length
      };
    } catch (error) {
      console.error(`[CarService] Error in getAllCars:`, error);
      throw error;
    }
  },

  /**
   * Retrieves detailed information for a specific car by its ID
   * Maps to: GET /api/cars/{carId}
   */
  async getCarById(id: number): Promise<Car> {
    console.log(`Fetching car by ID: ${id}`);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CARS, id);
    return await apiRequest<Car>(url);
  },

  /**
   * Creates a new car in the system
   * Maps to: POST /api/cars
   */
  async createCar(data: CreateCarRequest): Promise<{ carId: number }> {
    console.log("Creating new car:", data);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CARS);
    return await apiRequest<{ carId: number }>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Updates an existing car's information
   * Maps to: PUT /api/cars/{carId}
   */
  async updateCar(id: number, data: UpdateCarRequest): Promise<void> {
    
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CARS, id);
    console.log(`Updating car ${id}:`, data);
    console.log(url)
    await apiRequest<void>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    console.log("Car updated successfully");
  },

  /**
   * Permanently removes a car from the system
   * Maps to: DELETE /api/cars/{carId}
   */
  async deleteCar(id: number): Promise<void> {
    console.log(`Deleting car ${id}`);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CARS, id);

    console.log(url)

    await apiRequest<void>(url, {
      method: 'DELETE',
    });
    
    console.log("Car deleted successfully");
  },

  /**
   * Retrieves all images for a specific car
   * Maps to: GET /api/cars/{carId}/images
   */
  async getCarImages(carId: number): Promise<CarImage[]> {
    console.log(`Fetching images for car ${carId}`);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CARS, carId, 'images');
    const response = await apiRequest<{images: CarImage[]}>(url);
    
    return response.images || [];
  },


  async uploadCarImage(carId: number, file: File): Promise<CarImage> {
    console.log(`Uploading image for car ${carId}:`, file.name);
  
    let uploadFile = file;
  
    // compress if larger than 900KB (safe margin)
    if (file.size > 900 * 1024) {
      uploadFile = await compressImage(file);
      console.log(
        `Compressed from ${file.size} → ${uploadFile.size}`
      );
    }
  
    const formData = new FormData();
    formData.append("file", uploadFile);
  
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CARS, carId, "images");
  
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
  
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
  
    return await response.json();
  },
  
  
  
  async deleteCarImage(carId: number, imageId: number): Promise<void> {
    console.log(`Deleting image ${imageId} from car ${carId}`);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CARS, carId, 'images', imageId);
    await apiRequest<void>(url, {
      method: 'DELETE',
    });
    
    console.log("Car image deleted successfully");
  },


  async searchCars(filters: Partial<CarSearchFilters>, pageNumber: number = 0, pageSize: number = 10): Promise<{cars: Car[], totalCount: number}> {
    console.log(`Searching cars with filters:`, filters);
    return this.getAllCars(pageNumber, pageSize, filters);
  },

  async getTotalCars(): Promise<number> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CARS, 'count');
    const response = await apiRequest<{count: number}>(url);
    return response.count || 0;
  },
};



const compressImage = async (
  file: File,
  maxWidth = 1600,
  quality = 0.8
): Promise<File> => {
  const imageBitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxWidth / imageBitmap.width);
  const width = imageBitmap.width * scale;
  const height = imageBitmap.height * scale;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(imageBitmap, 0, 0, width, height);

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob(
      (b) => resolve(b!),
      "image/jpeg",
      quality
    )
  );

  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  });
};