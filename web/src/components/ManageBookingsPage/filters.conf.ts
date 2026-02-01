import type { FilterFieldDef } from "../FiltersForm/FiltersForm";

type BookingFilters = {
  bookingId: string;
  userId: string;
  carId: string;
  status: string;
  userEmail: string;
  pickupLocation: string;
  priceMin: string;
  priceMax: string;
};

const defaultBookingFilters: BookingFilters = {
  bookingId: "",
  userId: "",
  carId: "",
  status: "",
  userEmail: "",
  pickupLocation: "",
  priceMin: "",
  priceMax: "",
};

type BookingFilterKey =
  | "bookingId"
  | "userId"
  | "carId"
  | "status"
  | "userEmail"
  | "pickupLocation"
  | "priceMin"
  | "priceMax";

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
    key: "userEmail",
    label: "User Email",
    type: "text",
    placeholder: "e.g. user@example.com",
    hint: "Search by customer email",
    errorMessage: "Please enter a valid email.",
  },
  {
    key: "pickupLocation",
    label: "Pickup Location",
    type: "text",
    placeholder: "e.g. Downtown",
    hint: "Search by pickup location",
    errorMessage: "Please enter a valid location.",
  },
  {
    key: "priceMin",
    label: "Min Price",
    type: "number",
    placeholder: "e.g. 100",
    hint: "Minimum total price",
    errorMessage: "Please enter a valid minimum price.",
  },
  {
    key: "priceMax",
    label: "Max Price",
    type: "number",
    placeholder: "e.g. 500",
    hint: "Maximum total price",
    errorMessage: "Please enter a valid maximum price.",
  },
];

export { type BookingFilters, defaultBookingFilters, type BookingFilterKey, bookingFilterFields };