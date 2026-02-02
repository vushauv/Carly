import type { ColumnDef, RowAction } from "../../Elements/DataTable/DataTable";
import type { Car } from "./types";

// Helper function to get car feature value by name
// Maps API feature names to the values we need for display
const getFeatureValue = (car: Car, featureType: string): string => {
  const featureNameMap: Record<string, string> = {
    brand: "Brand",
    model: "Model",
    fuelType: "Fuel type",
    status: "Status",
    color: "Color",
  };

  const apiFeatureName = featureNameMap[featureType];

  if (!apiFeatureName) return "";

  return car.carFeatures.find(f => f.name === apiFeatureName)?.value ?? "";
};

export const carsRowKey = (car: Car): string => car.carId.toString();

export const carsColumns = (): ColumnDef<Car>[] => [
  {
    id: "carId",
    header: "ID",
    cell: (car) => car.carId.toString(),
    width: "8%",
  },
  {
    id: "brand",
    header: "Brand",
    cell: (car) => getFeatureValue(car, "brand"),
    width: "15%",
  },
  {
    id: "model",
    header: "Model",
    cell: (car) => getFeatureValue(car, "model"),
    width: "15%",
  },

  {
    id: "fuelType",
    header: "Fuel Type",
    cell: (car) => getFeatureValue(car, "fuelType"),
    width: "12%",
  },
  {
    id: "status",
    header: "Status",
    cell: (car) => getFeatureValue(car, "status"),
    width: "10%",
  },
  
  {
    id: "price",
    header: "Price/Day",
    cell: (car) => `$${car.price.toFixed(2)}`,
    width: "12%",
  },
];

export const carsActions: RowAction<Car>[] = [
  {
    id: "view",
    label: "View",
    color: "primary",
    onClick: () => {}, // Will be overridden in component
  },
  {
    id: "edit",
    label: "Edit",
    color: "secondary",
    onClick: () => {}, // Will be overridden in component
  },
  {
    id: "delete",
    label: "Delete",
    color: "danger",
    onClick: () => {}, // Will be overridden in component
  },
];