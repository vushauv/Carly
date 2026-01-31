// Updated to match API documentation requirements
export interface User {
  userId: number; // Changed from id to userId to match API
  firstName: string;
  secondName: string;
  lastName: string;
  email: string;
  contactNumber: number; // Changed from string to number to match API
}

export interface UserTableRow {
  userId: number;
  email: string;
  fullName: string;
}

export interface RegisterUserRequest {
  firstName: string; // 0-64 chars, required
  secondName: string; // 0-64 chars, required in API
  lastName: string; // 0-128 chars, required
  email: string; // email format, 0-256 chars, required
  password: string; // 6-128 chars, required
  contactNumber?: number; // int64, optional
}

export interface UpdateUserRequest {
  firstName?: string; // 0-64 chars
  secondName?: string; // 0-64 chars
  lastName?: string; // 0-128 chars
  email?: string; // email format, 0-256 chars
  password?: string; // 6-128 chars
  contactNumber?: number; // int64
}

export type UserRole = "ADMIN" | "CUSTOMER"; // Keep for internal use