import type { ColumnDef, RowAction } from "../../components/DataTable/DataTable";
import type { User } from "./types";

export const usersRowKey = (u: User) => u.userId;

export const usersColumns = (styles: {
  primaryCell: string;
  status: string;
  onAction?: (actionId: string, user: User) => void;
}): ColumnDef<User>[] => [
  { id: "id", header: "Id", cell: (u) => u.userId, width: "30px" },
{
  id: "name",
  header: "Name",
  cell: (u) =>
    [u.firstName, u.secondName, u.lastName]
      .filter(Boolean)
      .join(" "),
  cellClassName: styles.primaryCell,
  width: "10",
},

  { id: "email", header: "Email", cell: (u) => u.email, width: "30" },
  { id: "contactNumber", header: "Contact", cell: (u) => u.contactNumber?.toString() || "N/A", width: "22" },
];

export const usersActions: RowAction<User>[] = [
  {
    id: "view",
    label: "View Details",
    onClick: () => {}, // Will be injected in the component
  },
  {
    id: "edit",
    label: "Edit",
    color: "secondary",
    onClick: () => {}, // Will be injected in the component
  },
  {
    id: "delete",
    label: "Delete",
    color: "danger",
    onClick: () => {}, // Will be injected in the component
  },
];
