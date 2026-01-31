import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ManageCarsPage.module.css";
import AddNewEntityComponent from "../AddNewEntityComponent/AddNewComponent";
import FiltersForm from "../FiltersForm/FiltersForm";
import type { Car } from "./types";
import { type CarFilters, defaultCarFilters, type CarFilterKey, carFilterFields } from "./filters.conf";
import DataTable from "../DataTable/DataTable";
import { carsColumns, carsRowKey, carsActions } from "./datatable.conf";
import Pagination from "../Pagination/Pagination";
import { carService } from "./carService";

const PAGE_SIZE = 10; // Match API default

const ManageCarsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CarFilters>(defaultCarFilters);
  const [cars, setCars] = useState<Car[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0); // API uses 0-based pagination
  const [totalCars, setTotalCars] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Partial<CarFilters>>({});

  const totalPages = Math.max(1, Math.ceil(totalCars / PAGE_SIZE));

  const loadCarsPage = async (page: number, filtersToApply: Partial<CarFilters> = {}) => {
    try {
      setLoading(true);
      
      // Convert string filters to appropriate types for the service
      const serviceFilters = {
        brand: filtersToApply.brand,
        model: filtersToApply.model,
        color: filtersToApply.color,
        fuelType: filtersToApply.fuelType,
        status: filtersToApply.status,
        availability: filtersToApply.availability as "AVAILABLE" | "RENTED" | undefined,
        priceMin: filtersToApply.priceMin ? parseFloat(filtersToApply.priceMin) : undefined,
        priceMax: filtersToApply.priceMax ? parseFloat(filtersToApply.priceMax) : undefined,
      };

      // Apply filters if any are provided
      const hasFilters = Object.values(filtersToApply).some(value => value !== "" && value !== undefined);
      
      let result;
      if (hasFilters) {
        // Use search endpoint with filters
        result = await carService.getAllCars(page, PAGE_SIZE, serviceFilters);
      } else {
        // Use regular getAllCars without filters
        result = await carService.getAllCars(page, PAGE_SIZE);
      }
      
      setCars(result.cars);
      setTotalCars(result.totalCount);
    } catch (err) {
      console.error("Failed to load cars:", err);
      // Error handling removed - no user-facing error message
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (filterValues: Partial<CarFilters>) => {
    console.log("Applying filters:", filterValues);
    setActiveFilters(filterValues);
    setCurrentPage(0); // Reset to first page when filtering
    loadCarsPage(0, filterValues);
  };

  const handleResetFilters = () => {
    console.log("Resetting filters");
    setActiveFilters({});
    setFilters(defaultCarFilters);
    setCurrentPage(0);
    loadCarsPage(0, {}); // Load without filters
  };

  const handleDeleteCar = async (carId: number) => {
    if (!window.confirm("Are you sure you want to delete this car? This action cannot be undone.")) {
      return;
    }

    try {
      await carService.deleteCar(carId);
      // Refresh the current page after deletion
      loadCarsPage(currentPage, activeFilters);
    } catch (err) {
      console.error("Failed to delete car:", err);
      // Error handling removed - no user-facing error message
    }
  };

  const handleCarAction = (actionId: string, car: Car) => {
    switch (actionId) {
      case "view":
        navigate(`/cars/${car.carId}`);
        break;
      case "edit":
        navigate(`/cars/${car.carId}/edit`);
        break;
      case "delete":
        handleDeleteCar(car.carId);
        break;
    }
  };

  useEffect(() => {
    setCurrentPage(0);
    loadCarsPage(0);
  }, []);

  const actionsWithHandlers = useMemo(() => 
    carsActions.map(action => ({
      ...action,
      onClick: (car: Car) => handleCarAction(action.id, car)
    })), [navigate]
  );

  const columns = useMemo(
    () => carsColumns({ 
      primaryCell: styles.primaryCell, 
      status: styles.status,
    }),
    [styles.primaryCell, styles.status]
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Admin Dashboard – Manage Cars</h1>

      <FiltersForm<CarFilterKey>
        fields={carFilterFields}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Display active filters summary */}
      {Object.keys(activeFilters).length > 0 && (
        <div className={styles.activeFilters}>
          <strong>Active filters:</strong>
          {Object.entries(activeFilters).map(([key, value]) => 
            value ? (
              <span key={key} className={styles.filterTag}>
                {key}: {value}
              </span>
            ) : null
          )}
          <button 
            onClick={handleResetFilters}
            className={styles.clearFiltersBtn}
          >
            Clear all filters
          </button>
        </div>
      )}

      <AddNewEntityComponent
        title="Cars"
        buttonText="Add new car"
        onButtonClick={() => {
          navigate("/cars/new");
        }}
      />

      {loading ? (
        <div className={styles.loading}>Loading cars...</div>
      ) : (
        <DataTable<Car>
          rows={cars}
          rowKey={carsRowKey}
          columns={columns}
          actions={actionsWithHandlers}
          emptyText={Object.keys(activeFilters).length > 0 
            ? "No cars found matching the current filters." 
            : "No cars found."
          }
        />
      )}

      <Pagination
        currentPage={currentPage + 1} // Display 1-based to user
        totalPages={totalPages}
        onPrev={() => {
          const newPage = Math.max(0, currentPage - 1);
          setCurrentPage(newPage);
          loadCarsPage(newPage, activeFilters);
        }}
        onNext={() => {
          const newPage = Math.min(totalPages - 1, currentPage + 1);
          setCurrentPage(newPage);
          loadCarsPage(newPage, activeFilters);
        }}
      />
    </div>
  );
};

export default ManageCarsPage;
