import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FilterBarLayout from "../FilterBarLayout/FilterBarLayout";
import Input from "../Input/Input";
import Button from "../Button/Button";
import styles from "./ManageBookingsPage.module.css";
import AddNewEntityComponent from "../AddNewEntityComponent/AddNewComponent";
import type { BookingDetails, BookingSearchFilters } from "./types";
import { bookingService } from "./bookingService";
import DataTable from "../DataTable/DataTable";
import { bookingsColumns, bookingsRowKey, bookingsActions } from "./datatable.conf";

const PAGE_SIZE = 10;

const ManageBookingsPage = () => {
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState<Partial<BookingSearchFilters>>({
    userId: undefined,
    carId: undefined,
    status: undefined,
    userEmail: "",
    carBrand: "",
    carModel: "",
    pickupLocation: "",
    dropoffLocation: "",
    startDateFrom: "",
    startDateTo: "",
    endDateFrom: "",
    endDateTo: "",
    priceMin: undefined,
    priceMax: undefined
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const loadBookingsPage = async (page: number, appliedFilters?: Partial<BookingSearchFilters>) => {
    try {
      setLoading(true);
      
      const filtersToUse = appliedFilters || filters;
      const cleanFilters = Object.fromEntries(
        Object.entries(filtersToUse).filter(([_, value]) => 
          value !== undefined && value !== "" && value !== null
        )
      );

      const result = await bookingService.getAllBookings(page - 1, PAGE_SIZE, cleanFilters);
      setBookings(result.bookings);
      setTotalCount(result.totalCount);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      // Error handling removed - no user-facing error message
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadBookingsPage(1);
  }, []);

  const handleFilterChange = (field: keyof BookingSearchFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === "" ? undefined : value
    }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    loadBookingsPage(1, filters);
  };

  const resetFilters = () => {
    const emptyFilters: Partial<BookingSearchFilters> = {
      userId: undefined,
      carId: undefined,
      status: undefined,
      userEmail: "",
      carBrand: "",
      carModel: "",
      pickupLocation: "",
      dropoffLocation: "",
      startDateFrom: "",
      startDateTo: "",
      endDateFrom: "",
      endDateTo: "",
      priceMin: undefined,
      priceMax: undefined
    };
    setFilters(emptyFilters);
    setCurrentPage(1);
    loadBookingsPage(1, emptyFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadBookingsPage(page);
  };

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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleBookingAction = (actionId: string, booking: BookingDetails) => {
    switch (actionId) {
      case "view":
        navigate(`/bookings/${booking.bookingId}`);
        break;
      case "edit":
        navigate(`/bookings/${booking.bookingId}/edit`);
        break;
      case "delete":
        handleDeleteBooking(booking.bookingId);
        break;
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
      return;
    }

    try {
      await bookingService.deleteBooking(bookingId);
      // Refresh the current page after deletion
      loadBookingsPage(currentPage);
    } catch (err) {
      console.error("Failed to delete booking:", err);
      // Error handling removed - no user-facing error message
    }
  };

  const actionsWithHandlers = useMemo(() => 
    bookingsActions.map(action => ({
      ...action,
      onClick: (booking: BookingDetails) => handleBookingAction(action.id, booking)
    })), [navigate]
  );

  const columns = useMemo(
    () => bookingsColumns({ 
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

      <h3 className={styles.subTitle}>Search criteria</h3>

      <FilterBarLayout onApply={applyFilters} onReset={resetFilters}>
        <div className={styles.filters}>
          <div className={styles.field}>
            <span className={styles.label}>User ID</span>
            <Input
              type="number"
              value={filters.userId?.toString() || ""}
              onChange={(value) => handleFilterChange("userId", value ? parseInt(value) : undefined)}
              placeholder="e.g. 1"
              hint="User internal ID"
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Car ID</span>
            <Input
              type="number"
              value={filters.carId?.toString() || ""}
              onChange={(value) => handleFilterChange("carId", value ? parseInt(value) : undefined)}
              placeholder="e.g. 1"
              hint="Car internal ID"
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Status</span>
            <div className={styles.inputWrapper}>
              <select
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value as any)}
                className={styles.input}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <img
                src="/src/assets/icons/info-icon.svg"
                alt="Hint"
                className={styles.hintIcon}
              />
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>User Email</span>
            <Input
              type="email"
              value={filters.userEmail || ""}
              onChange={(value) => handleFilterChange("userEmail", value)}
              placeholder="e.g. john@example.com"
              hint="Customer email address"
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Car Brand</span>
            <Input
              type="text"
              value={filters.carBrand || ""}
              onChange={(value) => handleFilterChange("carBrand", value)}
              placeholder="e.g. BMW"
              hint="Car manufacturer"
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Car Model</span>
            <Input
              type="text"
              value={filters.carModel || ""}
              onChange={(value) => handleFilterChange("carModel", value)}
              placeholder="e.g. 3 Series"
              hint="Car model name"
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Pickup Location</span>
            <Input
              type="text"
              value={filters.pickupLocation || ""}
              onChange={(value) => handleFilterChange("pickupLocation", value)}
              placeholder="e.g. Warsaw Center"
              hint="Pickup service point"
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Start Date From</span>
            <Input
              type="date"
              value={filters.startDateFrom || ""}
              onChange={(value) => handleFilterChange("startDateFrom", value)}
              hint="Earliest start date"
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Start Date To</span>
            <Input
              type="date"
              value={filters.startDateTo || ""}
              onChange={(value) => handleFilterChange("startDateTo", value)}
              hint="Latest start date"
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Price Min ($)</span>
            <Input
              type="number"
              value={filters.priceMin?.toString() || ""}
              onChange={(value) => handleFilterChange("priceMin", value ? parseFloat(value) : undefined)}
              placeholder="e.g. 100"
              hint="Minimum total price"
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Price Max ($)</span>
            <Input
              type="number"
              value={filters.priceMax?.toString() || ""}
              onChange={(value) => handleFilterChange("priceMax", value ? parseFloat(value) : undefined)}
              placeholder="e.g. 500"
              hint="Maximum total price"
            />
          </div>
        </div>
      </FilterBarLayout>

      <AddNewEntityComponent
        title="Bookings"
        buttonText="Add new booking"
        onButtonClick={() => navigate("/bookings/new")}
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

      <div className={styles.pagination}>
        <Button
          label="Prev"
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || loading}
        />

        <span className={styles.pageInfo}>
          Page {currentPage} / {totalPages} ({totalCount} total)
        </span>

        <Button
          label="Next"
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || loading}
        />
      </div>
    </div>
  );
};

export default ManageBookingsPage;
