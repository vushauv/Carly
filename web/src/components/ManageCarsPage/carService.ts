// Car API service with sample data for testing
import type { Car, CreateCarRequest, UpdateCarRequest, CarImage, CarSearchFilters } from "./types";

// Sample data for testing
const sampleCars: Car[] = [
  {
    carId: 1,
    carFeatures: [
      { dictionaryId: 1, name: "brand", value: "Toyota" },
      { dictionaryId: 2, name: "model", value: "Yaris" },
      { dictionaryId: 3, name: "color", value: "Red" },
      { dictionaryId: 4, name: "fuelType", value: "Petrol" },
      { dictionaryId: 5, name: "status", value: "Available" }
    ],
    urls: ["http://localhost:8080/api/cars/1/images/1", "http://localhost:8080/api/cars/1/images/2"],
    price: 85.00
  },
  {
    carId: 2,
    carFeatures: [
      { dictionaryId: 1, name: "brand", value: "BMW" },
      { dictionaryId: 2, name: "model", value: "3 Series" },
      { dictionaryId: 3, name: "color", value: "Black" },
      { dictionaryId: 4, name: "fuelType", value: "Diesel" },
      { dictionaryId: 5, name: "status", value: "Available" }
    ],
    urls: ["http://localhost:8080/api/cars/2/images/1"],
    price: 145.00
  },
  {
    carId: 3,
    carFeatures: [
      { dictionaryId: 1, name: "brand", value: "Audi" },
      { dictionaryId: 2, name: "model", value: "A4" },
      { dictionaryId: 3, name: "color", value: "Blue" },
      { dictionaryId: 4, name: "fuelType", value: "Hybrid" },
      { dictionaryId: 5, name: "status", value: "Rented" }
    ],
    urls: ["http://localhost:8080/api/cars/3/images/1", "http://localhost:8080/api/cars/3/images/2", "http://localhost:8080/api/cars/3/images/3"],
    price: 165.00
  },
  {
    carId: 4,
    carFeatures: [
      { dictionaryId: 1, name: "brand", value: "Mercedes" },
      { dictionaryId: 2, name: "model", value: "A-Class" },
      { dictionaryId: 3, name: "color", value: "White" },
      { dictionaryId: 4, name: "fuelType", value: "Electric" },
      { dictionaryId: 5, name: "status", value: "Available" }
    ],
    urls: [],
    price: 195.00
  },
  {
    carId: 5,
    carFeatures: [
      { dictionaryId: 1, name: "brand", value: "Volkswagen" },
      { dictionaryId: 2, name: "model", value: "Golf" },
      { dictionaryId: 3, name: "color", value: "Silver" },
      { dictionaryId: 4, name: "fuelType", value: "Petrol" },
      { dictionaryId: 5, name: "status", value: "Available" }
    ],
    urls: ["http://localhost:8080/api/cars/5/images/1"],
    price: 95.00
  }
];

let carIdCounter = 6;

const API_BASE_URL = "http://localhost:8080/api";

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to get car feature value by name
const getFeatureValue = (car: Car, featureName: string): string => {
  return car.carFeatures.find(f => f.name === featureName)?.value || "";
};

