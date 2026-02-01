import type { FilterFieldDef } from "../../Elements/FiltersForm/FiltersForm";

type BookingFilters = {
  bookingId: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
  status: string;
};

const defaultBookingFilters: BookingFilters = {
  bookingId: "",
  userId: "",
  dateFrom: "",
  dateTo: "",
  status: "",
};

type BookingFilterKey =
  | "bookingId"
  | "userId"
  | "dateFrom"
  | "dateTo"
  | "status";

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
    key: "dateFrom",
    label: "Date From",
    type: "date",
    placeholder: "",
    hint: "Filter bookings from this date",
    errorMessage: "Please enter a valid date.",
  },
  {
    key: "dateTo",
    label: "Date To",
    type: "date", 
    placeholder: "",
    hint: "Filter bookings until this date",
    errorMessage: "Please enter a valid date.",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    placeholder: "Select status",
    hint: "Filter by booking status",
    errorMessage: "Please select a valid status.",
    options: [
      { value: "CREATED", label: "CREATED" },
      { value: "COMPLETED", label: "COMPLETED" },
      { value: "CANCELLED", label: "CANCELLED" },
    ],
  },
];

export { type BookingFilters, defaultBookingFilters, type BookingFilterKey, bookingFilterFields };