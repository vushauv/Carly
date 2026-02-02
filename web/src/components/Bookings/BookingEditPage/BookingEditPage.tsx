import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./BookingEditPage.module.css";

import type {
  BookingUpdateRequest,
  BookingStatus,
  PickupLocation,
} from "../ManageBookingsPage/types";

import { bookingService } from "../ManageBookingsPage/bookingService";
import { referenceService } from "../../../shared/referenceService";

import Button from "../../Elements/Button/Button";
import Input from "../../Elements/Input/Input";

/* ---------------- constants ---------------- */

const STATUSES: BookingStatus[] = [
  "CREATED",
  "CONFIRMED",
  "CANCELLED",
  "FINISHED",
];

/* ---------------- form model ---------------- */

type BookingEditForm = {
  pickupLocationId: number;
  returnLocationId: number;
  carBookingStatus: BookingStatus;
  flatBookingStatus: BookingStatus;
  carBookingDateFrom: string; // LocalDateTime
  carBookingDateTo: string;
};

const BookingEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<BookingEditForm | null>(null);
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- load booking + references ---------------- */

  useEffect(() => {
    if (!id) return;

    Promise.all([
      bookingService.getBookingById(Number(id)), // BookingDetails
      referenceService.fetchPickupLocations(),
    ])
      .then(([booking, locations]) => {
        setLocations(locations);

        // MAP read-model → write-form
        setForm({
          pickupLocationId: booking.pickupLocation.id,
          returnLocationId: booking.returnLocation.id,
          carBookingStatus: booking.carStatus.name as BookingStatus,
          flatBookingStatus:
            (booking.flatStatus as BookingStatus) ?? "CREATED",
          // carBookingDateFrom: stripTimezone(booking.carBookingDateFrom),
          // carBookingDateTo: stripTimezone(booking.carBookingDateTo),
          carBookingDateFrom: toLocalStart(stripTimezone(booking.carBookingDateFrom).split("T")[0]),
          carBookingDateTo: toLocalEnd(stripTimezone(booking.carBookingDateTo).split("T")[0]),
  
        });
      })
      .catch(() => setError("Failed to load booking"))
      .finally(() => setLoading(false));
  }, [id]);

  /* ---------------- helpers ---------------- */

  const stripTimezone = (value: string) => value.split(".")[0];

  const normalizeBackendDate = (value: string): string => {
    // Keep only yyyy-MM-ddTHH:mm:ss
    return value.replace(/(\.\d+)?([+-]\d{2}:?\d{2}|Z)$/, "");
  };

  const update = <K extends keyof BookingEditForm>(
    key: K,
    value: BookingEditForm[K]
  ) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  };

  const toLocalStart = (date: string) => `${date}T00:00:00`;
  const toLocalEnd = (date: string) => `${date}T23:59:59`;

  /* ---------------- submit ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !id) return;

    const payload: BookingUpdateRequest = {
      pickupLocationId: form.pickupLocationId,
      returnLocationId: form.returnLocationId,
      carBookingStatus: form.carBookingStatus,
      flatBookingStatus: form.flatBookingStatus,
      carBookingDateFrom: form.carBookingDateFrom,
      carBookingDateTo: form.carBookingDateTo,
    };

    try {
      setSaving(true);
      setError(null);
      await bookingService.updateBooking(Number(id), payload);
      navigate(`/bookings/${id}`);
    } catch {
      setError("Failed to update booking");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- render ---------------- */

  if (loading) return <div>Loading…</div>;
  if (!form) return <div>Booking not found</div>;

  return (
    <div className={styles.page}>
      <h1>Edit Booking</h1>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          {/* Pickup */}
          <div className={styles.formGroup}>
            <label>Pickup location</label>
            <select
              value={form.pickupLocationId}
              onChange={(e) =>
                update("pickupLocationId", Number(e.target.value))
              }
              required
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.address}
                </option>
              ))}
            </select>
          </div>

          {/* Return */}
          <div className={styles.formGroup}>
            <label>Return location</label>
            <select
              value={form.returnLocationId}
              onChange={(e) =>
                update("returnLocationId", Number(e.target.value))
              }
              required
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.address}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className={styles.formGroup}>
            <label>From</label>
            <Input
              type="date"
              value={form.carBookingDateFrom.split("T")[0]}
              onChange={(v) =>
                update("carBookingDateFrom", toLocalStart(v))
              }
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>To</label>
            <Input
              type="date"
              value={form.carBookingDateTo.split("T")[0]}
              onChange={(v) =>
                update("carBookingDateTo", toLocalEnd(v))
              }
              required
            />
          </div>

          {/* Statuses */}
          <div className={styles.formGroup}>
            <label>Car booking status</label>
            <select
              value={form.carBookingStatus}
              onChange={(e) =>
                update("carBookingStatus", e.target.value as BookingStatus)
              }
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Flat booking status</label>
            <select
              value={form.flatBookingStatus}
              onChange={(e) =>
                update("flatBookingStatus", e.target.value as BookingStatus)
              }
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            label="Cancel"
            onClick={() => navigate(`/bookings/${id}`)}
          />
          <Button
            type="submit"
            label={saving ? "Saving…" : "Save changes"}
            disabled={saving}
          />
        </div>
      </form>
    </div>
  );
};

export default BookingEditPage;
