import { useEffect, useState } from "react";
import styles from "./UsersPage.module.css";
import AddNewEntityComponent from "../AddNewEntityComponent/AddNewComponent";
import FiltersForm from "../FiltersForm/FiltersForm";
import { fakeUsers } from "./sampleData.ts";
import type { User } from "./types.ts";
import { type Filters, defaultFilters, type UserFilterKey, userFilterFields } from "./filters.conf.ts";
import DataTable from "../DataTable/DataTable";
import { usersColumns, usersRowKey, usersActions } from "./datatable.conf.ts";
import { useMemo } from "react";
import Pagination from "../Pagination/Pagination.tsx";


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

  const columns = useMemo(
    () => usersColumns({ primaryCell: styles.primaryCell, status: styles.status }),
    [styles.primaryCell, styles.status]
  );
  


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

      <DataTable<User>
        rows={users}
        rowKey={usersRowKey}
        columns={columns}
        actions={usersActions}
        emptyText="No users found."
      />



      {/* <div className={styles.pagination}>
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
      </div> */}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => {
          const newPage = Math.max(1, currentPage - 1);
          setCurrentPage(newPage);
          loadUsersPage(newPage);
        }}
        onNext={() => {
          const newPage = Math.min(totalPages, currentPage + 1);
          setCurrentPage(newPage);
          loadUsersPage(newPage);
        }}
      />
    </div>
  );
};

export default ManageUsersPage;
