import type { ColumnDef, RowAction } from "../../components/DataTable/DataTable";
import type { BookingDetails } from "./types";



export const bookingsRowKey = (booking: BookingDetails) => booking.id;

export const bookingsColumns = (styles: {
  primaryCell?: string;
  status?: string;
  customer?: string;
  car?: string;
  dates?: string;
  price?: string;
}): ColumnDef<BookingDetails>[] => [
  { 
    id: "Booking id", 
    header: "ID", 
    cell: (booking) => booking.id, 
    width: "60px" 
  },
  {
    id: "customer",
    header: "user Id",
    cell: (booking) => (
      <div className={styles.customer}>
        {booking.userId}
        <br />
      </div>
    ),
    cellClassName: styles.customer,
    width: "100px",
  },
  {
    id: "car",
    header: "Car Id",
    cell: (booking) => (
      <div className={styles.car}>
        {booking.carId}
        <br />
        
      </div>
    ),
    cellClassName: styles.car,
    width: "100px",
  },
  {
    id: "dates",
    header: "Dates",
    cell: (booking) => {
  
      
      const formatDate = (value: string): string => {
        // "2026-02-02T00:00:00.000+0000"
        const [year, month, day] = value.split("T")[0].split("-");
      
        return `${day}.${month}.${year}`; // or any format you want
      };
  
      return (
        <div className={styles.dates}>
          {formatDate(booking.carBookingDateFrom)} –{" "}
          {formatDate(booking.carBookingDateTo)}
          <br />
          <small>{booking.pickupLocation?.address ?? "—"}</small>
        </div>
      );
    },
    cellClassName: styles.dates,
    width: "200px",
  },

  {
    id: "pickup_location",
    header: "Pick Location",
    cell: (booking) => {
  
      

  
      return (
        <div className={styles.dates}>

          {booking.pickupLocation?.address ?? "—"}
        </div>
      );
    },
    cellClassName: styles.dates,
    width: "150px",
  },
  {
    id: "return_location",
    header: "Return Location",
    cell: (booking) => {
  
      

  
      return (
        <div className={styles.dates}>

          {booking.returnLocation?.address ?? "—"}
        </div>
      );
    },
    cellClassName: styles.dates,
    width: "200px",
  },
  
  {
    id: "car_status",
    header: "Car Status",
    cell: (booking) => {
      const getStatusColor = (status: string): string => {
        switch (status) {
          case "CREATED": return "#ffc107";
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
          style={{ backgroundColor: getStatusColor(booking.carStatus.name), color: 'white' }}
        >
          {booking.carStatus.name}
        </span>
      );
    },
    cellClassName: styles.status,
    width: "120px",
  },
  {
    id: "flat_status",
    header: "Flat Status",
    cell: (booking) => {
      const getStatusColor = (status: string): string => {
        switch (status) {
          case "CREATED": return "#ffc107";
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
          style={{ backgroundColor: getStatusColor(booking.flatStatus ?? "NONE" ), color: 'white' }}
        >
          {booking.flatStatus ?? "NONE"}
        </span>
      );
    },
    cellClassName: styles.status,
    width: "120px",
  }

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