// Booking types based on rental car business logic
export interface Booking {
  bookingId: number;
  userId: number;
  carId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  pickupLocation: string;
  dropoffLocation: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingDetails extends Booking {
  user: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  car: {
    carId: number;
    brand: string;
    model: string;
    color: string;
    licensePlate: string;
    pricePerDay: number;
  };
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