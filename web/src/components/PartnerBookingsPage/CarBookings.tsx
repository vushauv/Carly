import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./PartnerBookingsPage.module.css";

// UI
import FiltersForm from "../Elements/FiltersForm/FiltersForm";
import DataTable from "../Elements/DataTable/DataTable";
import Pagination from "../Elements/Pagination/Pagination";

// Booking domain (re-use what you already have)
import type { BookingDetails } from "../Bookings/ManageBookingsPage/types";
import {
  defaultBookingFilters,
  type BookingFilterKey,
  bookingFilterFields,
} from "../Bookings/ManageBookingsPage/filters.conf";
import {
  bookingsColumns,
  bookingsRowKey,
  bookingsActions,
} from "../Bookings/ManageBookingsPage/datatable.conf";
import { bookingService } from "../Bookings/ManageBookingsPage/bookingService";

const PAGE_SIZE = 3;
const PARTNER_USER_ID = 2; // Parkly

const CarBookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0); // 0-based
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);

  const carsColumns = bookingsColumns({}).filter(
    col => col.id !== "customer"
  );
  
  const [appliedFilters, setAppliedFilters] =
    useState<Record<BookingFilterKey, string>>(defaultBookingFilters);

    const actionsWithHandlers = useMemo(() => {
      const cancelAction = {
        id: "cancel",
        label: "Cancel",
        color: "danger" as ("danger" | "secondary" | "primary"), // or whatever your Button/DataTable supports
        onClick: (b: BookingDetails) => handleCancelBooking(b.id),
      };
    
      return [
        cancelAction,
        ...bookingsActions
          .filter((a) => a.id !== "delete" && a.id !== "cancel")
          .map((a) => ({
            ...a,
            onClick: (b: BookingDetails) => handleAction(a.id, b),
          })),
      ];
    }, [navigate, currentPage, appliedFilters]);

    const buildPartnerFilters = (f: Record<BookingFilterKey, string>) => ({
      userId: PARTNER_USER_ID,
    
      bookingId: f.bookingId ? Number(f.bookingId) : undefined,
    
      status: (f.status?.trim() as
        | "CREATED"
        | "CONFIRMED"
        | "CANCELLED"
        | undefined) ?? undefined,
    
    });
    
    const loadPartnerBookingsPage = async (
      page: number,
      f: Record<BookingFilterKey, string>
    ) => {
      try {
        setLoading(true);
    
        const filters = buildPartnerFilters(f);
    
        // load current page with real PAGE_SIZE
        const pageData = await bookingService.getAllBookings(page, PAGE_SIZE, filters);
    
        // probe next page to compute hasNextPage
        const nextPageData = await bookingService.getAllBookings(page + 1, PAGE_SIZE, filters);
    
        setBookings(pageData);
        setHasNextPage(nextPageData.length > 0);
      } finally {
        setLoading(false);
      }
    };
    

    const handleCancelBooking = async (bookingId: number) => {
      if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    
      try {
        await bookingService.cancelBooking(bookingId);
    
        const filters = buildPartnerFilters(appliedFilters);
    
        // Try reload current page; if empty, go back
        let pageToLoad = currentPage;
    
        while (pageToLoad > 0) {
          const pageData = await bookingService.getAllBookings(pageToLoad, PAGE_SIZE, filters);
          if (pageData.length > 0) {
            const nextPageData = await bookingService.getAllBookings(pageToLoad + 1, PAGE_SIZE, filters);
    
            setBookings(pageData);
            setHasNextPage(nextPageData.length > 0);
            setCurrentPage(pageToLoad);
            return;
          }
          pageToLoad -= 1;
        }
    
        // Fallback: load page 0 (and probe page 1)
        const firstPage = await bookingService.getAllBookings(0, PAGE_SIZE, filters);
        const nextPage = await bookingService.getAllBookings(1, PAGE_SIZE, filters);
    
        setBookings(firstPage);
        setHasNextPage(nextPage.length > 0);
        setCurrentPage(0);
      } catch (err) {
        console.error("Failed to cancel booking:", err);
      }
    };
    
  

  const handleAction = (actionId: string, booking: BookingDetails) => {
    switch (actionId) {
      case "view":
        navigate(`/bookings/${booking.id}`);
        break;
      case "edit":
        navigate(`/bookings/${booking.id}/edit`);
        break;
      case "cancel":
        if (!confirm(`Cancel booking #${booking.id}?`)) return;

        handleCancelBooking(booking.id);

        
        break;
      
      default:
        break;
    }
  };

  useEffect(() => {
    setCurrentPage(0);
    setAppliedFilters(defaultBookingFilters);
    loadPartnerBookingsPage(0, defaultBookingFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // reuse columns but pass your CSS classes like ManageBookingsPage does


  return (
    <div>
      <h2 className={styles.subTitle}>Parkly Bookings</h2>

      <FiltersForm<BookingFilterKey>
        // userId must NOT be editable here, because it’s fixed to 2
        fields={bookingFilterFields.filter((f) => f.key !== "userId")}
        onApply={(values) => {
          setAppliedFilters(values);
          setCurrentPage(0);
          loadPartnerBookingsPage(0, values);
        }}
        onReset={() => {
          setAppliedFilters(defaultBookingFilters);
          setCurrentPage(0);
          loadPartnerBookingsPage(0, defaultBookingFilters);
        }}
      />

      {loading ? (
        <div className={styles.loading}>Loading partner bookings...</div>
      ) : (
        <DataTable<BookingDetails>
          rows={bookings}
          rowKey={bookingsRowKey}
          columns={carsColumns}
          actions={actionsWithHandlers}
          emptyText="No partner bookings found."
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
          loadPartnerBookingsPage(newPage, appliedFilters);
        }}
        onNext={() => {
          if (!hasNextPage) return;
          const newPage = currentPage + 1;
          setCurrentPage(newPage);
          loadPartnerBookingsPage(newPage, appliedFilters);
        }}
      />
    </div>
  );
};

export default CarBookings;
