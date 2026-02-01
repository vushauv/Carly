type UserType = "ADMIN" | "CUSTOMER" | "PLATFORM";

// Updated to match API documentation exactly
type User = {
  userId: number;
  firstName: string;
  secondName: string; // Required in API
  lastName: string;
  email: string;
  contactNumber: number; // Number type as per API
};

// For registration form
type RegisterUserRequest = {
  firstName: string; // 0-64 chars, required
  secondName: string | null; // 0-64 chars, optional
  lastName: string; // 0-128 chars, required
  email: string; // email format, 0-256 chars, required
  password: string; // 6-128 chars, required
  contactNumber: string; // int64, required
};

// For update form
type UpdateUserRequest = {
  firstName?: string; // 0-64 chars
  secondName?: string | null; // 0-64 chars
  lastName?: string; // 0-128 chars
  email?: string; // email format, 0-256 chars
  password?: string; // 6-128 chars
  contactNumber?: number; // int64
};

export { type User, type UserType, type RegisterUserRequest, type UpdateUserRequest };