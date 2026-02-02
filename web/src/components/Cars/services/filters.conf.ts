import type { FilterFieldDef } from "../../Elements/FiltersForm/FiltersForm";
import { useState, useEffect } from "react";
import { referenceService, type ReferenceDictionary } from "../../../shared/referenceService";

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

// Helper function to normalize reference names
function normalizeName(s: string): string {
    return s.toLowerCase().replace(/\s+/g, "");
}

// Helper function to create options from reference data
const createOptionsFromReference = (ref?: ReferenceDictionary): { value: string; label: string }[] => {
    if (!ref) return [{ value: "", label: "All" }];
    return [
        { value: "", label: "All" },
        ...ref.values.map(value => ({ value, label: value }))
    ];
};

// Hook to get dynamic car filter fields with reference data
export const useCarFilterFields = (): FilterFieldDef<CarFilterKey>[] => {
    const [refs, setRefs] = useState<Record<string, ReferenceDictionary>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        referenceService
            .getCarReferences()
            .then(res => {
                const list = res.referenceData;
                const map: Record<string, ReferenceDictionary> = {};
                
                for (const d of list) {
                    const n = normalizeName(d.name);
                    console.log(n)
                    if (n === "brand") map.brand = d;
                    else if (n === "model") map.model = d;
                    else if (n === "color") map.color = d;
                    else if (n === "fueltype") map.fuelType = d;
                    else if (n === "status") map.status = d;
                }
                
                setRefs(map);
            })
            .catch(err => {
                console.error("Failed to load car references:", err);
            })
            .finally(() => setLoading(false));
    }, []);

    return [
        {
            key: "brand",
            label: "Brand",
            type: "select",
            placeholder: "Select brand",
            hint: "Search by car brand",
            errorMessage: "Please select a valid brand.",
            options: createOptionsFromReference(refs.brand),
        },
        {
            key: "model",
            label: "Model",
            type: "select",
            placeholder: "Select model",
            hint: "Search by car model",
            errorMessage: "Please select a valid model.",
            options: createOptionsFromReference(refs.model),
        },
        {
            key: "color",
            label: "Color",
            type: "select",
            placeholder: "Select color",
            hint: "Search by car color",
            errorMessage: "Please select a valid color.",
            options: createOptionsFromReference(refs.color),
        },
        {
            key: "fuelType",
            label: "Fuel Type",
            type: "select",
            placeholder: "Select fuel type",
            hint: "Search by fuel type",
            errorMessage: "Please select a valid fuel type.",
            options: createOptionsFromReference(refs.fuelType),
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            placeholder: "Select status",
            hint: "Search by car status",
            errorMessage: "Please select a valid status.",
            options: createOptionsFromReference(refs.status),
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
};

// Keep the old export for backward compatibility but mark as deprecated
const carFilterFields: FilterFieldDef<CarFilterKey>[] = [];

export { type CarFilters, defaultCarFilters, type CarFilterKey, carFilterFields };