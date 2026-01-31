// Booking API service with sample data for testing
import type { Booking, BookingDetails, CreateBookingRequest, UpdateBookingRequest, BookingSearchFilters } from "./types";

// Sample data for testing
const sampleBookings: BookingDetails[] = [
  {
    bookingId: 1,
    userId: 1,
    carId: 1,
    startDate: "2026-02-15",
    endDate: "2026-02-20",
    totalPrice: 425.00,
    status: "CONFIRMED",
    pickupLocation: "Warsaw Center",
    dropoffLocation: "Warsaw Center",
    createdAt: "2026-01-25T10:00:00Z",
    updatedAt: "2026-01-25T10:00:00Z",
    user: {
      userId: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+48123456789"
    },
    car: {
      carId: 1,
      brand: "Toyota",
      model: "Yaris",
      color: "Red",
      licensePlate: "WA12345",
      pricePerDay: 85.00
    }
  },
  {
    bookingId: 2,
    userId: 2,
    carId: 2,
    startDate: "2026-02-10",
    endDate: "2026-02-12",
    totalPrice: 290.00,
    status: "ACTIVE",
    pickupLocation: "Warsaw Airport",
    dropoffLocation: "Krakow Main",
    createdAt: "2026-01-20T14:30:00Z",
    updatedAt: "2026-02-10T09:00:00Z",
    user: {
      userId: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      phone: "+48987654321"
    },
    car: {
      carId: 2,
      brand: "BMW",
      model: "3 Series",
      color: "Black",
      licensePlate: "WA67890",
      pricePerDay: 145.00
    }
  },
  {
    bookingId: 3,
    userId: 3,
    carId: 5,
    startDate: "2026-01-28",
    endDate: "2026-02-02",
    totalPrice: 475.00,
    status: "COMPLETED",
    pickupLocation: "Gdansk Airport",
    dropoffLocation: "Gdansk Airport",
    createdAt: "2026-01-15T16:45:00Z",
    updatedAt: "2026-02-02T18:00:00Z",
    user: {
      userId: 3,
      firstName: "Michael",
      lastName: "Johnson",
      email: "michael.johnson@example.com"
    },
    car: {
      carId: 5,
      brand: "Volkswagen",
      model: "Golf",
      color: "Silver",
      licensePlate: "GD11111",
      pricePerDay: 95.00
    }
  },
  {
    bookingId: 4,
    userId: 1,
    carId: 4,
    startDate: "2026-03-01",
    endDate: "2026-03-07",
    totalPrice: 1170.00,
    status: "PENDING",
    pickupLocation: "Warsaw Center",
    dropoffLocation: "Warsaw Airport",
    createdAt: "2026-01-30T11:20:00Z",
    updatedAt: "2026-01-30T11:20:00Z",
    user: {
      userId: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+48123456789"
    },
    car: {
      carId: 4,
      brand: "Mercedes",
      model: "A-Class",
      color: "White",
      licensePlate: "WA99999",
      pricePerDay: 195.00
    }
  },
  {
    bookingId: 5,
    userId: 4,
    carId: 3,
    startDate: "2026-02-25",
    endDate: "2026-02-28",
    totalPrice: 495.00,
    status: "CANCELLED",
    pickupLocation: "Krakow Main",
    dropoffLocation: "Krakow Main",
    createdAt: "2026-01-28T09:15:00Z",
    updatedAt: "2026-01-29T10:30:00Z",
    user: {
      userId: 4,
      firstName: "Sarah",
      lastName: "Wilson",
      email: "sarah.wilson@example.com",
      phone: "+48555666777"
    },
    car: {
      carId: 3,
      brand: "Audi",
      model: "A4",
      color: "Blue",
      licensePlate: "KR22222",
      pricePerDay: 165.00
    }
  }
];

let bookingIdCounter = 6;

const API_BASE_URL = "http://localhost:8080/api";

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to calculate total price
const calculateTotalPrice = (startDate: string, endDate: string, pricePerDay: number): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return days * pricePerDay;
};

