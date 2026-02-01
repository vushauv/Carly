import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UsersPage.module.css";
import AddNewEntityComponent from "../../Elements//AddNewEntityComponent/AddNewComponent";
import FiltersForm from "../../Elements/FiltersForm/FiltersForm.tsx";
import type { User } from "../services/types.ts";
import { defaultFilters, type UserFilterKey, userFilterFields } from "../services/filters.conf.ts";
import DataTable from "../../Elements/DataTable/DataTable";
import { usersColumns, usersRowKey, usersActions } from "../services/datatable.conf.ts";
import Pagination from "../../Elements//Pagination/Pagination.tsx";
import { userService } from "../services/userService.ts";

const PAGE_SIZE = 3; // Reduced for testing

const ManageUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0); // API uses 0-based pagination
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Record<UserFilterKey, string>>(defaultFilters);


  const loadUsersPage = async (page: number, f: Record<UserFilterKey, string>) => {
    try {
      setLoading(true);

      const usersData = await userService.getAllUsers(page, PAGE_SIZE + 1, {
        userId: f.userId ? Number(f.userId) : undefined,
        name: f.nameOrSurname?.trim() || undefined,
        email: f.email?.trim() || undefined,
        // you can later pass isEnabled if you add it to backend params
        // isEnabled: f.isEnabled?.trim() || undefined,
      });

      setUsers(usersData.slice(0, PAGE_SIZE));
      setHasNextPage(usersData.length > PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await userService.deleteUser(userId);

      // Try to reload the same page; if it becomes empty, go back until we find data (or reach page 0)
      let pageToLoad = currentPage;

      while (pageToLoad > 0) {
        const pageData = await userService.getAllUsers(pageToLoad, PAGE_SIZE + 1, {
          userId: appliedFilters.userId ? Number(appliedFilters.userId) : undefined,
          name: appliedFilters.nameOrSurname?.trim() || undefined,
          email: appliedFilters.email?.trim() || undefined,
        });

        if (pageData.length > 0) {
          setUsers(pageData.slice(0, PAGE_SIZE));
          setHasNextPage(pageData.length > PAGE_SIZE);
          setCurrentPage(pageToLoad);
          return;
        }

        pageToLoad -= 1;
      }

      // Fallback: load page 0
      const firstPage = await userService.getAllUsers(0, PAGE_SIZE + 1);
      setUsers(firstPage.slice(0, PAGE_SIZE));
      setHasNextPage(firstPage.length > PAGE_SIZE);
      setCurrentPage(0);
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleUserAction = (actionId: string, user: User) => {
    switch (actionId) {
      case "view":
        navigate(`/users/${user.userId}`);
        break;
      case "edit":
        navigate(`/users/${user.userId}/edit`);
        break;
      case "delete":
        handleDeleteUser(user.userId);
        break;
    }
  };

  useEffect(() => {
    setCurrentPage(0);
    setAppliedFilters(defaultFilters);
    loadUsersPage(0, defaultFilters);
  }, []);


  const actionsWithHandlers = useMemo(
    () =>
      usersActions.map((action) => ({
        ...action,
        onClick: (user: User) => handleUserAction(action.id, user),
      })),
    [navigate]
  );

  const columns = useMemo(
    () =>
      usersColumns({
        primaryCell: styles.primaryCell,
        status: styles.status,
      }),
    [styles.primaryCell, styles.status]
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Admin Dashboard – Manage Users</h1>

      <FiltersForm<UserFilterKey>
        fields={userFilterFields}
        onApply={(values) => {
          setAppliedFilters(values);
          setCurrentPage(0);
          loadUsersPage(0, values);
        }}

        onReset={() => {
          setAppliedFilters(defaultFilters);
          setCurrentPage(0);
          loadUsersPage(0, defaultFilters);
        }}
      />


      <AddNewEntityComponent
        title="Users"
        buttonText="Register new user"
        onButtonClick={() => {
          navigate("/users/register");
        }}
      />

      {loading ? (
        <div className={styles.loading}>Loading users...</div>
      ) : (
        <DataTable<User>
          rows={users}
          rowKey={usersRowKey}
          columns={columns}
          actions={actionsWithHandlers}
          emptyText="No users found."
        />
      )}

      <Pagination
        currentPage={currentPage + 1}
        hasNextPage={hasNextPage}
        disabled={loading}
        onPrev={() => {
          if (currentPage === 0) return;
          const newPage = currentPage - 1;
          setCurrentPage(newPage);
          loadUsersPage(newPage, appliedFilters);
        }}
        onNext={() => {
          if (!hasNextPage) return;
          const newPage = currentPage + 1;
          setCurrentPage(newPage);
          loadUsersPage(newPage, appliedFilters);
        }}
      />


    </div>
  );
};

export default ManageUsersPage;
