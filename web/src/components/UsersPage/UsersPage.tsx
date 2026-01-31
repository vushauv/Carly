import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UsersPage.module.css";
import AddNewEntityComponent from "../AddNewEntityComponent/AddNewComponent";
import FiltersForm from "../FiltersForm/FiltersForm";
import type { User } from "./types.ts";
import { type Filters, defaultFilters, type UserFilterKey, userFilterFields } from "./filters.conf.ts";
import DataTable from "../DataTable/DataTable";
import { usersColumns, usersRowKey, usersActions } from "./datatable.conf.ts";
import { useMemo } from "react";
import Pagination from "../Pagination/Pagination.tsx";
import { userService } from "./userService";

const PAGE_SIZE = 10; // Match API default

const ManageUsersPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0); // API uses 0-based pagination
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));

  const loadUsersPage = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call real API endpoint
      const usersData = await userService.getAllUsers(page, PAGE_SIZE);
      setUsers(usersData);
      setTotalUsers(usersData.length); // API doesn't return total count, using current page count for demo
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      // Refresh the current page after deletion
      loadUsersPage(currentPage);
    } catch (err) {
      console.error("Failed to delete user:", err);
      setError("Failed to delete user. Please try again.");
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

  const columns = useMemo(
    () => usersColumns({ 
      primaryCell: styles.primaryCell, 
      status: styles.status,
      onAction: handleUserAction 
    }),
    [styles.primaryCell, styles.status]
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Admin Dashboard – Manage Users</h1>

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <FiltersForm<UserFilterKey>
        fields={userFilterFields}
        onApply={(values) => {
          // TODO: Implement filtering when backend supports it
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
          actions={usersActions}
          emptyText="No users found."
          onAction={handleUserAction}
        />
      )}

      <Pagination
        currentPage={currentPage + 1} // Display 1-based to user
        totalPages={totalPages}
        onPrev={() => {
          const newPage = Math.max(0, currentPage - 1);
          setCurrentPage(newPage);
          loadUsersPage(newPage);
        }}
        onNext={() => {
          const newPage = Math.min(totalPages - 1, currentPage + 1);
          setCurrentPage(newPage);
          loadUsersPage(newPage);
        }}
      />
    </div>
  );
};

export default ManageUsersPage;
