import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./BookingCreatePage.module.css";
import type { CreateBookingRequest } from "../ManageBookingsPage/types";
import { bookingService } from "../ManageBookingsPage/bookingService";
import Button from "../Button/Button";
import Input from "../Input/Input";

const BookingCreatePage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    userId: "",
    carId: "",
    startDate: "",
    endDate: "",
    pickupLocation: "",
    dropoffLocation: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.userId || !formData.carId || !formData.startDate || !formData.endDate || !formData.pickupLocation || !formData.dropoffLocation) {
      setError("All fields are required");
      return;
    }

    // Validate numeric IDs
    const userId = parseInt(formData.userId);
    const carId = parseInt(formData.carId);
    
    if (isNaN(userId) || userId <= 0) {
      setError("User ID must be a valid positive number");
      return;
    }
    
    if (isNaN(carId) || carId <= 0) {
      setError("Car ID must be a valid positive number");
      return;
    }

    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      setError("Start date cannot be in the past");
      return;
    }
    
    if (endDate <= startDate) {
      setError("End date must be after start date");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const createData: CreateBookingRequest = {
        userId: userId,
        carId: carId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        pickupLocation: formData.pickupLocation.trim(),
        dropoffLocation: formData.dropoffLocation.trim()
      };

      const result = await bookingService.createBooking(createData);
      
      // Navigate to the newly created booking's view page
      navigate(`/bookings/${result.bookingId}`);
    } catch (err) {
      console.error("Failed to create booking:", err);
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setSaving(false);
    }
  };

  // Calculate minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create New Booking</h1>
        <div className={styles.actions}>
          <Button label="Cancel" onClick={() => navigate("/manage-bookings")} />
        </div>
      </div>

      <div className={styles.infoBox}>
        <h3>Instructions</h3>
        <p>Create a new booking by providing the customer ID, car ID, rental dates, and locations.</p>
        <p>The system will automatically calculate the total price based on the rental duration and car's daily rate.</p>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="userId" className={styles.label}>Customer ID *</label>
            <Input
              id="userId"
              type="number"
              min="1"
              value={formData.userId}
              onChange={(value) => handleInputChange("userId", value)}
              placeholder="Enter customer ID"
              hint="The ID of the customer making the booking"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="carId" className={styles.label}>Car ID *</label>
            <Input
              id="carId"
              type="number"
              min="1"
              value={formData.carId}
              onChange={(value) => handleInputChange("carId", value)}
              placeholder="Enter car ID"
              hint="The ID of the car to be rented"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="startDate" className={styles.label}>Start Date *</label>
            <Input
              id="startDate"
              type="date"
              min={today}
              value={formData.startDate}
              onChange={(value) => handleInputChange("startDate", value)}
              hint="When the rental period begins"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="endDate" className={styles.label}>End Date *</label>
            <Input
              id="endDate"
              type="date"
              min={formData.startDate || today}
              value={formData.endDate}
              onChange={(value) => handleInputChange("endDate", value)}
              hint="When the rental period ends"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="pickupLocation" className={styles.label}>Pickup Location *</label>
            <Input
              id="pickupLocation"
              type="text"
              value={formData.pickupLocation}
              onChange={(value) => handleInputChange("pickupLocation", value)}
              placeholder="e.g., Warsaw Center"
              hint="Where the customer will pick up the car"
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
              placeholder="e.g., Warsaw Airport"
              hint="Where the customer will return the car"
              required
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <Button
            label="Cancel"
            type="button"
            onClick={() => navigate("/manage-bookings")}
            disabled={saving}
          />
          <Button
            label={saving ? "Creating..." : "Create Booking"}
            type="submit"
            disabled={saving}
          />
        </div>
      </form>
    </div>
  );
};

export default BookingCreatePage;