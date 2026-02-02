import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./FlatBookingViewPage.module.css";
import type { FlatBookingDetails } from "../Bookings/ManageBookingsPage/types";
import { bookingService } from "../Bookings/ManageBookingsPage/bookingService";
import Button from "../Elements/Button/Button";

const FlatBookingViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [flatBooking, setFlatBooking] = useState<FlatBookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    const loadFlatBooking = async () => {
      if (!id) {
        setError("Flat booking ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const flatBookingData = await bookingService.getFlatBookingById(id);
        setFlatBooking(flatBookingData);
      } catch (err) {
        console.error("Failed to load flat booking:", err);
        setError(err instanceof Error ? err.message : "Failed to load flat booking");
      } finally {
        setLoading(false);
      }
    };

    loadFlatBooking();
  }, [id]);

  const handleCancelFlatBooking = async () => {
    if (!flatBooking || !id) {
      setError("Flat booking data not available");
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this flat booking? This action cannot be undone.")) {
      return;
    }

    try {
      setCanceling(true);
      await bookingService.cancelFlatBooking(id);
      // Navigate back to partner bookings after successful cancellation
      navigate("/partner-bookings");
    } catch (err) {
      console.error("Failed to cancel flat booking:", err);
      setError("Failed to cancel flat booking. Please try again.");
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateStayDuration = (checkIn: string, checkOut: string): number => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading flat booking details...</div>
      </div>
    );
  }

  if (error || !flatBooking) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          {error || "Flat booking not found"}
        </div>
        <Button label="Back to Partner Bookings" onClick={() => navigate("/partner-bookings")} />
      </div>
    );
  }

  const stayDuration = calculateStayDuration(flatBooking.booking.checkInDate, flatBooking.booking.checkOutDate);
  const sortedImages = flatBooking.flatImages.sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Flat Booking Details</h1>
        <div className={styles.actions}>
          <Button label="Cancel Booking" onClick={handleCancelFlatBooking} disabled={canceling} />
          <Button label="Back to Partner Bookings" onClick={() => navigate("/partner-bookings")} />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2>Booking Information</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Booking ID:</span>
              <span className={styles.value}>{flatBooking.booking.id}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Source:</span>
              <span className={styles.value}>{flatBooking.booking.source}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>User ID:</span>
              <span className={styles.value}>{flatBooking.booking.userId}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Stay Duration:</span>
              <span className={styles.value}>{stayDuration} night{stayDuration !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Stay Period</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Check-in Date:</span>
              <span className={styles.value}>{formatDate(flatBooking.booking.checkInDate)}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Check-out Date:</span>
              <span className={styles.value}>{formatDate(flatBooking.booking.checkOutDate)}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Number of Guests:</span>
              <span className={styles.value}>{flatBooking.booking.guestsCount}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Flat Information</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Flat ID:</span>
              <span className={styles.value}>{flatBooking.flat.id}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{flatBooking.flat.name}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Location:</span>
              <span className={styles.value}>{flatBooking.flat.city}, {flatBooking.flat.country}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Rooms:</span>
              <span className={styles.value}>{flatBooking.flat.rooms}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Max Guests:</span>
              <span className={styles.value}>{flatBooking.flat.maxGuests}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>Coordinates:</span>
              <span className={styles.value}>{flatBooking.flat.lat}, {flatBooking.flat.lon}</span>
            </div>
          </div>
        </div>

        {sortedImages.length > 0 && (
          <div className={styles.section}>
            <h2>Flat Images</h2>
            <div className={styles.imageGrid}>
              {sortedImages.map((image, index) => (
                <div key={index} className={styles.imageItem}>
                  <img 
                    src={image.image_url} 
                    alt={`${flatBooking.flat.name} - Image ${index + 1}`}
                    className={styles.flatImage}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlatBookingViewPage;