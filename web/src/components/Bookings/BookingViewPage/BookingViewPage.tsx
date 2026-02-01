import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./BookingViewPage.module.css";
import type { BookingDetails } from "../ManageBookingsPage/types";
import { bookingService } from "../ManageBookingsPage/bookingService";
import Button from "../../Button/Button";
import { Link } from "react-router-dom";


const BookingViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      if (!id) {
        setError("Booking ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const bookingId = parseInt(id);
        if (isNaN(bookingId)) {
          throw new Error("Invalid booking ID");
        }

        const bookingData = await bookingService.getBookingById(bookingId);
        setBooking(bookingData);
      } catch (err) {
        console.error("Failed to load booking:", err);
        setError(err instanceof Error ? err.message : "Failed to load booking");
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [id]);

  const handleDeleteBooking = async () => {
    if (!booking) {
      setError("Booking data not available");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(true);
      await bookingService.deleteBooking(booking.id);
      // Navigate back to bookings list after successful deletion
      navigate("/manage-bookings");
    } catch (err) {
      console.error("Failed to delete booking:", err);
      setError("Failed to delete booking. Please try again.");
    } finally {
      setDeleting(false);
    }
  };




  const formatDate = (value: string): string => {
    // "2026-02-02T00:00:00.000+0000"
    const [year, month, day] = value.split("T")[0].split("-");

    return `${day}.${month}.${year}`; // or any format you want
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

  const calculateDuration = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading booking details...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          {error || "Booking not found"}
        </div>
        <Button label="Back to Bookings" onClick={() => navigate("/manage-bookings")} />
      </div>
    );
  }

  const duration = calculateDuration(booking.carBookingDateFrom, booking.carBookingDateTo);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Booking Details #{booking.id}</h1>
        <div className={styles.actions}>
          <Button label="Edit Booking" onClick={() => navigate(`/bookings/${booking.id}/edit`)} />
          <Button label="Delete Booking" onClick={handleDeleteBooking} disabled={deleting} />
          <Button label="Back to Bookings" onClick={() => navigate("/manage-bookings")} />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2>Booking Information</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Booking ID:</span>
              <span className={styles.value}>{booking.id}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.label}>Status:</span>
              <span
                className={`${styles.value} ${styles.status}`}
                style={{ backgroundColor: getStatusColor(booking.carStatus.name), color: 'white' }}
              >
                {booking.carStatus.name}
              </span>
            </div>

          </div>
        </div>

        <div className={styles.section}>
          <h2>Rental Period</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Start Date:</span>
              <span className={styles.value}>{formatDate(booking.carBookingDateFrom)}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.label}>End Date:</span>
              <span className={styles.value}>{formatDate(booking.carBookingDateTo)}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.label}>Pickup Location:</span>
              <span className={styles.value}>{booking.pickupLocation.address}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.label}>Dropoff Location:</span>
              <span className={styles.value}>{booking.returnLocation.address}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Related Information</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.label}>User ID:</span>
              <Link
                to={`/users/${booking.userId}`}
                className={styles.link}
              >
                {booking.userId}
              </Link>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Car ID:</span>
              <Link
                to={`/users/${booking.carId}`}
                className={styles.link}
              >
                {booking.carId}
              </Link>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.label}>External Flat ID:</span>

                {booking.providerExternalBookingId ?? "—" }
              
            </div>


          </div>
        </div>



      </div>
    </div>
  );
};

export default BookingViewPage;