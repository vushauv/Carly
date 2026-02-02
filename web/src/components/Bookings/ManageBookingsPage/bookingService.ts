// Booking API service - connects to localhost:8080
import type { BookingDetails, CreateBookingRequest, BookingUpdateRequest, BookingSearchFilters, FlatBooking, FlatBookingDetails } from "./types";
import { API_CONFIG, buildApiUrl, apiRequest } from "../../../shared/api.config";

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
  async createBooking(
    data: CreateBookingRequest[]
  ): Promise<{ id: number }[]> {
    console.log("Creating new booking:", data);
  
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.BOOKINGS);
  
    return apiRequest<{ id: number }[]>(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Updates an existing booking's information
   */
  async updateBooking(
    bookingId: number,
    data: BookingUpdateRequest
  ): Promise<void> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.BOOKINGS, bookingId);
  
    console.log(`Updating booking ${bookingId}:`);
  
    data.carBookingStatus = data.carBookingStatus.toUpperCase();
  
    console.log(data);
  
    return apiRequest<void>(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
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

  async cancelBooking(bookingId: number): Promise<void> {
    
    console.log(`Canceling booking ${bookingId}`);
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.PARKLY, bookingId, 'cancel');

    await apiRequest<void>(url,{
      method: "POST"
    });
  },

  // async cancelFlatBooking(bookingId: number): Promise<void> {
  //   const url = buildApiUrl(API_CONFIG.ENDPOINTS.FLATLY, bookingId, "bookings");
  //   await apiRequest(url, {
  //     method: "DELETE",
  //   });

  //   // 
  // },

  /**
   * Retrieves all flat bookings from Flatly
   * Maps to: GET /api/flatly/flat-bookings
   */
  async getFlatBookings(): Promise<FlatBooking[]> {
    console.log('[BookingService] Fetching flat bookings from Flatly');
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.FLATLY, 'flat-bookings');
    
    try {
      const response = await apiRequest<FlatBooking[]>(url);
      console.log('[BookingService] Flat bookings response:', response);
      
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('[BookingService] Error fetching flat bookings:', error);
      throw error;
    }
  },

  /**
   * Retrieves detailed information for a specific flat booking
   * Maps to: GET /api/flatly/flat-bookings/{flatBookingId}
   */
  async getFlatBookingById(flatBookingId: string): Promise<FlatBookingDetails> {
    console.log(`[BookingService] Fetching flat booking by ID: ${flatBookingId}`);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.FLATLY, 'flat-bookings', flatBookingId);
    return await apiRequest<FlatBookingDetails>(url);
  },

  /**
   * Cancels a flat booking in Flatly
   * Maps to: DELETE /api/flatly/flat-bookings/{flatBookingId}
   */
  async cancelFlatBooking(flatBookingId: string): Promise<void> {
    console.log(`[BookingService] Canceling flat booking ${flatBookingId}`);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.FLATLY, 'flat-bookings', flatBookingId);
    await apiRequest<void>(url, {
      method: 'DELETE',
    });
    
    console.log('[BookingService] Flat booking canceled successfully');
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