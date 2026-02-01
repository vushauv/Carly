import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UserRegisterPage.module.css";
import Button from "../Button/Button";
import Input from "../Input/Input";
import { userService } from "../UsersPage/userService";
import type { RegisterUserRequest } from "../UsersPage/types";

const UserRegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterUserRequest>({
    firstName: "",
    secondName: "",
    lastName: "",
    email: "",
    password: "",
    contactNumber: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 6 || formData.password.length > 128) {
      setError("Password must be between 6 and 128 characters");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: RegisterUserRequest = {
        ...formData,
        secondName: formData.secondName?.trim() ? formData.secondName.trim() : null,
      };

      const result = await userService.registerUser(payload);
      // Navigate to the newly created user's detail page
      navigate(`/users/${result.userId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register user");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/users");
  };

  const handleChange = (field: keyof RegisterUserRequest, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className={styles.userRegisterPage}>
      <div className={styles.userRegisterHeader}>
        <h1>Register New User</h1>
        <div className={styles.userRegisterActions}>
          <Button label="Cancel" onClick={handleCancel} />
        </div>
      </div>

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      <form onSubmit={handleSubmit} className={styles.userRegisterForm}>
        <div className={styles.formField}>
          <label>First Name <span className={styles.required}>*</span> (max 64 characters)</label>
          <Input
            type="text"
            value={formData.firstName}
            onChange={(value) => handleChange("firstName", value)}
            placeholder="Enter first name"
            maxLength={64}
            required
          />
        </div>

        <div className={styles.formField}>
          <label>Second Name (max 64 characters)</label>
          <Input
            type="text"
            value={formData.secondName ?? ""}
            onChange={(value) => handleChange("secondName", value)}
            placeholder="Enter second name"
            maxLength={64}
            hint="Optional, max 64 characters"
            errorMessage="Second name is invalid"
          />


        </div>

        <div className={styles.formField}>
          <label>Last Name <span className={styles.required}>*</span> (max 128 characters)</label>
          <Input
            type="text"
            value={formData.lastName}
            onChange={(value) => handleChange("lastName", value)}
            placeholder="Enter last name"
            maxLength={128}
            required
          />
        </div>

        <div className={styles.formField}>
          <label>Email Address <span className={styles.required}>*</span> (max 256 characters)</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(value) => handleChange("email", value)}
            placeholder="Enter email address"
            maxLength={256}
            required
          />
        </div>

        <div className={styles.formField}>
          <label>Password <span className={styles.required}>*</span> (6-128 characters)</label>
          <Input
            type="password"
            value={formData.password}
            onChange={(value) => handleChange("password", value)}
            placeholder="Enter password"
            minLength={6}
            maxLength={128}
            required
          />
          <small className={styles.hint}>Password must be between 6 and 128 characters</small>
        </div>

        <div className={styles.formField}>
          <label>Contact Number (optional)</label>
          <Input
            type="number"
            value={formData.contactNumber?.toString() || ""}
            onChange={(value) => handleChange("contactNumber", value ? parseInt(value) : undefined)}
            placeholder="Enter contact number"
          />
        </div>

        <div className={styles.formActions}>
          <Button
            type="submit"
            label={saving ? "Registering..." : "Register User"}
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

export default UserRegisterPage;