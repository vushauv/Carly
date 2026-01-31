// entities/user/user.ui.ts
import type { User, UserTableRow } from "./user.types";
import type { ColumnDef } from "@/shared/ui/DataTable/DataTable";
import type { FilterFieldDef } from "@/shared/ui/FiltersForm";

export const userTableRowKey = (u: UserTableRow) => u.userId; // Changed from id to userId

export const userColumns: ColumnDef<UserTableRow>[] = [
  { id: "userId", header: "User ID", cell: (u) => u.userId, width: "80px" }, // Changed from id
  {
    id: "name",
    header: "Name",
    cell: (u) => u.fullName,
    cellClassName: "primaryCell",
    width: "30%",
  },
  { id: "email", header: "Email", cell: (u) => u.email, width: "40%" },
];

export const userActions = [
  { id: "details", label: "View Details" },
  { id: "edit", label: "Edit", color: "secondary" },
  { id: "delete", label: "Delete", color: "danger" },
] as const;

export type UserActionId = typeof userActions[number]["id"];

// User List Configuration
export const userListConfig = {
  entityName: "User",
  entityPlural: "Users",
  noDataText: "No users found",
  
  // Table configuration
  table: {
    rowKey: userTableRowKey,
    columns: userColumns,
    actions: userActions,
  },
  
  // Data transformation
  mapToRow: (user: User): UserTableRow => ({
    userId: user.userId, // Changed from id to userId
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
  }),
  
  // Search and filtering
  search: {
    placeholder: "Search users by name or email...",
    searchFields: ["firstName", "lastName", "email"] as (keyof User)[],
  },
  
  // Pagination (matching API requirements)
  pagination: {
    defaultPageSize: 10, // Matches API default
    pageSizeOptions: [10, 20, 50],
  },
  
  // Sorting
  defaultSort: {
    field: "userId" as keyof User,
    direction: "desc" as "asc" | "desc",
  },
  
  // Actions configuration
  enabledActions: {
    create: true,
    view: true,
    edit: true,
    delete: true, // Enabled since API supports DELETE
  },
  
  // Export configuration
  export: {
    enabled: true,
    filename: "users",
    includeFields: ["userId", "firstName", "secondName", "lastName", "email", "contactNumber"] as (keyof User)[],
  },
} as const;

// Export the type for external use
export type UserListConfig = typeof userListConfig;