export const bookingService = {
  /**
   * Retrieves a paginated list of bookings with optional filtering
   * @param pageNumber - Zero-based page number for pagination (default: 0)
   * @param pageSize - Number of bookings per page (default: 10)
   * @param filters - Optional filter criteria to apply to the booking search
   * @returns Promise<{bookings: BookingDetails[], totalCount: number}> - Bookings for the requested page and total count
   */
  async getAllBookings(pageNumber: number = 0, pageSize: number = 10, filters?: Partial<BookingSearchFilters>): Promise<{bookings: BookingDetails[], totalCount: number}> {
    console.log(`Fetching bookings: page ${pageNumber}, size ${pageSize}`, filters ? `with filters: ${JSON.stringify(filters)}` : '');
    
    await delay(300);
    
    let filteredBookings = sampleBookings;
    
    if (filters) {
      filteredBookings = sampleBookings.filter(booking => {
        // Filter by user ID
        if (filters.userId && booking.userId !== filters.userId) {
          return false;
        }
        
        // Filter by car ID
        if (filters.carId && booking.carId !== filters.carId) {
          return false;
        }
        
        // Filter by status
        if (filters.status && booking.status !== filters.status) {
          return false;
        }
        
        // Filter by user email
        if (filters.userEmail && !booking.user.email.toLowerCase().includes(filters.userEmail.toLowerCase())) {
          return false;
        }
        
        // Filter by car brand
        if (filters.carBrand && !booking.car.brand.toLowerCase().includes(filters.carBrand.toLowerCase())) {
          return false;
        }
        
        // Filter by car model
        if (filters.carModel && !booking.car.model.toLowerCase().includes(filters.carModel.toLowerCase())) {
          return false;
        }
        
        // Filter by pickup location
        if (filters.pickupLocation && !booking.pickupLocation.toLowerCase().includes(filters.pickupLocation.toLowerCase())) {
          return false;
        }
        
        // Filter by dropoff location
        if (filters.dropoffLocation && !booking.dropoffLocation.toLowerCase().includes(filters.dropoffLocation.toLowerCase())) {
          return false;
        }
        
        // Filter by date ranges
        if (filters.startDateFrom && booking.startDate < filters.startDateFrom) {
          return false;
        }
        if (filters.startDateTo && booking.startDate > filters.startDateTo) {
          return false;
        }
        if (filters.endDateFrom && booking.endDate < filters.endDateFrom) {
          return false;
        }
        if (filters.endDateTo && booking.endDate > filters.endDateTo) {
          return false;
        }
        
        // Filter by price range
        if (filters.priceMin !== undefined && booking.totalPrice < filters.priceMin) {
          return false;
        }
        if (filters.priceMax !== undefined && booking.totalPrice > filters.priceMax) {
          return false;
        }
        
        return true;
      });
    }
    
    const totalCount = filteredBookings.length;
    const startIndex = pageNumber * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);
    
    return {
      bookings: paginatedBookings,
      totalCount: totalCount
    };
  },

  /**
   * Retrieves detailed information for a specific booking by its ID
   * @param id - Unique identifier of the booking to retrieve
   * @returns Promise<BookingDetails> - Complete booking object with user and car details
   * @throws Error if booking with given ID is not found
   */
  async getBookingById(id: number): Promise<BookingDetails> {
    console.log(`Fetching booking by ID: ${id}`);
    
    await delay(200);
    
    const booking = sampleBookings.find(b => b.bookingId === id);
    if (!booking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    
    return booking;
  },

  /**
   * Creates a new booking in the system
   * @param data - Booking creation data
   * @returns Promise<{bookingId: number}> - Object containing the newly created booking's ID
   * @throws Error if validation fails
   */
  async createBooking(data: CreateBookingRequest): Promise<{ bookingId: number }> {
    console.log("Creating new booking:", data);
    
    await delay(500);
    
    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (endDate <= startDate) {
      throw new Error("End date must be after start date");
    }
    
    if (startDate < new Date()) {
      throw new Error("Start date cannot be in the past");
    }
    
    // Mock car lookup for price calculation (in real implementation, this would fetch from car service)
    const mockCar = { pricePerDay: 100 }; // Simplified
    const totalPrice = calculateTotalPrice(data.startDate, data.endDate, mockCar.pricePerDay);
    
    const newBooking: BookingDetails = {
      bookingId: bookingIdCounter++,
      userId: data.userId,
      carId: data.carId,
      startDate: data.startDate,
      endDate: data.endDate,
      totalPrice: totalPrice,
      status: "PENDING",
      pickupLocation: data.pickupLocation,
      dropoffLocation: data.dropoffLocation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        userId: data.userId,
        firstName: "New",
        lastName: "User",
        email: "user@example.com"
      },
      car: {
        carId: data.carId,
        brand: "Unknown",
        model: "Unknown",
        color: "Unknown",
        licensePlate: "TBD",
        pricePerDay: mockCar.pricePerDay
      }
    };
    
    sampleBookings.push(newBooking);
    
    return { bookingId: newBooking.bookingId };
  },

  /**
   * Updates an existing booking's information
   * @param id - ID of the booking to update
   * @param data - Partial booking data containing fields to be updated
   * @returns Promise<void> - No return value on success
   * @throws Error if booking not found or validation fails
   */
  async updateBooking(id: number, data: UpdateBookingRequest): Promise<void> {
    console.log(`Updating booking ${id}:`, data);
    
    await delay(400);
    
    const bookingIndex = sampleBookings.findIndex(b => b.bookingId === id);
    if (bookingIndex === -1) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    
    const booking = sampleBookings[bookingIndex];
    
    // Validate date changes
    if (data.startDate || data.endDate) {
      const startDate = new Date(data.startDate || booking.startDate);
      const endDate = new Date(data.endDate || booking.endDate);
      
      if (endDate <= startDate) {
        throw new Error("End date must be after start date");
      }
    }
    
    // Update fields
    if (data.startDate) booking.startDate = data.startDate;
    if (data.endDate) booking.endDate = data.endDate;
    if (data.status) booking.status = data.status;
    if (data.pickupLocation) booking.pickupLocation = data.pickupLocation;
    if (data.dropoffLocation) booking.dropoffLocation = data.dropoffLocation;
    
    // Recalculate total price if dates changed
    if (data.startDate || data.endDate) {
      booking.totalPrice = calculateTotalPrice(booking.startDate, booking.endDate, booking.car.pricePerDay);
    }
    
    booking.updatedAt = new Date().toISOString();
    
    console.log("Booking updated successfully");
  },

  /**
   * Permanently removes a booking from the system
   * @param id - ID of the booking to delete
   * @returns Promise<void> - No return value on success
   * @throws Error if booking with given ID is not found
   */
  async deleteBooking(id: number): Promise<void> {
    console.log(`Deleting booking ${id}`);
    
    await delay(300);
    
    const bookingIndex = sampleBookings.findIndex(b => b.bookingId === id);
    if (bookingIndex === -1) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    
    sampleBookings.splice(bookingIndex, 1);
    
    console.log("Booking deleted successfully");
  },

  /**
   * Helper method to search bookings with filters
   * @param filters - Filter criteria to apply
   * @param pageNumber - Zero-based page number (default: 0)
   * @param pageSize - Number of bookings per page (default: 10)
   * @returns Promise<{bookings: BookingDetails[], totalCount: number}> - Filtered bookings and total count
   */
  async searchBookings(filters: Partial<BookingSearchFilters>, pageNumber: number = 0, pageSize: number = 10): Promise<{bookings: BookingDetails[], totalCount: number}> {
    console.log(`Searching bookings with filters:`, filters);
    return this.getAllBookings(pageNumber, pageSize, filters);
  },

  /**
   * Helper method to get total booking count for pagination
   * @returns Promise<number> - Total number of bookings in the system
   */
  async getTotalBookings(): Promise<number> {
    await delay(100);
    return sampleBookings.length;
  },
};