import type { FilterFieldDef } from "../FiltersForm/FiltersForm";

type Filters = {
    userId: string;
    nameOrSurname: string;
    email: string;
    userType: string;
    isEnabled: string;
    createdFrom: string;
    createdTo: string;
};

const defaultFilters: Filters = {
    userId: "",
    nameOrSurname: "",
    email: "",
    userType: "",
    isEnabled: "",
    createdFrom: "",
    createdTo: "",
};

type UserFilterKey =
    | "userId"
    | "nameOrSurname"
    | "email"
    | "userType"
    | "createdFrom"
    | "createdTo";

const userFilterFields: FilterFieldDef<UserFilterKey>[] = [
    {
        key: "userId",
        label: "UserId",
        type: "text",
        placeholder: "e.g. 3",
        hint: "Internal user ID",
        errorMessage: "Please enter a valid user id.",
    },
    {
        key: "nameOrSurname",
        label: "Name / Surname",
        type: "text",
        placeholder: "e.g. Nowak, Anna",
        hint: "Matches first/second/last name",
        errorMessage: "Please enter a valid text.",
    },
    {
        key: "email",
        label: "Email",
        type: "text",
        placeholder: "e.g. anna@...",
        hint: "Search by email substring",
        errorMessage: "Please enter a valid email.",
    },
    {
        key: "userType",
        label: "User type",
        type: "text",
        placeholder: "ADMIN / CUSTOMER / MANAGER",
        hint: "Dictionary type",
        errorMessage: "Please enter a valid user type.",
    },
    {
        key: "createdFrom",
        label: "Created from",
        type: "date",
        hint: "Date of adding (from)",
        errorMessage: "Please enter a valid date.",
    },
    {
        key: "createdTo",
        label: "Created to",
        type: "date",
        hint: "Date of adding (to)",
        errorMessage: "Please enter a valid date.",
    },
];

export { type Filters, defaultFilters, type UserFilterKey, userFilterFields };