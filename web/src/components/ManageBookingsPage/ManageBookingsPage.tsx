import { useEffect, useState } from "react";
import FilterBar from "../FilterBar/FilterBar";
import Input from "../Input/Input";
import Button from "../Button/Button";
import styles from "./ManageBookingsPage.module.css";

type Car = {
  id: string;
  name: string;
  brand: string;
  location: string;
  status: "Active" | "Inactive";
  availability: "Available" | "Rented" | "Maintenance";
  pricePerDay: number;
};

// Fake "backend" data (placeholders for now)
const fakeCars: Car[] = [
  {
    id: "c1",
    name: "Toyota Yaris",
    brand: "Toyota",
    location: "Warsaw Center",
    status: "Active",
    availability: "Available",
    pricePerDay: 35,
  },
  {
    id: "c2",
    name: "BMW 3 Series",
    brand: "BMW",
    location: "Warsaw Airport",
    status: "Active",
    availability: "Rented",
    pricePerDay: 95,
  },
  {
    id: "c3",
    name: "Audi A4",
    brand: "Audi",
    location: "Krakow Main",
    status: "Active",
    availability: "Maintenance",
    pricePerDay: 90,
  },
  {
    id: "c4",
    name: "Skoda Octavia",
    brand: "Skoda",
    location: "Gdansk Old Town",
    status: "Inactive",
    availability: "Available",
    pricePerDay: 55,
  },
  {
    id: "c5",
    name: "Hyundai i20",
    brand: "Hyundai",
    location: "Warsaw Center",
    status: "Active",
    availability: "Available",
    pricePerDay: 40,
  },
  {
    id: "c6",
    name: "Mercedes A-Class",
    brand: "Mercedes",
    location: "Warsaw Airport",
    status: "Active",
    availability: "Available",
    pricePerDay: 110,
  },
  {
    id: "c7",
    name: "Volkswagen Golf",
    brand: "Volkswagen",
    location: "Krakow Main",
    status: "Active",
    availability: "Rented",
    pricePerDay: 60,
  },
];

const PAGE_SIZE = 3;

const ManageBookingsPage = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCars, setTotalCars] = useState<number>(0);

  const totalPages = Math.max(1, Math.ceil(totalCars / PAGE_SIZE));

  const loadCarsPage = (page: number) => {
    // Future backend shape idea:
    // GET /cars?page=X&pageSize=Y -> { items: Car[], total: number }
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    setTotalCars(fakeCars.length);
    setCars(fakeCars.slice(startIndex, endIndex));
  };

  useEffect(() => {
    setCurrentPage(1);
    loadCarsPage(1);
  }, []);

  // Blueprint only: no real filtering logic yet
  const applyFilters = () => {};
  const resetFilters = () => {};

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Admin Dashboard – Manage Bookings</h1>

      <div className={styles.topActions}>
        <Button onClick={() => {}}>Add new car</Button>
      </div>

      <h3 className={styles.subTitle}>Search criteria</h3>

      <FilterBar onApply={applyFilters} onReset={resetFilters}>
        <div className={styles.filters}>
          <div className={styles.field}>
            <span className={styles.label}>CarId</span>
            <Input
              type="text"
              placeholder="e.g. c1"
              hint="Car internal ID"
              errorMessage="Please enter a valid car id."
              isRequired={false}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Name</span>
            <Input
              type="text"
              placeholder="e.g. Toyota Yaris"
              hint="Car display name"
              errorMessage="Please enter a valid name."
              isRequired={false}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Location</span>
            <Input
              type="text"
              placeholder="e.g. Warsaw Center"
              hint="Current service point"
              errorMessage="Please enter a valid location."
              isRequired={false}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Brand</span>
            <Input
              type="text"
              placeholder="e.g. BMW"
              hint="Car brand"
              errorMessage="Please enter a valid brand."
              isRequired={false}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Status</span>
            <Input
              type="text"
              placeholder="Active / Inactive"
              hint="Whether the car is active in the system"
              errorMessage="Please enter a valid status."
              isRequired={false}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Price</span>
            <Input
              type="number"
              placeholder="e.g. 50"
              hint="Price per day"
              errorMessage="Please enter a valid number."
              isRequired={false}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Availability</span>
            <Input
              type="text"
              placeholder="Available / Rented / Maintenance"
              hint="Current availability state"
              errorMessage="Please enter a valid availability."
              isRequired={false}
            />
          </div>
        </div>
      </FilterBar>

      <h3 className={styles.subTitle}>Cars</h3>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Id</span>
          <span>Name</span>
          <span>Is active</span>
          <span className={styles.actionsHeader}>Actions</span>
        </div>

        {cars.map((c) => (
          <div key={c.id} className={styles.tableRow}>
            <span>{c.id}</span>
            <span className={styles.car}>{c.name}</span>
            <span className={styles.status}>{c.status === "Active" ? "true" : "false"}</span>
            <div className={styles.actionButtons}>
              <Button onClick={() => {}}>Details</Button>
              <Button onClick={() => {}} color="secondary">
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      {cars.length === 0 ? <p className={styles.empty}>No cars found.</p> : null}

      <div className={styles.pagination}>
        <Button
          onClick={() => {
            const next = Math.max(1, currentPage - 1);
            setCurrentPage(next);
            loadCarsPage(next);
          }}
          disabled={currentPage === 1}
        >
          Prev
        </Button>

        <span className={styles.pageInfo}>
          Page {currentPage} / {totalPages}
        </span>

        <Button
          onClick={() => {
            const next = Math.min(totalPages, currentPage + 1);
            setCurrentPage(next);
            loadCarsPage(next);
          }}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ManageBookingsPage;
