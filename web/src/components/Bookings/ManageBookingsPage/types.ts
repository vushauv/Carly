// Booking types based on rental car business logic


export type BookingStatus = "CREATED" | "CONFIRMED" | "CANCELLED" | "FINISHED";

export type BookingUpdateRequest = {
  pickupLocationId: number;
  returnLocationId: number;
  carBookingStatus: BookingStatus;
  flatBookingStatus: BookingStatus;
  carBookingDateFrom: string; // LocalDateTime
  carBookingDateTo: string;
};



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

export type PickupLocation = {
  id: number;
  address: string;
  latitude: number;
  longitude: number;
};

export type CreateBookingRequest = {
  userId: number;
  carId: number;
  pickupLocationId: number;
  returnLocationId: number;
  carBookingDateFrom: string;
  carBookingDateTo: string;
};





export interface BookingSearchFilters {
  bookingId?: number;
  userId?: number;
  carId?: number;
  status?:  "CREATED" | "COMPLETED" | "CANCELLED";
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