export const carService = {
  /**
   * Retrieves a paginated list of cars with optional filtering
   * @param pageNumber - Zero-based page number for pagination (default: 0)
   * @param pageSize - Number of cars per page (default: 10)
   * @param filters - Optional filter criteria to apply to the car search
   * @returns Promise<{cars: Car[], totalCount: number}> - Cars for the requested page and total count
   * 
   * Maps to: GET /api/cars?searchParams={filters}&page={pageNumber}&size={pageSize}
   * Currently uses sample data with client-side filtering instead of real API call
   */
  async getAllCars(pageNumber: number = 0, pageSize: number = 10, filters?: Partial<CarSearchFilters>): Promise<{cars: Car[], totalCount: number}> {
    console.log(`Fetching cars: page ${pageNumber}, size ${pageSize}`, filters ? `with filters: ${JSON.stringify(filters)}` : '');
    
    await delay(300);
    
    let filteredCars = sampleCars;
    
    if (filters) {
      filteredCars = sampleCars.filter(car => {
        // Filter by brand
        if (filters.brand && !getFeatureValue(car, "brand").toLowerCase().includes(filters.brand.toLowerCase())) {
          return false;
        }
        
        // Filter by model
        if (filters.model && !getFeatureValue(car, "model").toLowerCase().includes(filters.model.toLowerCase())) {
          return false;
        }
        
        // Filter by color
        if (filters.color && !getFeatureValue(car, "color").toLowerCase().includes(filters.color.toLowerCase())) {
          return false;
        }
        
        // Filter by fuel type
        if (filters.fuelType && !getFeatureValue(car, "fuelType").toLowerCase().includes(filters.fuelType.toLowerCase())) {
          return false;
        }
        
        // Filter by status
        if (filters.status && !getFeatureValue(car, "status").toLowerCase().includes(filters.status.toLowerCase())) {
          return false;
        }
        
        // Filter by availability
        if (filters.availability) {
          const status = getFeatureValue(car, "status");
          if (filters.availability === "AVAILABLE" && status !== "Available") {
            return false;
          }
          if (filters.availability === "RENTED" && status !== "Rented") {
            return false;
          }
        }
        
        // Filter by price range
        if (filters.priceMin !== undefined && car.price < filters.priceMin) {
          return false;
        }
        if (filters.priceMax !== undefined && car.price > filters.priceMax) {
          return false;
        }
        
        return true;
      });
    }
    
    const totalCount = filteredCars.length;
    const startIndex = pageNumber * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCars = filteredCars.slice(startIndex, endIndex);
    
    return {
      cars: paginatedCars,
      totalCount: totalCount
    };
  },

  /**
   * Retrieves detailed information for a specific car by its ID
   * @param id - Unique identifier of the car to retrieve
   * @returns Promise<Car> - Complete car object with all details
   * @throws Error if car with given ID is not found
   * 
   * Maps to: GET /api/cars/{carId}
   * Currently uses sample data instead of real API call
   */
  async getCarById(id: number): Promise<Car> {
    console.log(`Fetching car by ID: ${id}`);
    
    await delay(200);
    
    const car = sampleCars.find(c => c.carId === id);
    if (!car) {
      throw new Error(`Car with ID ${id} not found`);
    }
    
    return car;
  },

  /**
   * Creates a new car in the system
   * @param data - Car creation data including features and price
   * @returns Promise<{carId: number}> - Object containing the newly created car's ID
   * @throws Error if validation fails
   * 
   * Maps to: POST /api/cars
   * Request body: CreateCarRequestDto
   * Response: CreateCarResponseDto
   * Currently uses sample data instead of real API call
   */
  async createCar(data: CreateCarRequest): Promise<{ carId: number }> {
    console.log("Creating new car:", data);
    
    await delay(500);
    
    const newCar: Car = {
      carId: carIdCounter++,
      carFeatures: data.carFeatures,
      urls: [], // No images initially
      price: data.price,
    };
    
    sampleCars.push(newCar);
    
    return { carId: newCar.carId };
  },

  /**
   * Updates an existing car's information
   * @param id - ID of the car to update
   * @param data - Partial car data containing fields to be updated
   * @returns Promise<void> - No return value on success
   * @throws Error if car not found
   * 
   * Maps to: PUT /api/cars/{carId}
   * Request body: UpdateCarRequestDto
   * Updates car price and merges features into existing feature set
   * Currently uses sample data instead of real API call
   */
  async updateCar(id: number, data: UpdateCarRequest): Promise<void> {
    console.log(`Updating car ${id}:`, data);
    
    await delay(400);
    
    const carIndex = sampleCars.findIndex(c => c.carId === id);
    if (carIndex === -1) {
      throw new Error(`Car with ID ${id} not found`);
    }
    
    const car = sampleCars[carIndex];
    
    // Update price (mandatory)
    car.price = data.price;
    
    // Merge features if provided
    if (data.carFeatures) {
      data.carFeatures.forEach(newFeature => {
        const existingIndex = car.carFeatures.findIndex(f => f.name === newFeature.name);
        if (existingIndex >= 0) {
          // Update existing feature
          car.carFeatures[existingIndex] = newFeature;
        } else {
          // Add new feature
          car.carFeatures.push(newFeature);
        }
      });
    }
    
    console.log("Car updated successfully");
  },

  /**
   * Permanently removes a car from the system
   * @param id - ID of the car to delete
   * @returns Promise<void> - No return value on success
   * @throws Error if car with given ID is not found
   * 
   * Maps to: DELETE /api/cars/{carId}
   * This operation is irreversible
   * Currently uses sample data instead of real API call
   */
  async deleteCar(id: number): Promise<void> {
    console.log(`Deleting car ${id}`);
    
    await delay(300);
    
    const carIndex = sampleCars.findIndex(c => c.carId === id);
    if (carIndex === -1) {
      throw new Error(`Car with ID ${id} not found`);
    }
    
    sampleCars.splice(carIndex, 1);
    
    console.log("Car deleted successfully");
  },

  /**
   * Retrieves all images for a specific car
   * @param carId - ID of the car to get images for
   * @returns Promise<CarImage[]> - Array of car image objects
   * 
   * Maps to: GET /api/cars/{carId}/images
   * Response: GetCarImagesResponseDto
   * Currently uses sample data instead of real API call
   */
  async getCarImages(carId: number): Promise<CarImage[]> {
    console.log(`Fetching images for car ${carId}`);
    
    await delay(200);
    
    const car = sampleCars.find(c => c.carId === carId);
    if (!car) {
      throw new Error(`Car with ID ${carId} not found`);
    }
    
    // Generate mock image data based on URLs
    return car.urls.map((url, index) => ({
      imageId: index + 1,
      fileUri: url,
      fileType: "image/jpeg",
      fileSize: 1024 * 500 // 500KB mock size
    }));
  },

  /**
   * Uploads a new image for a car
   * @param carId - ID of the car to upload image for
   * @param file - Image file to upload
   * @returns Promise<CarImage> - Details of the uploaded image
   * 
   * Maps to: POST /api/cars/{carId}/images
   * Request: multipart/form-data with file
   * Response: CarImageResponseDto
   * Currently uses sample data instead of real API call
   */
  async uploadCarImage(carId: number, file: File): Promise<CarImage> {
    console.log(`Uploading image for car ${carId}:`, file.name);
    
    await delay(800); // Longer delay to simulate file upload
    
    const car = sampleCars.find(c => c.carId === carId);
    if (!car) {
      throw new Error(`Car with ID ${carId} not found`);
    }
    
    const newImageId = car.urls.length + 1;
    const newImageUrl = `http://localhost:8080/api/cars/${carId}/images/${newImageId}`;
    
    // Add URL to car's image list
    car.urls.push(newImageUrl);
    
    return {
      imageId: newImageId,
      fileUri: newImageUrl,
      fileType: file.type,
      fileSize: file.size
    };
  },

  /**
   * Deletes a specific image from a car
   * @param carId - ID of the car
   * @param imageId - ID of the image to delete
   * @returns Promise<void> - No return value on success
   * 
   * Maps to: DELETE /api/cars/{carId}/images/{imageId}
   * Currently uses sample data instead of real API call
   */
  async deleteCarImage(carId: number, imageId: number): Promise<void> {
    console.log(`Deleting image ${imageId} from car ${carId}`);
    
    await delay(300);
    
    const car = sampleCars.find(c => c.carId === carId);
    if (!car) {
      throw new Error(`Car with ID ${carId} not found`);
    }
    
    // Remove the URL at the specified index (imageId - 1)
    if (imageId <= car.urls.length && imageId > 0) {
      car.urls.splice(imageId - 1, 1);
    } else {
      throw new Error(`Image with ID ${imageId} not found for car ${carId}`);
    }
    
    console.log("Car image deleted successfully");
  },

  /**
   * Helper method to search cars with filters
   * @param filters - Filter criteria to apply
   * @param pageNumber - Zero-based page number (default: 0)
   * @param pageSize - Number of cars per page (default: 10)
   * @returns Promise<{cars: Car[], totalCount: number}> - Filtered cars and total count
   */
  async searchCars(filters: Partial<CarSearchFilters>, pageNumber: number = 0, pageSize: number = 10): Promise<{cars: Car[], totalCount: number}> {
    console.log(`Searching cars with filters:`, filters);
    return this.getAllCars(pageNumber, pageSize, filters);
  },

  /**
   * Helper method to get total car count for pagination
   * @returns Promise<number> - Total number of cars in the system
   */
  async getTotalCars(): Promise<number> {
    await delay(100);
    return sampleCars.length;
  },
};