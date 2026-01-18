import { useEffect, useState } from "react";
import FilterBar from "../FilterBarLayout/FilterBarLayout";
import Input from "../Input/Input";
import Button from "../Button/Button";
import styles from "./UsersPage.module.css"; // reusing same styles
import AddNewEntityComponent from "../AddNewEntityComponent/AddNewComponent";

type UserType = "ADMIN" | "CUSTOMER" | "MANAGER";

type User = {
  userId: number;
  firstName: string;
  secondName?: string | null;
  lastName: string;
  email: string;
  contactNumber?: number | null;
  userType: UserType;
  isEnabled: boolean;
  createdAt: string; // ISO-like string for demo
};

// Fake "backend" data (only for rendering placeholders)
const fakeUsers: User[] = [
  {
    userId: 1,
    firstName: "Anna",
    secondName: null,
    lastName: "Kowalska",
    email: "anna.kowalska@example.com",
    contactNumber: 48123456789,
    userType: "CUSTOMER",
    isEnabled: true,
    createdAt: "2026-01-02",
  },
  {
    userId: 2,
    firstName: "Piotr",
    secondName: "Jan",
    lastName: "Nowak",
    email: "piotr.nowak@example.com",
    contactNumber: null,
    userType: "MANAGER",
    isEnabled: true,
    createdAt: "2026-01-05",
  },
  {
    userId: 3,
    firstName: "Vasil",
    secondName: null,
    lastName: "Vushau",
    email: "vasil@example.com",
    contactNumber: 48500111222,
    userType: "ADMIN",
    isEnabled: true,
    createdAt: "2026-01-10",
  },
  {
    userId: 4,
    firstName: "Ola",
    secondName: null,
    lastName: "Zielinska",
    email: "ola.zielinska@example.com",
    contactNumber: 48777111222,
    userType: "CUSTOMER",
    isEnabled: false,
    createdAt: "2025-12-20",
  },
  {
    userId: 5,
    firstName: "Mateusz",
    secondName: null,
    lastName: "Kaczmarek",
    email: "mateusz.k@example.com",
    contactNumber: 48666111222,
    userType: "CUSTOMER",
    isEnabled: true,
    createdAt: "2026-01-14",
  },
  {
    userId: 6,
    firstName: "Kasia",
    secondName: "Maria",
    lastName: "Lewandowska",
    email: "kasia.lew@example.com",
    contactNumber: null,
    userType: "MANAGER",
    isEnabled: true,
    createdAt: "2026-01-16",
  },
  {
    userId: 7,
    firstName: "Tomasz",
    secondName: null,
    lastName: "Wrobel",
    email: "twrobel@example.com",
    contactNumber: 48555111222,
    userType: "CUSTOMER",
    isEnabled: true,
    createdAt: "2026-01-17",
  },
];

const PAGE_SIZE = 3;

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

const ManageUsersPage = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));

  const loadUsersPage = (page: number) => {
    // Placeholder only.
    // Later: GET /users?page=X&pageSize=Y&filters...
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    setTotalUsers(fakeUsers.length);
    setUsers(fakeUsers.slice(startIndex, endIndex));
  };

  useEffect(() => {
    setCurrentPage(1);
    loadUsersPage(1);
  }, []);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Admin Dashboard – Manage Users</h1>

      

      <h3 className={styles.subTitle}>Search criteria</h3>

      {/* onApply / onReset will later trigger API calls */}
      <FilterBar onApply={() => {}} onReset={() => {}}>
        <div className={styles.filters}>
          <div className={styles.field}>
            <span className={styles.label}>UserId</span>
            <Input
              type="text"
              placeholder="e.g. 3"
              hint="Internal user ID"
              errorMessage="Please enter a valid user id."
              isRequired={false}
              value={filters.userId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFilters((p) => ({ ...p, userId: e.target.value }))
              }
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Name / Surname</span>
            <Input
              type="text"
              placeholder="e.g. Nowak, Anna"
              hint="Matches first/second/last name"
              errorMessage="Please enter a valid text."
              isRequired={false}
              value={filters.nameOrSurname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFilters((p) => ({ ...p, nameOrSurname: e.target.value }))
              }
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Email</span>
            <Input
              type="text"
              placeholder="e.g. anna@..."
              hint="Search by email substring"
              errorMessage="Please enter a valid email."
              isRequired={false}
              value={filters.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFilters((p) => ({ ...p, email: e.target.value }))
              }
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>User type</span>
            <Input
              type="text"
              placeholder="ADMIN / CUSTOMER / MANAGER"
              hint="Dictionary type"
              errorMessage="Please enter a valid user type."
              isRequired={false}
              value={filters.userType}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFilters((p) => ({ ...p, userType: e.target.value }))
              }
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Created from</span>
            <Input
              type="date"
              placeholder=""
              hint="Date of adding (from)"
              errorMessage="Please enter a valid date."
              isRequired={false}
              value={filters.createdFrom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFilters((p) => ({ ...p, createdFrom: e.target.value }))
              }
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Created to</span>
            <Input
              type="date"
              placeholder=""
              hint="Date of adding (to)"
              errorMessage="Please enter a valid date."
              isRequired={false}
              value={filters.createdTo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFilters((p) => ({ ...p, createdTo: e.target.value }))
              }
            />
          </div>
        </div>
      </FilterBar>

      <AddNewEntityComponent
          title="Users"
          buttonText="Add new user"
          onButtonClick={() => {
            // later: navigate("/users/new") or open modal
        }}
      />
      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Id</span>
          <span>Name</span>
          <span>Email</span>
          <span>Is enabled</span>
          <span className={styles.actionsHeader}>Actions</span>
        </div>

        {users.map((u) => (
          <div key={u.userId} className={styles.tableRow}>
            <span>{u.userId}</span>

            <span className={styles.car}>
              {u.firstName} {u.secondName ? `${u.secondName} ` : ""}
              {u.lastName}
            </span>

            <span>{u.email}</span>

            <span className={styles.status}>
              {u.isEnabled ? "true" : "false"}
            </span>

            <div className={styles.actionButtons}>
              <Button>Details</Button>
              <Button color="secondary">Edit</Button>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 ? <p className={styles.empty}>No users found.</p> : null}

      <div className={styles.pagination}>
        <Button
          disabled={currentPage === 1}
        >
          Prev
        </Button>

        <span className={styles.pageInfo}>
          Page {currentPage} / {totalPages}
        </span>

        <Button
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ManageUsersPage;
