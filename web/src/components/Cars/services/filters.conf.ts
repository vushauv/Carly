import type { FilterFieldDef } from "../../Elements/FiltersForm/FiltersForm";

type CarFilters = {
    carId: string;
    brand: string;
    model: string;
    color: string;
    fuelType: string;
    status: string;
    availability: string;
    priceMin: string;
    priceMax: string;
};

const defaultCarFilters: CarFilters = {
    carId: "",
    brand: "",
    model: "",
    color: "",
    fuelType: "",
    status: "",
    availability: "",
    priceMin: "",
    priceMax: "",
};

type CarFilterKey =
    | "carId"
    | "brand"
    | "model"
    | "color"
    | "fuelType"
    | "status"
    | "availability"
    | "priceMin"
    | "priceMax";

const carFilterFields: FilterFieldDef<CarFilterKey>[] = [
    {
        key: "carId",
        label: "Car ID",
        type: "text",
        placeholder: "e.g. 123",
        hint: "Search by car ID",
        errorMessage: "Please enter a valid car ID.",
    },
    {
        key: "brand",
        label: "Brand",
        type: "text",
        placeholder: "e.g. Toyota, BMW",
        hint: "Search by car brand",
        errorMessage: "Please enter a valid brand.",
    },
    {
        key: "model",
        label: "Model",
        type: "text",
        placeholder: "e.g. Yaris, A4",
        hint: "Search by car model",
        errorMessage: "Please enter a valid model.",
    },
    {
        key: "color",
        label: "Color",
        type: "text",
        placeholder: "e.g. Red, Blue",
        hint: "Search by car color",
        errorMessage: "Please enter a valid color.",
    },
    {
        key: "fuelType",
        label: "Fuel Type",
        type: "text",
        placeholder: "e.g. Petrol, Diesel, Electric",
        hint: "Search by fuel type",
        errorMessage: "Please enter a valid fuel type.",
    },
    {
        key: "status",
        label: "Status",
        type: "text",
        placeholder: "e.g. Available, Rented",
        hint: "Search by car status",
        errorMessage: "Please enter a valid status.",
    },
    {
        key: "availability",
        label: "Availability",
        type: "text",
        placeholder: "AVAILABLE / RENTED",
        hint: "Filter by availability status",
        errorMessage: "Please enter AVAILABLE or RENTED.",
    },
    {
        key: "priceMin",
        label: "Min Price",
        type: "number",
        placeholder: "e.g. 50",
        hint: "Minimum price per day",
        errorMessage: "Please enter a valid minimum price.",
    },
    {
        key: "priceMax",
        label: "Max Price",
        type: "number",
        placeholder: "e.g. 200",
        hint: "Maximum price per day",
        errorMessage: "Please enter a valid maximum price.",
    },
];

export { type CarFilters, defaultCarFilters, type CarFilterKey, carFilterFields };