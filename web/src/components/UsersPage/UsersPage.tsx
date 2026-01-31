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
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log(`[UsersPage] Component state - users:`, users, `loading:`, loading, `currentPage:`, currentPage);

  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));

  const loadUsersPage = async (page: number) => {
    console.log(`[UsersPage] loadUsersPage called with page:`, page);
    try {
      console.log(`[UsersPage] Setting loading to true`);
      setLoading(true);
      
      console.log(`[UsersPage] Calling userService.getAllUsers(${page}, ${PAGE_SIZE})`);
      // Call real API endpoint
      const usersData = await userService.getAllUsers(page, PAGE_SIZE);
      console.log(`[UsersPage] Received usersData:`, usersData);
      console.log(`[UsersPage] usersData type:`, typeof usersData, `is array:`, Array.isArray(usersData));
      
      console.log(`[UsersPage] Setting users state to:`, usersData);
      setUsers(usersData);
      
      const totalCount = usersData.length;
      console.log(`[UsersPage] Setting totalUsers to:`, totalCount);
      setTotalUsers(totalCount); // API doesn't return total count, using current page count for demo
    } catch (err) {
      console.error("[UsersPage] Failed to load users:", err);
      // Error handling removed - no user-facing error message
    } finally {
      console.log(`[UsersPage] Setting loading to false`);
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
      // Error handling removed - no user-facing error message
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

  const actionsWithHandlers = useMemo(() => 
    usersActions.map(action => ({
      ...action,
      onClick: (user: User) => handleUserAction(action.id, user)
    })), [navigate]
  );

  const columns = useMemo(
    () => usersColumns({ 
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
          actions={actionsWithHandlers}
          emptyText="No users found."
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
