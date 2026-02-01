import type { FilterFieldDef } from "../FiltersForm/FiltersForm";

type BookingFilters = {
  bookingId: string;
  userId: string;
  carId: string;
  status: string;
  pickupLocation: string;
};

const defaultBookingFilters: BookingFilters = {
  bookingId: "",
  userId: "",
  carId: "",
  status: "",
  pickupLocation: "",
};

type BookingFilterKey =
  | "bookingId"
  | "userId"
  | "carId"
  | "status"
  | "pickupLocation"

const bookingFilterFields: FilterFieldDef<BookingFilterKey>[] = [
  {
    key: "bookingId",
    label: "Booking ID",
    type: "text",
    placeholder: "e.g. 123",
    hint: "Search by booking ID",
    errorMessage: "Please enter a valid booking ID.",
  },
  {
    key: "userId",
    label: "User ID",
    type: "text",
    placeholder: "e.g. 456",
    hint: "Search by user ID",
    errorMessage: "Please enter a valid user ID.",
  },
  {
    key: "carId",
    label: "Car ID",
    type: "text",
    placeholder: "e.g. 789",
    hint: "Search by car ID",
    errorMessage: "Please enter a valid car ID.",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    placeholder: "Select status",
    hint: "Filter by booking status",
    errorMessage: "Please select a valid status.",
    options: [
      { value: "", label: "All Statuses" },
      { value: "PENDING", label: "Pending" },
      { value: "CONFIRMED", label: "Confirmed" },
      { value: "ACTIVE", label: "Active" },
      { value: "COMPLETED", label: "Completed" },
      { value: "CANCELLED", label: "Cancelled" },
    ],
  },

  {
    key: "pickupLocation",
    label: "Pickup Location",
    type: "text",
    placeholder: "e.g. Downtown",
    hint: "Search by pickup location",
    errorMessage: "Please enter a valid location.",
  },

];

export { type BookingFilters, defaultBookingFilters, type BookingFilterKey, bookingFilterFields };