// Booking types based on rental car business logic


export interface BookingDetails  {
  id: number;

  userId: number;
  carId: number;

  carBookingDateFrom: string;
  carBookingDateTo: string;

  carStatus: {
    id: number;
    name: string;
  };

  flatStatus: string | null;

  pickupLocation: {
    id: number;
    address: string;
    latitude: number;
    longitude: number;
  };

  returnLocation: {
    id: number;
    address: string;
    latitude: number;
    longitude: number;
  };

  providerExternalBookingId: string | null;
}


export interface CreateBookingRequest {
  userId: number;
  carId: number;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  dropoffLocation: string;
}

export interface UpdateBookingRequest {
  startDate?: string;
  endDate?: string;
  status?: "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  pickupLocation?: string;
  dropoffLocation?: string;
}

export interface BookingSearchFilters {
  bookingId?: number;
  userId?: number;
  carId?: number;
  status?: "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  userEmail?: string;
  carBrand?: string;
  carModel?: string;
  priceMin?: number;
  priceMax?: number;
}