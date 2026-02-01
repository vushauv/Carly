import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./BookingViewPage.module.css";
import type { BookingDetails } from "../ManageBookingsPage/types";
import { bookingService } from "../ManageBookingsPage/bookingService";
import Button from "../Button/Button";

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
      await bookingService.deleteBooking(booking.bookingId);
      // Navigate back to bookings list after successful deletion
      navigate("/manage-bookings");
    } catch (err) {
      console.error("Failed to delete booking:", err);
      setError("Failed to delete booking. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const duration = calculateDuration(booking.startDate, booking.endDate);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Booking Details #{booking.bookingId}</h1>
        <div className={styles.actions}>
          <Button label="Edit Booking" onClick={() => navigate(`/bookings/${booking.bookingId}/edit`)} />
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
              <span className={styles.value}>{booking.bookingId}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Status:</span>
              <span 
                className={`${styles.value} ${styles.status}`}
                style={{ backgroundColor: getStatusColor(booking.status), color: 'white' }}
              >
                {booking.status}
              </span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Total Price:</span>
              <span className={`${styles.value} ${styles.price}`}>${booking.totalPrice.toFixed(2)}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Duration:</span>
              <span className={styles.value}>{duration} day{duration !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Rental Period</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Start Date:</span>
              <span className={styles.value}>{formatDate(booking.startDate)}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>End Date:</span>
              <span className={styles.value}>{formatDate(booking.endDate)}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Pickup Location:</span>
              <span className={styles.value}>{booking.pickupLocation}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Dropoff Location:</span>
              <span className={styles.value}>{booking.dropoffLocation}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Customer Information</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Customer ID:</span>
              <span className={styles.value}>{booking.user.userId}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{booking.user.firstName} {booking.user.lastName}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{booking.user.email}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Phone:</span>
              <span className={styles.value}>{booking.user.phone || "Not provided"}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Vehicle Information</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Car ID:</span>
              <span className={styles.value}>{booking.car.carId}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Vehicle:</span>
              <span className={styles.value}>{booking.car.brand} {booking.car.model}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Color:</span>
              <span className={styles.value}>{booking.car.color}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>License Plate:</span>
              <span className={styles.value}>{booking.car.licensePlate}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Price per Day:</span>
              <span className={styles.value}>${booking.car.pricePerDay.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Timestamps</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Created:</span>
              <span className={styles.value}>{formatDateTime(booking.createdAt)}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Last Updated:</span>
              <span className={styles.value}>{formatDateTime(booking.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingViewPage;