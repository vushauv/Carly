import type { FilterFieldDef } from "../FiltersForm/FiltersForm";

type Filters = {
    userId: string;
    nameOrSurname: string;
    email: string;
    isEnabled: string;
};

const defaultFilters: Filters = {
    userId: "",
    nameOrSurname: "",
    email: "",
    isEnabled: "",
};

type UserFilterKey =
    | "userId"
    | "nameOrSurname"
    | "email";

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
];

export { type Filters, defaultFilters, type UserFilterKey, userFilterFields };