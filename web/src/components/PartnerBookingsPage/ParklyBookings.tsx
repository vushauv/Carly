import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PartnerBookingsPage.module.css";
import FiltersForm from "../Elements/FiltersForm/FiltersForm.tsx";
import type { BookingDetails } from "../ManageBookingsPage/types";
import { defaultBookingFilters, type BookingFilterKey, bookingFilterFields } from "../ManageBookingsPage/filters.conf.ts";
import DataTable from "../DataTable/DataTable";
import { bookingsColumns, bookingsRowKey, bookingsActions } from "../ManageBookingsPage/datatable.conf";
import Pagination from "../Pagination/Pagination";
import { bookingService } from "../ManageBookingsPage/bookingService";

const PAGE_SIZE = 3;

const ParklyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Record<BookingFilterKey, string>>(defaultBookingFilters);

  const loadParklyBookingsPage = async (page: number, f: Record<BookingFilterKey, string>) => {
    try {
      setLoading(true);

      // Always filter for Parkly bookings (userId = 2) plus any additional filters
      const bookingsData = await bookingService.getAllBookings(page, PAGE_SIZE + 1, {
        userId: 2, // Always filter for Parkly partner user
        bookingId: f.bookingId ? Number(f.bookingId) : undefined,
        carId: f.carId ? Number(f.carId) : undefined,
        status: f.status?.trim() as "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED" | undefined,
        userEmail: f.userEmail?.trim() || undefined,
        pickupLocation: f.pickupLocation?.trim() || undefined,
        priceMin: f.priceMin ? Number(f.priceMin) : undefined,
        priceMax: f.priceMax ? Number(f.priceMax) : undefined,
      });

      setBookings(bookingsData.slice(0, PAGE_SIZE));
      setHasNextPage(bookingsData.length > PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = (actionId: string, booking: BookingDetails) => {
    switch (actionId) {
      case "view":
        navigate(`/bookings/${booking.id}`);
        break;
      case "edit":
        navigate(`/bookings/${booking.id}/edit`);
        break;
    }
  };

  useEffect(() => {
    setCurrentPage(0);
    setAppliedFilters(defaultBookingFilters);
    loadParklyBookingsPage(0, defaultBookingFilters);
  }, []);

  const actionsWithHandlers = useMemo(
    () =>
      bookingsActions.filter(action => action.id !== "delete").map((action) => ({
        ...action,
        onClick: (booking: BookingDetails) => handleBookingAction(action.id, booking),
      })),
    [navigate]
  );

  const columns = useMemo(
    () =>
      bookingsColumns({
        customer: styles.customer,
        car: styles.car,
        dates: styles.dates,
        status: styles.status,
        price: styles.price,
      }),
    []
  );

  return (
    <div>
      <h2 className={styles.subTitle}>Parkly Bookings (Partner User ID: 2)</h2>

      <FiltersForm<BookingFilterKey>
        fields={bookingFilterFields.filter(field => field.key !== "userId")} // Remove userId filter since it's fixed to 2
        onApply={(values) => {
          setAppliedFilters(values);
          setCurrentPage(0);
          loadParklyBookingsPage(0, values);
        }}
        onReset={() => {
          setAppliedFilters(defaultBookingFilters);
          setCurrentPage(0);
          loadParklyBookingsPage(0, defaultBookingFilters);
        }}
      />

      {loading ? (
        <div className={styles.loading}>Loading Parkly bookings...</div>
      ) : (
        <DataTable<BookingDetails>
          rows={bookings}
          rowKey={bookingsRowKey}
          columns={columns}
          actions={actionsWithHandlers}
          emptyText="No Parkly bookings found."
        />
      )}

      <Pagination
        currentPage={currentPage + 1}
        hasNextPage={hasNextPage}
        disabled={loading}
        onPrev={() => {
          if (currentPage === 0) return;
          const newPage = currentPage - 1;
          setCurrentPage(newPage);
          loadParklyBookingsPage(newPage, appliedFilters);
        }}
        onNext={() => {
          if (!hasNextPage) return;
          const newPage = currentPage + 1;
          setCurrentPage(newPage);
          loadParklyBookingsPage(newPage, appliedFilters);
        }}
      />
    </div>
  );
};

export default ParklyBookings;