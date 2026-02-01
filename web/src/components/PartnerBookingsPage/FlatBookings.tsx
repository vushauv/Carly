
import { useEffect, useState } from "react";
import FilterBar from "../Elements/FilterBarLayout/FilterBarLayout";
import Input from "../Elements/Input/Input";
import Button from "../Elements/Button/Button";
import styles from "./PartnerBookingsPage.module.css";

type FlatBooking = {
  id: string;
  customer: string;
  status: string;
};

const PAGE_SIZE = 3;

const fakeFlatBookings: FlatBooking[] = [
  { id: "FB-001", customer: "Alice Green", status: "Active" },
  { id: "FB-002", customer: "Tom Harris", status: "Cancelled" },
  { id: "FB-003", customer: "Sophie Martin", status: "Pending" },
  { id: "FB-004", customer: "Daniel Lee", status: "Active" },
  { id: "FB-005", customer: "Emma Clark", status: "Active" },
  { id: "FB-006", customer: "Noah Walker", status: "Cancelled" },
];

const FlatBookings = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<FlatBooking[]>([]);
  const totalPages = Math.max(1, Math.ceil(fakeFlatBookings.length / PAGE_SIZE));

  useEffect(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setRows(fakeFlatBookings.slice(start, end));
  }, [currentPage]);

  return (
    <div>
      <h2 className={styles.subTitle}>Flat bookings</h2>

      <FilterBar onApply={() => {}} onReset={() => {}}>
        <div className={styles.filters}>
          <div className={styles.field}>
            <span className={styles.label}>Booking ID</span>
            <Input placeholder="Booking ID" hint="id of a booking" errorMessage="provide a valid Booking ID" isRequired={false} type="number" />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Customer</span>
            <Input placeholder="Customer" hint="customer name" errorMessage="provide a valid name" isRequired={false} type="text" />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Status</span>
            <Input placeholder="Status" hint="status can be ..." errorMessage="provide a valid status" isRequired={false} type="text" />
          </div>
        </div>
      </FilterBar>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Id</span>
          <span>Customer</span>
          <span>Status</span>
          <span className={styles.actionsHeader}>Actions</span>
        </div>

        {rows.map((b) => (
          <div key={b.id} className={styles.tableRow}>
            <span className={styles.car}>{b.id}</span>
            <span>{b.customer}</span>
            <span className={styles.status}>{b.status}</span>
            <div className={styles.actionButtons}>
              <Button onClick={() => {}}>Details</Button>
              <Button onClick={() => {}}>Edit</Button>
            </div>
          </div>
        ))}
      </div>

      {rows.length === 0 ? <p className={styles.empty}>No results found.</p> : null}

      <div className={styles.pagination}>
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </Button>

        <span className={styles.pageInfo}>
          Page {currentPage} / {totalPages}
        </span>

        <Button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default FlatBookings;
