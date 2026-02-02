import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UsersPage.module.css";
import AddNewEntityComponent from "../AddNewEntityComponent/AddNewComponent";
import FiltersForm from "../FiltersForm/FiltersForm";
import type { User } from "./types.ts";
import { type Filters, defaultFilters, type UserFilterKey, userFilterFields } from "./filters.conf.ts";
import DataTable from "../DataTable/DataTable";
import { usersColumns, usersRowKey, usersActions } from "./datatable.conf.ts";
import Pagination from "../Pagination/Pagination.tsx";
import { userService } from "./userService.ts";

const PAGE_SIZE = 3; // Reduced for testing

const ManageUsersPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0); // API uses 0-based pagination
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsersPage = async (page: number) => {
    console.log(`[UsersPage] loadUsersPage called with page:`, page);
    try {
      console.log(`[UsersPage] Setting loading to true`);
      setLoading(true);

      const usersData = await userService.getAllUsers(page, PAGE_SIZE + 1);

      // If page doesn't exist anymore (empty), go back one page
      if (usersData.length === 0 && page > 0) {
        const prevPage = page - 1;
        const prevData = await userService.getAllUsers(prevPage, PAGE_SIZE + 1);

        setUsers(prevData.slice(0, PAGE_SIZE));
        setHasNextPage(prevData.length > PAGE_SIZE);
        setCurrentPage(prevPage);
        return;
      }

      setUsers(usersData.slice(0, PAGE_SIZE));
      setHasNextPage(usersData.length > PAGE_SIZE);
    } catch (err) {
      console.error("[UsersPage] Failed to load users:", err);
    } finally {
      console.log(`[UsersPage] Setting loading to false`);
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
        const pageData = await userService.getAllUsers(pageToLoad, PAGE_SIZE);

        if (pageData.length > 0) {
          setUsers(pageData);
          setHasNextPage(pageData.length === PAGE_SIZE);
          setCurrentPage(pageToLoad);
          return;
        }

        pageToLoad -= 1;
      }

      // Fallback: load page 0
      const firstPage = await userService.getAllUsers(0, PAGE_SIZE);
      setUsers(firstPage);
      setHasNextPage(firstPage.length === PAGE_SIZE);
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
    loadUsersPage(0);
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
          console.log("APPLY", values);
        }}
        onReset={() => {
          console.log("RESET");
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
          loadUsersPage(newPage);
        }}
        onNext={() => {
          if (!hasNextPage) return;
          const newPage = currentPage + 1;
          setCurrentPage(newPage);
          loadUsersPage(newPage);
        }}
      />


    </div>
  );
};

export default ManageUsersPage;
