// entities/user/user.view.ts
import type { User } from "./user.types";
import type { EntityViewField, EntityViewConfig } from "@/shared/types/entity.view";

// User View Configuration
export const userViewConfig: EntityViewConfig<User> = {
  title: (user: User) => `${user.firstName} ${user.lastName}`,
  
  fields: [
    {
      label: "User ID (Number)",
      type: "number",
      value: (user: User) => user.userId, // Changed from id to userId
    },
    {
      label: "First Name (Text)",
      type: "text",
      value: (user: User) => user.firstName,
    },
    {
      label: "Second Name (Text)",
      type: "text",
      value: (user: User) => user.secondName,
    },
    {
      label: "Last Name (Text)",
      type: "text",
      value: (user: User) => user.lastName,
    },
    {
      label: "Full Name (Text)",
      type: "text",
      value: (user: User) => `${user.firstName} ${user.lastName}`,
    },
    {
      label: "Email Address (Text)",
      type: "text",
      value: (user: User) => user.email,
    },
    {
      label: "Contact Number (Text)",
      type: "text",
      value: (user: User) => user.contactNumber?.toString() || "Not provided", // Convert number to string
    },
  ] as EntityViewField<User>[],
};

// Export the type for external use
export type UserViewConfig = typeof userViewConfig;