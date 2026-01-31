import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./BookingEditPage.module.css";
import type { BookingDetails, UpdateBookingRequest } from "../ManageBookingsPage/types";
import { bookingService } from "../ManageBookingsPage/bookingService";
import Button from "../Button/Button";
import Input from "../Input/Input";

const BookingEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    status: "PENDING" as const,
    pickupLocation: "",
    dropoffLocation: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        
        // Populate form with current booking data
        setFormData({
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          status: bookingData.status,
          pickupLocation: bookingData.pickupLocation,
          dropoffLocation: bookingData.dropoffLocation
        });
      } catch (err) {
        console.error("Failed to load booking:", err);
        setError(err instanceof Error ? err.message : "Failed to load booking");
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [id]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!booking || !id) return;

    // Validate required fields
    if (!formData.startDate || !formData.endDate || !formData.pickupLocation || !formData.dropoffLocation) {
      setError("All fields are required");
      return;
    }

    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate <= startDate) {
      setError("End date must be after start date");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updateData: UpdateBookingRequest = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        pickupLocation: formData.pickupLocation.trim(),
        dropoffLocation: formData.dropoffLocation.trim()
      };

      await bookingService.updateBooking(parseInt(id), updateData);
      
      // Navigate back to booking view page
      navigate(`/bookings/${id}`);
    } catch (err) {
      console.error("Failed to update booking:", err);
      setError(err instanceof Error ? err.message : "Failed to update booking");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading booking details...</div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          {error}
        </div>
        <Button label="Back to Bookings" onClick={() => navigate("/manage-bookings")} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit Booking #{booking?.bookingId}</h1>
        <div className={styles.actions}>
          <Button label="Cancel" onClick={() => navigate(`/bookings/${id}`)} />
        </div>
      </div>

      {booking && (
        <div className={styles.bookingInfo}>
          <h3>Booking Information</h3>
          <p><strong>Customer:</strong> {booking.user.firstName} {booking.user.lastName} ({booking.user.email})</p>
          <p><strong>Vehicle:</strong> {booking.car.brand} {booking.car.model} ({booking.car.color})</p>
          <p><strong>License Plate:</strong> {booking.car.licensePlate}</p>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="startDate" className={styles.label}>Start Date *</label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(value) => handleInputChange("startDate", value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="endDate" className={styles.label}>End Date *</label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(value) => handleInputChange("endDate", value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status" className={styles.label}>Status *</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value as any)}
              className={styles.select}
              required
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="pickupLocation" className={styles.label}>Pickup Location *</label>
            <Input
              id="pickupLocation"
              type="text"
              value={formData.pickupLocation}
              onChange={(value) => handleInputChange("pickupLocation", value)}
              placeholder="Enter pickup location"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dropoffLocation" className={styles.label}>Dropoff Location *</label>
            <Input
              id="dropoffLocation"
              type="text"
              value={formData.dropoffLocation}
              onChange={(value) => handleInputChange("dropoffLocation", value)}
              placeholder="Enter dropoff location"
              required
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <Button
            label="Cancel"
            type="button"
            onClick={() => navigate(`/bookings/${id}`)}
            disabled={saving}
          />
          <Button
            label={saving ? "Saving..." : "Save Changes"}
            type="submit"
            disabled={saving}
          />
        </div>
      </form>
    </div>
  );
};

export default BookingEditPage;