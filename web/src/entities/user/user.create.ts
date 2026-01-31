import { type UserCreateDto } from "./user.dto";
import type { EntityCreateField } from "@/shared/types/entity.create.ts";

export const userCreateFields: EntityCreateField<UserCreateDto>[] = [
    {
      key: "firstName",
      label: "First name",
      type: "text",
      required: true,
    },
    {
      key: "secondName",
      label: "Second name",
      type: "text",
      required: true, // Required in API
    },
    {
      key: "lastName",
      label: "Last name",
      type: "text",
      required: true,
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      required: true,
    },
    {
      key: "password",
      label: "Password",
      type: "password",
      required: true,
    },
    {
      key: "contactNumber",
      label: "Contact number",
      type: "number",
      required: false, // Optional in API
    },
];

// User Create Configuration
export const userCreateConfig = {
  title: "Register New User",
  
  fields: [
    {
      key: "firstName",
      label: "First Name",
      type: "text",
      required: true,
      placeholder: "Enter first name (max 64 characters)",
    },
    {
      key: "secondName",
      label: "Second Name", 
      type: "text",
      required: true, // Required in RegisterUserRequest
      placeholder: "Enter second name (max 64 characters)",
    },
    {
      key: "lastName",
      label: "Last Name",
      type: "text",
      required: true,
      placeholder: "Enter last name (max 128 characters)",
    },
    {
      key: "email",
      label: "Email Address",
      type: "email",
      required: true,
      placeholder: "Enter email address (max 256 characters)",
    },
    {
      key: "password",
      label: "Password",
      type: "password",
      required: true,
      placeholder: "Enter password (6-128 characters)",
      hint: "Password must be between 6 and 128 characters",
    },
    {
      key: "contactNumber",
      label: "Contact Number",
      type: "number",
      required: false,
      placeholder: "Enter contact number (optional)",
    },
  ] as EntityCreateField<UserCreateDto>[],
};

// Export the type for external use
export type UserCreateConfig = typeof userCreateConfig;