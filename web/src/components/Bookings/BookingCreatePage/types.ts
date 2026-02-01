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