//mobile/lib/api/userApi.ts
import { apiRequest } from "./apiClient";

// From OpenAPI schemas
export type GetUserIDResponse = { userId: number };

export type RegisterUserRequest = {
  firstName: string;
  secondName?: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber?: number; // int64 in OpenAPI
};

export type LoginUserRequest = {
  email: string;
  password: string;
};

export type GetUserInfoResponse = {
  userId: number;
  firstName?: string;
  secondName?: string;
  lastName?: string;
  email?: string;
  contactNumber?: number;
};

export type UpdateUserRequest = {
  firstName?: string;
  secondName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  contactNumber?: number;
};

export async function registerUser(body: RegisterUserRequest): Promise<GetUserIDResponse> {
  return apiRequest<GetUserIDResponse>("/users/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function loginUser(body: LoginUserRequest): Promise<GetUserIDResponse> {
  return apiRequest<GetUserIDResponse>("/users/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getUserById(userId: number): Promise<GetUserInfoResponse> {
  return apiRequest<GetUserInfoResponse>(`/users/${userId}`, { method: "GET" });
}

export async function updateUserById(userId: number, body: UpdateUserRequest): Promise<void> {
  await apiRequest<void>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteUserById(userId: number): Promise<void> {
  await apiRequest<void>(`/users/${userId}`, { method: "DELETE" });
}
