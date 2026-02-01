// Booking API service - connects to localhost:8080
import type { Booking, BookingDetails, CreateBookingRequest, UpdateBookingRequest, BookingSearchFilters } from "./types";
import { API_CONFIG, buildApiUrl, apiRequest } from "../../shared/api.config";

export const bookingService = {
  /**
   * Retrieves a paginated list of bookings with optional filtering
   * Maps to: GET /api/bookings with query parameters
   */
  async getAllBookings(pageNumber: number = 0, pageSize: number = 3, filters?: Partial<BookingSearchFilters>): Promise<BookingDetails[]> {
    console.log(`[BookingService] Fetching bookings: page ${pageNumber}, size ${pageSize}`, filters ? `with filters: ${JSON.stringify(filters)}` : '');
    
    const params = new URLSearchParams({
      page: pageNumber.toString(),
      size: pageSize.toString(),
    });

    // Add filters as individual query parameters based on API docs
    if (filters) {
      if (filters.bookingId) params.append('bookingId', filters.bookingId.toString());
      if (filters.userId) params.append('userId', filters.userId.toString());
      if (filters.carId) params.append('carId', filters.carId.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.userEmail) params.append('userEmail', filters.userEmail);
      if (filters.pickupLocation) params.append('pickupLocation', filters.pickupLocation);
      if (filters.startDateFrom) params.append('dateFrom', filters.startDateFrom);
      if (filters.startDateTo) params.append('dateTo', filters.startDateTo);
      if (filters.priceMin) params.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax) params.append('priceMax', filters.priceMax.toString());
    }

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.BOOKINGS) + `?${params}`;
    console.log(`[BookingService] Request URL: ${url}`);
    
    try {
      const response = await apiRequest<BookingDetails[]>(url);
      console.log(`[BookingService] Raw response:`, response);
      
      // API returns array directly
      const bookings = Array.isArray(response) ? response : [];
      console.log(`[BookingService] Extracted bookings:`, bookings);
      
      return bookings;
    } catch (error) {
      console.error(`[BookingService] Error in getAllBookings:`, error);
      throw error;
    }
  },

  /**
   * Retrieves detailed information for a specific booking by its ID
   */
  async getBookingById(id: number): Promise<BookingDetails> {
    console.log(`Fetching booking by ID: ${id}`);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.BOOKINGS, id);
    return await apiRequest<BookingDetails>(url);
  },

  /**
   * Creates a new booking in the system
   */
  async createBooking(data: CreateBookingRequest): Promise<{ bookingId: number }> {
    console.log("Creating new booking:", data);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.BOOKINGS);
    return await apiRequest<{ bookingId: number }>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Updates an existing booking's information
   */
  async updateBooking(id: number, data: UpdateBookingRequest): Promise<void> {
    console.log(`Updating booking ${id}:`, data);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.BOOKINGS, id);
    await apiRequest<void>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    console.log("Booking updated successfully");
  },

  /**
   * Permanently removes a booking from the system
   */
  async deleteBooking(id: number): Promise<void> {
    console.log(`Deleting booking ${id}`);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.BOOKINGS, id);
    await apiRequest<void>(url, {
      method: 'DELETE',
    });
    
    console.log("Booking deleted successfully");
  },

  /**
   * Helper method to search bookings with filters
   */
  async searchBookings(filters: Partial<BookingSearchFilters>, pageNumber: number = 0, pageSize: number = 10): Promise<{bookings: BookingDetails[], totalCount: number}> {
    console.log(`Searching bookings with filters:`, filters);
    return this.getAllBookings(pageNumber, pageSize, filters);
  },

  /**
   * Helper method to get total booking count for pagination
   */
  async getTotalBookings(): Promise<number> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.BOOKINGS, 'count');
    const response = await apiRequest<{count: number}>(url);
    return response.count || 0;
  },
};