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

const FlatlyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Record<BookingFilterKey, string>>(defaultBookingFilters);

  const loadFlatlyBookingsPage = async (page: number, f: Record<BookingFilterKey, string>) => {
    try {
      setLoading(true);

      // Always filter for Flatly bookings (providerExternalBookingId is not null) plus any additional filters
      const bookingsData = await bookingService.getAllBookings(page, PAGE_SIZE + 1, {
        hasProviderExternalBookingId: true, // Filter for bookings with external provider booking ID
        bookingId: f.bookingId ? Number(f.bookingId) : undefined,
        userId: f.userId ? Number(f.userId) : undefined,
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
    loadFlatlyBookingsPage(0, defaultBookingFilters);
  }, []);

  const actionsWithHandlers = useMemo(
    () =>
      bookingsActions.filter(action => action.id !== "delete").map((action) => ({
        ...action,
        onClick: (booking: BookingDetails) => handleBookingAction(action.id, booking),
      })),
    [navigate]
  );

  // Custom columns to show providerExternalBookingId
  const flatlyColumns = useMemo(
    () => [
      ...bookingsColumns({
        customer: styles.customer,
        car: styles.car,
        dates: styles.dates,
        status: styles.status,
        price: styles.price,
      }),
      {
        id: "providerExternalBookingId",
        header: "External Booking ID",
        cell: (booking: BookingDetails) => (
          <span className={styles.externalId}>
            {booking.providerExternalBookingId || "N/A"}
          </span>
        ),
        width: "15%",
      },
    ],
    []
  );

  return (
    <div>
      <h2 className={styles.subTitle}>Our Bookings to Flatly (External Provider)</h2>

      <FiltersForm<BookingFilterKey>
        fields={bookingFilterFields} // Keep all filters for Flatly bookings
        onApply={(values) => {
          setAppliedFilters(values);
          setCurrentPage(0);
          loadFlatlyBookingsPage(0, values);
        }}
        onReset={() => {
          setAppliedFilters(defaultBookingFilters);
          setCurrentPage(0);
          loadFlatlyBookingsPage(0, defaultBookingFilters);
        }}
      />

      {loading ? (
        <div className={styles.loading}>Loading Flatly bookings...</div>
      ) : (
        <DataTable<BookingDetails>
          rows={bookings}
          rowKey={bookingsRowKey}
          columns={flatlyColumns}
          actions={actionsWithHandlers}
          emptyText="No Flatly bookings found."
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
          loadFlatlyBookingsPage(newPage, appliedFilters);
        }}
        onNext={() => {
          if (!hasNextPage) return;
          const newPage = currentPage + 1;
          setCurrentPage(newPage);
          loadFlatlyBookingsPage(newPage, appliedFilters);
        }}
      />
    </div>
  );
};

export default FlatlyBookings;