import type { ColumnDef, RowAction } from "../../components/DataTable/DataTable";
import type { User } from "./types";

export const usersRowKey = (u: User) => u.userId;

export const usersColumns = (styles: {
  primaryCell: string;
  status: string;
}): ColumnDef<User>[] => [
  { id: "id", header: "Id", cell: (u) => u.userId, width: "30px" },
  {
    id: "name",
    header: "Name",
    cell: (u) =>
      `${u.firstName} ${u.lastName}`,
    cellClassName: styles.primaryCell,
    width: "10",
  },
  { id: "email", header: "Email", cell: (u) => u.email, width: "30" },
  { id: "userType", header: "Type", cell: (u) => u.userType, width: "22" },
  { id: "createdAt", header: "Created At", cell: (u) => u.createdAt, width: "22" },
];

export const usersActions: RowAction<User>[] = [
  {
    id: "details",
    label: "Details",
    onClick: () => {}, // injected later
  },
  {
    id: "edit",
    label: "Edit",
    color: "secondary",
    onClick: () => {}, // injected later
  },
];
