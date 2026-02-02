import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./BookingCreatePage.module.css";
import type {
  CreateBookingRequest,
  PickupLocation,
} from "../ManageBookingsPage/types";
import { bookingService } from "../ManageBookingsPage/bookingService";
import { referenceService } from "../../../shared/referenceService";
import Button from "../../Elements/Button/Button";
import Input from "../../Elements/Input/Input";

const BookingCreatePage = () => {
  const navigate = useNavigate();

  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  const [formData, setFormData] = useState({
    userId: "",
    carId: "",
    startDate: "",
    endDate: "",
    pickupLocationId: "",
    returnLocationId: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- reference data ---------------- */

  useEffect(() => {
    referenceService.fetchPickupLocations()
      .then(setLocations)
      .catch(() => setError("Failed to load locations"))
      .finally(() => setLoadingLocations(false));
  }, []);

  /* ---------------- handlers ---------------- */

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
  };

  function toLocalDateTimeEnd(value: string): string {
    return `${value}T23:59:59`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.values(formData).some((v) => !v)) {
      setError("All fields are required");
      return;
    }

    

    const payload: CreateBookingRequest = {
      userId: Number(formData.userId),
      carId: Number(formData.carId),
      pickupLocationId: Number(formData.pickupLocationId),
      returnLocationId: Number(formData.returnLocationId),
      carBookingDateFrom: `${formData.startDate}T00:00:00`,
      carBookingDateTo: `${formData.endDate}T23:59:59`,
    };

    try {
      setSaving(true);
      setError(null);

      const res = await bookingService.createBooking([payload]);
      navigate(`/bookings/${res[0].id}`);
    } catch (e) {
      setError("Failed to create booking");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- render ---------------- */

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className={styles.page}>
      <h1>Create Booking</h1>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
  <div className={styles.formGrid}>
    <div className={styles.formGroup}>
      <label>User ID</label>
      <Input
        type="number"
        value={formData.userId}
        onChange={(v) => handleChange("userId", v)}
        required
      />
    </div>

    <div className={styles.formGroup}>
      <label>Car ID</label>
      <Input
        type="number"
        value={formData.carId}
        onChange={(v) => handleChange("carId", v)}
        required
      />
    </div>

    <div className={styles.formGroup}>
      <label>Start date</label>
      <Input
        type="date"
        min={today}
        value={formData.startDate}
        onChange={(v) => handleChange("startDate", v)}
        required
      />
    </div>

    <div className={styles.formGroup}>
      <label>End date</label>
      <Input
        type="date"
        min={formData.startDate || today}
        value={formData.endDate}
        onChange={(v) => handleChange("endDate", v)}
        required
      />
    </div>

    <div className={styles.formGroup}>
      <label>Pickup location</label>
      <select
        value={formData.pickupLocationId}
        onChange={(e) =>
          handleChange("pickupLocationId", e.target.value)
        }
        disabled={loadingLocations}
        required
      >
        <option value="">Select location</option>
        {locations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.address}
          </option>
        ))}
      </select>
    </div>

    <div className={styles.formGroup}>
      <label>Return location</label>
      <select
        value={formData.returnLocationId}
        onChange={(e) =>
          handleChange("returnLocationId", e.target.value)
        }
        disabled={loadingLocations}
        required
      >
        <option value="">Select location</option>
        {locations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.address}
          </option>
        ))}
      </select>
    </div>
  </div>

  <div className={styles.actions}>
    <Button
      type="button"
      label="Cancel"
      onClick={() => navigate("/bookings")}
    />
    <Button
      type="submit"
      label={saving ? "Creating…" : "Create booking"}
      disabled={saving}
    />
  </div>
</form>

    </div>
  );
};

export default BookingCreatePage;
