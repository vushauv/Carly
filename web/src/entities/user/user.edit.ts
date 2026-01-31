// entities/user/user.edit.ts
import type { User } from "./user.types";
import type { UserUpdateDto } from "./user.dto";
import type { EntityUpdateConfig, EntityUpdateField } from "@/shared/types/entity.update";

// User Edit Configuration
export const userEditConfig: EntityUpdateConfig<User, UserUpdateDto> = {
  title: "Edit User",
  
  fields: [
    {
      key: "firstName",
      label: "First Name",
      type: "text",
      placeholder: "Enter first name (max 64 characters)",
      required: false, // Optional in update
    },
    {
      key: "secondName",
      label: "Second Name",
      type: "text",
      placeholder: "Enter second name (max 64 characters)",
      required: false,
    },
    {
      key: "lastName",
      label: "Last Name",
      type: "text",
      placeholder: "Enter last name (max 128 characters)",
      required: false,
    },
    {
      key: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter email address (max 256 characters)",
      required: false,
    },
    {
      key: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter new password (6-128 characters)",
      required: false,
      hint: "Leave empty to keep current password",
    },
    {
      key: "contactNumber",
      label: "Contact Number",
      type: "number",
      placeholder: "Enter contact number",
      required: false,
    },
  ] as EntityUpdateField<UserUpdateDto>[],
};

// Export the type for external use
export type UserEditConfig = typeof userEditConfig;