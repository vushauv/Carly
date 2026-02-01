import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ManageCarsPage.module.css";
import AddNewEntityComponent from "../AddNewEntityComponent/AddNewComponent";
import FiltersForm from "../FiltersForm/FiltersForm";
import type { Car } from "./types";
import { type CarFilters, type CarFilterKey, carFilterFields } from "./filters.conf";
import DataTable from "../DataTable/DataTable";
import { carsColumns, carsRowKey, carsActions } from "./datatable.conf";
import Pagination from "../Pagination/Pagination";
import { carService } from "./carService";

const PAGE_SIZE = 4; // Changed from 10 to 3 to match service default

const ManageCarsPage = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0); // API uses 0-based pagination
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Partial<CarFilters>>({});

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
        // Use search endpoint with filters - fetch one extra to check if there's a next page
        result = await carService.getAllCars(page, PAGE_SIZE + 1, serviceFilters);
      } else {
        // Use regular getAllCars without filters - fetch one extra to check if there's a next page
        result = await carService.getAllCars(page, PAGE_SIZE + 1);
      }
      
      // Extract cars array from result (assuming result has a cars property)
      const carsData = result.cars || result;
      
      // Set cars (excluding the extra one) and determine if there's a next page
      setCars(carsData.slice(0, PAGE_SIZE));
      setHasNextPage(carsData.length > PAGE_SIZE);
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
    setCurrentPage(0);
    loadCarsPage(0, {}); // Load without filters
  };

  const handleDeleteCar = async (carId: number) => {
    if (!window.confirm("Are you sure you want to delete this car? This action cannot be undone.")) {
      return;
    }

    try {
      await carService.deleteCar(carId);

      // Try to reload the same page; if it becomes empty, go back until we find data (or reach page 0)
      let pageToLoad = currentPage;

      while (pageToLoad > 0) {
        const result = await carService.getAllCars(pageToLoad, PAGE_SIZE + 1, 
          Object.keys(activeFilters).length > 0 ? {
            brand: activeFilters.brand,
            model: activeFilters.model,
            color: activeFilters.color,
            fuelType: activeFilters.fuelType,
            status: activeFilters.status,
            availability: activeFilters.availability as "AVAILABLE" | "RENTED" | undefined,
            priceMin: activeFilters.priceMin ? parseFloat(activeFilters.priceMin) : undefined,
            priceMax: activeFilters.priceMax ? parseFloat(activeFilters.priceMax) : undefined,
          } : undefined
        );

        const pageData = result.cars || result;

        if (pageData.length > 0) {
          setCars(pageData.slice(0, PAGE_SIZE));
          setHasNextPage(pageData.length > PAGE_SIZE);
          setCurrentPage(pageToLoad);
          return;
        }

        pageToLoad -= 1;
      }

      // Fallback: load page 0
      const firstPageResult = await carService.getAllCars(0, PAGE_SIZE + 1);
      const firstPageData = firstPageResult.cars || firstPageResult;
      setCars(firstPageData.slice(0, PAGE_SIZE));
      setHasNextPage(firstPageData.length > PAGE_SIZE);
      setCurrentPage(0);
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
    () => carsColumns(),
    []
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
        hasNextPage={hasNextPage}
        disabled={loading}
        onPrev={() => {
          if (currentPage === 0) return;
          const newPage = currentPage - 1;
          setCurrentPage(newPage);
          loadCarsPage(newPage, activeFilters);
        }}
        onNext={() => {
          if (!hasNextPage) return;
          const newPage = currentPage + 1;
          setCurrentPage(newPage);
          loadCarsPage(newPage, activeFilters);
        }}
      />
    </div>
  );
};

export default ManageCarsPage;
