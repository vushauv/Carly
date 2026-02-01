import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./UserEditPage.module.css";
import Button from "../../Button/Button";
import Input from "../../Input/Input";
import { userService } from "../services/userService";
import type { User, UpdateUserRequest } from "../services/types";

const UserEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UpdateUserRequest>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        // Pre-populate form with current user data
        setFormData({
          firstName: userData.firstName,
          secondName: userData.secondName,
          lastName: userData.lastName,
          email: userData.email,
          contactNumber: userData.contactNumber,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      setSaving(true);
      setError(null);

      // Only send fields that have been changed
      const updateData: UpdateUserRequest = {
        firstName: formData.firstName,
        secondName: formData.secondName || null,
        lastName: formData.lastName,
        email: formData.email,
        contactNumber: formData.contactNumber,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }


      await userService.updateUser(parseInt(id, 10), updateData);
      navigate(`/users/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/users/${id}`);
  };

  const handleChange = (field: keyof UpdateUserRequest, value: string | number | undefined) => {

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className={styles.userEditPage}>
        <h1>Loading User...</h1>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className={styles.userEditPage}>
        <h1>Error</h1>
        <p className={styles.error}>{error}</p>
        <Button label="Back to Users" onClick={() => navigate("/users")} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.userEditPage}>
        <h1>User Not Found</h1>
        <Button label="Back to Users" onClick={() => navigate("/users")} />
      </div>
    );
  }

  return (
    <div className={styles.userEditPage}>
      <div className={styles.userEditHeader}>
        <h1>Edit User</h1>
        <div className={styles.userEditActions}>
          <Button label="Cancel" onClick={handleCancel} />
        </div>
      </div>

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      <form onSubmit={handleSubmit} className={styles.userEditForm}>
        <div className={styles.formField}>
          <label>First Name (max 64 characters)</label>
          <Input
            type="text"
            value={formData.firstName ?? ""}
            onChange={(value) => handleChange("firstName", value)}
            placeholder={`Current: ${user.firstName}`}
            maxLength={64}
          />
          <small className={styles.hint}>Current value: {user.firstName}</small>
        </div>

        <div className={styles.formField}>
          <label>Second Name (max 64 characters)</label>
          <Input
            type="text"
            value={formData.secondName ?? ""}
            onChange={(value) => handleChange("secondName", value)}
            placeholder={`Current: ${user.secondName}`}
            maxLength={64}
          />
          <small className={styles.hint}>Current value: {user.secondName}</small>
        </div>

        <div className={styles.formField}>
          <label>Last Name (max 128 characters)</label>
          <Input
            type="text"
            value={formData.lastName ?? ""}
            onChange={(value) => handleChange("lastName", value)}
            placeholder={`Current: ${user.lastName}`}
            maxLength={128}
          />
          <small className={styles.hint}>Current value: {user.lastName}</small>
        </div>

        <div className={styles.formField}>
          <label>Email Address (max 256 characters)</label>
          <Input
            type="email"
            value={formData.email ?? ""}
            onChange={(value) => handleChange("email", value)}
            placeholder={`Current: ${user.email}`}
            maxLength={256}
          />
          <small className={styles.hint}>Current value: {user.email}</small>
        </div>

        <div className={styles.formField}>
          <label>Contact Number (optional)</label>
          <Input
            type="number"
            value={formData.contactNumber?.toString() ?? ""}
            onChange={(value) => handleChange("contactNumber", value ? parseInt(value) : undefined)}
            placeholder={`Current: ${user.contactNumber || "Not set"}`}
          />
          <small className={styles.hint}>Current value: {user.contactNumber || "Not set"}</small>
        </div>

        <div className={styles.formField}>
          <label>New Password (6-128 characters, optional)</label>
          <Input
            type="password"
            value={formData.password ?? ""}
            onChange={(value) => handleChange("password", value)}
            placeholder="Leave empty to keep current password"
            minLength={6}
            maxLength={128}
          />
          <small className={styles.hint}>Leave empty to keep current password</small>
        </div>

        <div className={styles.formActions}>
          <Button
            type="submit"
            label={saving ? "Saving..." : "Save Changes"}
            color="primary"
            disabled={saving}
          />
          <Button
            type="button"
            label="Cancel"
            onClick={handleCancel}
            disabled={saving}
          />
        </div>
      </form>
    </div>
  );
};

export default UserEditPage;