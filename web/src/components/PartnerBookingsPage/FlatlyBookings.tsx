import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PartnerBookingsPage.module.css";
import type { FlatBooking } from "../Bookings/ManageBookingsPage/types";
import DataTable from "../Elements/DataTable/DataTable";
import Pagination from "../Elements/Pagination/Pagination";
import { bookingService } from "../Bookings/ManageBookingsPage/bookingService";
import Button from "../Elements/Button/Button";

const PAGE_SIZE = 3;

const FlatlyBookings = () => {
    const navigate = useNavigate();
    const [flatBookings, setFlatBookings] = useState<FlatBooking[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [hasNextPage, setHasNextPage] = useState<boolean>(true);
    const [loading, setLoading] = useState(false);

    const loadFlatBookingsPage = async (page: number) => {
        try {
          setLoading(true);
      
          const allFlatBookings = await bookingService.getFlatBookings();
      
          const startIndex = page * PAGE_SIZE;
          const endIndex = startIndex + PAGE_SIZE;
      
          setFlatBookings(allFlatBookings.slice(startIndex, endIndex));
          setHasNextPage(allFlatBookings.length > endIndex);
        } finally {
          setLoading(false);
        }
      };
      

    const handleCancelFlatBooking = async (flatBookingId: string) => {
        if (!window.confirm("Are you sure you want to cancel this flat booking?")) return;

        try {
            await bookingService.cancelFlatBooking(flatBookingId);
            // Reload current page after cancellation
            loadFlatBookingsPage(currentPage);
        } catch (err) {
            console.error("Failed to cancel flat booking:", err);
        }
    };

    const handleFlatBookingAction = (actionId: string, flatBooking: FlatBooking) => {
        switch (actionId) {
            case "view":
                navigate(`/flat-bookings/${flatBooking.booking.id}`);
                break;
            case "cancel":
                handleCancelFlatBooking(flatBooking.booking.id);
                break;
        }
    };

    useEffect(() => {
        setCurrentPage(0);
        loadFlatBookingsPage(0);
    }, []);

    const flatBookingsActions = useMemo(
        () => [
            {
                id: "view",
                label: "View Details",
                onClick: (flatBooking: FlatBooking) => handleFlatBookingAction("view", flatBooking),
            },
            {
                id: "cancel",
                label: "Cancel",
                color: "danger",
                onClick: (flatBooking: FlatBooking) => handleFlatBookingAction("cancel", flatBooking),
            },
        ],
        [navigate]
    );

    const flatBookingsColumns = useMemo(
        () => [
            {
                id: "userId",
                header: "User ID",
                cell: (flatBooking: FlatBooking) => (
                    <span className={styles.bookingId}>
                        {flatBooking.userId}
                    </span>
                ),
                width: "10%",
            },
            {
                id: "flat",
                header: "Flat",
                cell: (flatBooking: FlatBooking) => (
                    <div className={styles.flatInfo}>
                        <div className={styles.flatName}>{flatBooking.flat.name}</div>
                        <div className={styles.location}>
                            {flatBooking.flat.city}, {flatBooking.flat.country}
                        </div>
                    </div>
                ),
                width: "15%",
            },

            {
                id: "check-in",
                header: "Check-in",
                cell: (flatBooking: FlatBooking) => (
                    <div className={styles.dates}>
                        {new Date(flatBooking.booking.checkInDate).toLocaleDateString()}
                    </div>
                ),
                width: "15%",
            },
            {
                id: "check-out",
                header: "Check-out",
                cell: (flatBooking: FlatBooking) => (
                    <div className={styles.dates}>
                        {new Date(flatBooking.booking.checkOutDate).toLocaleDateString()}
                    </div>
                ),
                width: "15%",
            },
            {
                id: "guests",
                header: "Guests",
                cell: (flatBooking: FlatBooking) => (
                    <span>{flatBooking.booking.guestsCount}</span>
                ),
                width: "10%",
            },
            {
                id: "status",
                header: "Status",
                cell: (flatBooking: FlatBooking) => (
                    <span
                        className={`${styles.status} ${styles[flatBooking.flatBookingStatus.toLowerCase()]}`}
                    >
                        {flatBooking.flatBookingStatus}
                    </span>
                ),
                width: "15%",
            },

        ],
        []
    );

    return (
        <div>
            <h2 className={styles.subTitle}>Flat Bookings</h2>

            {loading ? (
                <div className={styles.loading}>Loading flat bookings...</div>
            ) : (
                <DataTable<FlatBooking>
                    rows={flatBookings}
                    rowKey={(flatBooking) => flatBooking.booking.id}
                    columns={flatBookingsColumns}
                    actions={flatBookingsActions}
                    emptyText="No flat bookings found."
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
                    loadFlatBookingsPage(newPage);
                }}
                onNext={() => {
                    if (!hasNextPage) return;
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    loadFlatBookingsPage(newPage);
                }}
            />
        </div>
    );
};

export default FlatlyBookings;