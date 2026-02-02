import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./UserViewPage.module.css";
import Button from "../../Elements/Button/Button";
import { userService } from "../services/userService";
import type { User } from "../services/types";

const UserViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError("User ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userData = await userService.getUserById(parseInt(id, 10));
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleBack = () => {
    navigate("/users");
  };

  const handleEdit = () => {
    navigate(`/users/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await userService.deleteUser(parseInt(id!, 10));
      navigate("/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className={styles.userViewPage}>
        <h1>Loading User...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.userViewPage}>
        <h1>Error</h1>
        <p className={styles.error}>{error}</p>
        <Button label="Back to Users" onClick={handleBack} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.userViewPage}>
        <h1>User Not Found</h1>
        <Button label="Back to Users" onClick={handleBack} />
      </div>
    );
  }

  return (
    <div className={styles.userViewPage}>
      <div className={styles.userViewHeader}>
        <h1>User Details</h1>
        <div className={styles.userViewActions}>
          <Button label="Back to Users" onClick={handleBack} />
          <Button label="Edit User" color="primary" onClick={handleEdit} />
          <Button label="Delete User" color="danger" onClick={handleDelete} />
        </div>
      </div>

      <div className={styles.userViewContent}>
        <div className={styles.userField}>
          <span className={styles.fieldLabel}>User ID:</span>
          <span className={styles.fieldValue}>{user.userId}</span>
        </div>

        <div className={styles.userField}>
          <span className={styles.fieldLabel}>First Name:</span>
          <span className={styles.fieldValue}>{user.firstName}</span>
        </div>

        <div className={styles.userField}>
          <span className={styles.fieldLabel}>Second Name:</span>
          <span className={styles.fieldValue}>{user.secondName}</span>
        </div>

        <div className={styles.userField}>
          <span className={styles.fieldLabel}>Last Name:</span>
          <span className={styles.fieldValue}>{user.lastName}</span>
        </div>

        <div className={styles.userField}>
          <span className={styles.fieldLabel}>Full Name:</span>
          <span className={styles.fieldValue}>
            {[user.firstName, user.secondName, user.lastName]
              .filter(Boolean)
              .join(" ")}
          </span>

        </div>

        <div className={styles.userField}>
          <span className={styles.fieldLabel}>Email Address:</span>
          <span className={styles.fieldValue}>{user.email}</span>
        </div>

        <div className={styles.userField}>
          <span className={styles.fieldLabel}>Contact Number:</span>
          <span className={styles.fieldValue}>{user.contactNumber || "Not provided"}</span>
        </div>
      </div>
    </div>
  );
};

export default UserViewPage;