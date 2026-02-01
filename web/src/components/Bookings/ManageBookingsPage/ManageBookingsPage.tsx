import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ManageBookingsPage.module.css";
import AddNewEntityComponent from "../../Elements//AddNewEntityComponent/AddNewComponent";
import FiltersForm from "../../Elements/FiltersForm/FiltersForm.tsx";
import type { BookingDetails } from "./types";
import { defaultBookingFilters, type BookingFilterKey, bookingFilterFields } from "./filters.conf.ts";
import DataTable from "../../Elements//DataTable/DataTable";
import { bookingsColumns, bookingsRowKey, bookingsActions } from "./datatable.conf";
import Pagination from "../../Elements//Pagination/Pagination";
import { bookingService } from "./bookingService";

const PAGE_SIZE = 3; // Match users page pattern

const ManageBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0); // API uses 0-based pagination
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Record<BookingFilterKey, string>>(defaultBookingFilters);

  const loadBookingsPage = async (page: number, f: Record<BookingFilterKey, string>) => {
    try {
      setLoading(true);

      const bookingsData = await bookingService.getAllBookings(page, PAGE_SIZE + 1, {
        bookingId: f.bookingId ? Number(f.bookingId) : undefined,
        userId: f.userId ? Number(f.userId) : undefined,
        status: f.status?.trim() || undefined,
        startDateFrom: f.dateFrom?.trim() ? `${f.dateFrom}T00:00:00` : undefined,
        startDateTo: f.dateTo?.trim() ? `${f.dateTo}T23:59:59` : undefined,
      });

      setBookings(bookingsData.slice(0, PAGE_SIZE));
      setHasNextPage(bookingsData.length > PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;

    try {
      await bookingService.deleteBooking(bookingId);

      // Try to reload the same page; if it becomes empty, go back until we find data (or reach page 0)
      let pageToLoad = currentPage;

      while (pageToLoad > 0) {
        const pageData = await bookingService.getAllBookings(pageToLoad, PAGE_SIZE + 1, {
          bookingId: appliedFilters.bookingId ? Number(appliedFilters.bookingId) : undefined,
          userId: appliedFilters.userId ? Number(appliedFilters.userId) : undefined,
          status: appliedFilters.status?.trim() || undefined,
          startDateFrom: appliedFilters.dateFrom?.trim() ? `${appliedFilters.dateFrom}T00:00:00` : undefined,
          startDateTo: appliedFilters.dateTo?.trim() ? `${appliedFilters.dateTo}T23:59:59` : undefined,
        });

        if (pageData.length > 0) {
          setBookings(pageData.slice(0, PAGE_SIZE));
          setHasNextPage(pageData.length > PAGE_SIZE);
          setCurrentPage(pageToLoad);
          return;
        }

        pageToLoad -= 1;
      }

      // Fallback: load page 0
      const firstPage = await bookingService.getAllBookings(0, PAGE_SIZE + 1);
      setBookings(firstPage.slice(0, PAGE_SIZE));
      setHasNextPage(firstPage.length > PAGE_SIZE);
      setCurrentPage(0);
    } catch (err) {
      console.error("Failed to delete booking:", err);
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
      case "delete":
        handleDeleteBooking(booking.id);
        break;
    }
  };

  useEffect(() => {
    setCurrentPage(0);
    setAppliedFilters(defaultBookingFilters);
    loadBookingsPage(0, defaultBookingFilters);
  }, []);

  const actionsWithHandlers = useMemo(
    () =>
      bookingsActions.map((action) => ({
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
    <div className={styles.page}>
      <h1 className={styles.title}>Admin Dashboard – Manage Bookings</h1>

      <FiltersForm<BookingFilterKey>
        fields={bookingFilterFields}
        onApply={(values) => {
          setAppliedFilters(values);
          setCurrentPage(0);
          loadBookingsPage(0, values);
        }}
        onReset={() => {
          setAppliedFilters(defaultBookingFilters);
          setCurrentPage(0);
          loadBookingsPage(0, defaultBookingFilters);
        }}
      />

      <AddNewEntityComponent
        title="Bookings"
        buttonText="Add new booking"
        onButtonClick={() => {
          navigate("/bookings/new");
        }}
      />

      {loading ? (
        <div className={styles.loading}>Loading bookings...</div>
      ) : (
        <DataTable<BookingDetails>
          rows={bookings}
          rowKey={bookingsRowKey}
          columns={columns}
          actions={actionsWithHandlers}
          emptyText="No bookings found."
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
          loadBookingsPage(newPage, appliedFilters);
        }}
        onNext={() => {
          if (!hasNextPage) return;
          const newPage = currentPage + 1;
          setCurrentPage(newPage);
          loadBookingsPage(newPage, appliedFilters);
        }}
      />
    </div>
  );
};

export default ManageBookingsPage;
