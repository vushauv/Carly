// Car API service - connects to localhost:8080
import type { Car, CreateCarRequest, UpdateCarRequest, CarImage, CarSearchFilters } from "../services/types";
import { API_CONFIG, buildApiUrl, apiRequest } from "../../shared/api.config";

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

    // Add filters as searchParams object if provided
    if (filters && Object.keys(filters).length > 0) {
      // Create searchParams object for the API matching the required structure
      const searchParams: any = {
        features: {
          color: filters.color || undefined,
          brand: filters.brand || undefined,
          model: filters.model || undefined,
          fuelType: filters.fuelType || undefined,
          status: filters.status || undefined
        }
      };

      // Add date range if provided
      if (filters.dateFrom || filters.dateTo) {
        searchParams.date = {
          from: filters.dateFrom ? `${filters.dateFrom}T08:49:22.761Z` : undefined,
          to: filters.dateTo ? `${filters.dateTo}T08:49:22.761Z` : undefined
        };
      }

      // Add price range if provided
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        searchParams.minPrice = filters.minPrice || 0;
        searchParams.maxPrice = filters.maxPrice || 0;
      }
      
      // Remove undefined values from features
      Object.keys(searchParams.features).forEach(key => {
        if (searchParams.features[key] === undefined) {
          delete searchParams.features[key];
        }
      });

      // Remove date object if both dates are undefined
      if (searchParams.date && !searchParams.date.from && !searchParams.date.to) {
        delete searchParams.date;
      }

      // Only add searchParams if there are actual filters
      if (Object.keys(searchParams.features).length > 0 || searchParams.date || searchParams.minPrice !== undefined || searchParams.maxPrice !== undefined) {
        params.append('searchParams', JSON.stringify(searchParams));
      }
    }

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CARS) + `?${params}`;
    console.log(`[CarService] Request URL: ${url}`);
    
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
    console.log(`Updating car ${id}:`, data);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CARS, id);
    await apiRequest<void>(url, {
      method: 'PATCH',
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

  /**
   * Uploads a new image for a car
   * Maps to: POST /api/cars/{carId}/images
   */
  // async uploadCarImage(carId: number, file: File): Promise<CarImage> {
  //   console.log(`Uploading image for car ${carId}:`, file.name);
    
  //   const formData = new FormData();
  //   formData.append('file', file);
    
  //   const url = buildApiUrl(API_CONFIG.ENDPOINTS.CARS, carId, 'images');
    
  //   // Use fetch directly for multipart/form-data
  //   const response = await fetch(url, {
  //     method: 'POST',
  //     body: formData,
  //   });
    
  //   if (!response.ok) {
  //     const errorText = await response.text();
  //     throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  //   }
    
  //   return await response.json();
  // },

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
  
  
  

  

  /**
   * Deletes a specific image from a car
   * Maps to: DELETE /api/cars/{carId}/images/{imageId}
   */
  async deleteCarImage(carId: number, imageId: number): Promise<void> {
    console.log(`Deleting image ${imageId} from car ${carId}`);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CARS, carId, 'images', imageId);
    await apiRequest<void>(url, {
      method: 'DELETE',
    });
    
    console.log("Car image deleted successfully");
  },

  /**
   * Helper method to search cars with filters
   */
  async searchCars(filters: Partial<CarSearchFilters>, pageNumber: number = 0, pageSize: number = 10): Promise<{cars: Car[], totalCount: number}> {
    console.log(`Searching cars with filters:`, filters);
    return this.getAllCars(pageNumber, pageSize, filters);
  },

  /**
   * Helper method to get total car count for pagination
   */
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
      (b) => resolve(b!,
      "image/jpeg",
      quality
    )
  ));

  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  });
};