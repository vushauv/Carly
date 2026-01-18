import { useEffect, useState } from "react";
import Button from "../Button/Button";
import styles from "./UsersPage.module.css";
import AddNewEntityComponent from "../AddNewEntityComponent/AddNewComponent";
import FiltersForm from "../FiltersForm/FiltersForm";
import { fakeUsers } from "./sampleData.ts";
import type { User } from "./types.ts";
import {type Filters, defaultFilters, type UserFilterKey, userFilterFields} from "./filters.ts";


const PAGE_SIZE = 3;



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


      <FiltersForm<UserFilterKey>
        fields={userFilterFields}
        onApply={(values) => {
          // call API: GET /users?... based on values
          console.log("APPLY", values);
        }}
        onReset={() => {
          // optional: call API without filters
          console.log("RESET");
        }}
      />

          

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
