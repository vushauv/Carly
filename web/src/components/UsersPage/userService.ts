// User API service - connects to localhost:8080
import type { User, RegisterUserRequest, UpdateUserRequest } from "./types";
import { API_CONFIG, buildApiUrl, apiRequest } from "../../shared/api.config";

export const userService = {
  // GET /api/users - Get all users with pagination
  async getAllUsers(pageNumber: number = 0, pageSize: number = 10): Promise<User[]> {
    console.log(`Fetching users: page ${pageNumber}, size ${pageSize}`);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.USERS) + `?page=${pageNumber}&size=${pageSize}`;
    const response = await apiRequest<{content: User[]}>(url);
    
    return response.content || [];
  },

  // GET /api/users/{id} - Get user by ID
  async getUserById(id: number): Promise<User> {
    console.log(`Fetching user by ID: ${id}`);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.USERS, id);
    return await apiRequest<User>(url);
  },

  // POST /api/users/register - Register new user
  async registerUser(data: RegisterUserRequest): Promise<{ userId: number }> {
    console.log("Registering new user:", data);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.USERS, 'register');
    return await apiRequest<{ userId: number }>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PATCH /api/users/{id} - Update user
  async updateUser(id: number, data: UpdateUserRequest): Promise<void> {
    console.log(`Updating user ${id}:`, data);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.USERS, id);
    await apiRequest<void>(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    
    console.log("User updated successfully");
  },

  // DELETE /api/users/{id} - Delete user
  async deleteUser(id: number): Promise<void> {
    console.log(`Deleting user ${id}`);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.USERS, id);
    await apiRequest<void>(url, {
      method: 'DELETE',
    });
    
    console.log("User deleted successfully");
  },

  // POST /api/users/login - Login user
  async loginUser(email: string, password: string): Promise<{ userId: number }> {
    console.log(`Login attempt for email: ${email}`);
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.USERS, 'login');
    return await apiRequest<{ userId: number }>(url, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Helper method to get total user count for pagination
  async getTotalUsers(): Promise<number> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.USERS, 'count');
    const response = await apiRequest<{count: number}>(url);
    return response.count || 0;
  },
};