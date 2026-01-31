// Booking API service - connects to localhost:8080
import type { Booking, BookingDetails, CreateBookingRequest, UpdateBookingRequest, BookingSearchFilters } from "./types";
import { API_CONFIG, buildApiUrl, apiRequest } from "../../shared/api.config";

export const bookingService = {
  /**
   * Retrieves a paginated list of bookings with optional filtering
   */
  async getAllBookings(pageNumber: number = 0, pageSize: number = 10, filters?: Partial<BookingSearchFilters>): Promise<{bookings: BookingDetails[], totalCount: number}> {
    console.log(`Fetching bookings: page ${pageNumber}, size ${pageSize}`, filters ? `with filters: ${JSON.stringify(filters)}` : '');
    
    const params = new URLSearchParams({
      page: pageNumber.toString(),
      size: pageSize.toString(),
    });

    // Add filters as query parameters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.BOOKINGS) + `?${params}`;
    const response = await apiRequest<{content: BookingDetails[], totalElements: number}>(url);
    
    return {
      bookings: response.content || [],
      totalCount: response.totalElements || 0
    };
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