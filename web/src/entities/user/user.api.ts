// Updated to match API documentation endpoints
import type { User, RegisterUserRequest, UpdateUserRequest } from "./user.types";

const API_BASE_URL = "http://localhost:8080/api";

// User API implementation following the documented endpoints
export const userApi = {
  async list(pageNumber: number = 0, pageSize: number = 10): Promise<User[]> {
    const response = await fetch(
      `${API_BASE_URL}/users?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }
    
    return response.json();
  },

  async get(id: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }
    
    return response.json();
  },

  async create(data: RegisterUserRequest): Promise<{ userId: number }> {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.status}`);
    }
    
    return response.json(); // Returns GetUserIDResponse with userId
  },

  async update(id: number, data: UpdateUserRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.status}`);
    }
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.status}`);
    }
  },

  // Additional login method as per API
  async login(email: string, password: string): Promise<{ userId: number }> {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }
    
    return response.json();
  },
};