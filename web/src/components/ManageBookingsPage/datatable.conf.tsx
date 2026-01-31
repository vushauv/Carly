import type { ColumnDef, RowAction } from "../../components/DataTable/DataTable";
import type { BookingDetails } from "./types";

export const bookingsRowKey = (booking: BookingDetails) => booking.bookingId;

export const bookingsColumns = (styles: {
  primaryCell?: string;
  status?: string;
  customer?: string;
  car?: string;
  dates?: string;
  price?: string;
}): ColumnDef<BookingDetails>[] => [
  { 
    id: "id", 
    header: "ID", 
    cell: (booking) => booking.bookingId, 
    width: "60px" 
  },
  {
    id: "customer",
    header: "Customer",
    cell: (booking) => (
      <div className={styles.customer}>
        {booking.user.firstName} {booking.user.lastName}
        <br />
        <small>{booking.user.email}</small>
      </div>
    ),
    cellClassName: styles.customer,
    width: "200px",
  },
  {
    id: "car",
    header: "Car",
    cell: (booking) => (
      <div className={styles.car}>
        {booking.car.brand} {booking.car.model}
        <br />
        <small>{booking.car.color} • {booking.car.licensePlate}</small>
      </div>
    ),
    cellClassName: styles.car,
    width: "180px",
  },
  {
    id: "dates",
    header: "Dates",
    cell: (booking) => {
      const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      };
      
      return (
        <div className={styles.dates}>
          {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
          <br />
          <small>{booking.pickupLocation}</small>
        </div>
      );
    },
    cellClassName: styles.dates,
    width: "160px",
  },
  {
    id: "status",
    header: "Status",
    cell: (booking) => {
      const getStatusColor = (status: string): string => {
        switch (status) {
          case "PENDING": return "#ffc107";
          case "CONFIRMED": return "#17a2b8";
          case "ACTIVE": return "#28a745";
          case "COMPLETED": return "#6c757d";
          case "CANCELLED": return "#dc3545";
          default: return "#6c757d";
        }
      };

      return (
        <span 
          className={styles.status}
          style={{ backgroundColor: getStatusColor(booking.status), color: 'white' }}
        >
          {booking.status}
        </span>
      );
    },
    cellClassName: styles.status,
    width: "120px",
  },
  {
    id: "price",
    header: "Total Price",
    cell: (booking) => `$${booking.totalPrice.toFixed(2)}`,
    cellClassName: styles.price,
    width: "120px",
  },
];

export const bookingsActions: RowAction<BookingDetails>[] = [
  {
    id: "view",
    label: "Details",
    onClick: () => {}, // Will be injected in the component
  },
  {
    id: "edit",
    label: "Edit",
    color: "secondary",
    onClick: () => {}, // Will be injected in the component
  },
  {
    id: "delete",
    label: "Delete",
    color: "danger",
    onClick: () => {}, // Will be injected in the component
  },
];