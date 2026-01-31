// User API service with sample data for testing
import type { User, RegisterUserRequest, UpdateUserRequest } from "./types";

// Sample data for testing
const sampleUsers: User[] = [
  {
    userId: 1,
    firstName: "Anna",
    secondName: "Maria",
    lastName: "Kowalska", 
    email: "anna.kowalska@example.com",
    contactNumber: 48123456789,
  },
  {
    userId: 2,
    firstName: "Piotr",
    secondName: "Jan",
    lastName: "Nowak",
    email: "piotr.nowak@example.com", 
    contactNumber: 48987654321,
  },
  {
    userId: 3,
    firstName: "Vasil",
    secondName: "Alex",
    lastName: "Vushau",
    email: "vasil@example.com",
    contactNumber: 48500111222,
  },
  {
    userId: 4,
    firstName: "Ola",
    secondName: "Teresa",
    lastName: "Zielinska",
    email: "ola.zielinska@example.com",
    contactNumber: 48777111222,
  },
  {
    userId: 5,
    firstName: "Mateusz",
    secondName: "Pawel",
    lastName: "Kaczmarek",
    email: "mateusz.k@example.com",
    contactNumber: 48666111222,
  },
  {
    userId: 6,
    firstName: "Kasia",
    secondName: "Magdalena",
    lastName: "Lewandowska",
    email: "kasia.lew@example.com",
    contactNumber: 48555333444,
  },
  {
    userId: 7,
    firstName: "Tomasz",
    secondName: "Robert",
    lastName: "Wrobel",
    email: "twrobel@example.com",
    contactNumber: 48555111222,
  },
  {
    userId: 8,
    firstName: "Agnieszka",
    secondName: "Ewa",
    lastName: "Wojcik",
    email: "agnieszka.w@example.com",
    contactNumber: 48444777888,
  },
  {
    userId: 9,
    firstName: "Jakub",
    secondName: "Michal",
    lastName: "Duda",
    email: "jakub.duda@example.com",
    contactNumber: 48333222111,
  },
  {
    userId: 10,
    firstName: "Monika",
    secondName: "Barbara",
    lastName: "Kaminska",
    email: "monika.k@example.com",
    contactNumber: 48222111333,
  }
];

let userIdCounter = 11;

const API_BASE_URL = "http://localhost:8080/api";

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const userService = {
  // GET /api/users - Get all users with pagination (using sample data)
  async getAllUsers(pageNumber: number = 0, pageSize: number = 10): Promise<User[]> {
    console.log(`Fetching users: page ${pageNumber}, size ${pageSize}`);
    
    // Simulate network delay
    await delay(300);
    
    // Calculate pagination
    const startIndex = pageNumber * pageSize;
    const endIndex = startIndex + pageSize;
    
    return sampleUsers.slice(startIndex, endIndex);
  },

  // GET /api/users/{id} - Get user by ID (using sample data)
  async getUserById(id: number): Promise<User> {
    console.log(`Fetching user by ID: ${id}`);
    
    // Simulate network delay
    await delay(200);
    
    const user = sampleUsers.find(u => u.userId === id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    return user;
  },

  // POST /api/users/register - Register new user (using sample data)
  async registerUser(data: RegisterUserRequest): Promise<{ userId: number }> {
    console.log("Registering new user:", data);
    
    // Simulate network delay
    await delay(500);
    
    // Simulate email validation
    if (sampleUsers.some(u => u.email === data.email)) {
      throw new Error("User with this email already exists");
    }
    
    // Create new user
    const newUser: User = {
      userId: userIdCounter++,
      firstName: data.firstName,
      secondName: data.secondName,
      lastName: data.lastName,
      email: data.email,
      contactNumber: data.contactNumber || 0,
    };
    
    // Add to sample data
    sampleUsers.push(newUser);
    
    return { userId: newUser.userId };
  },

  // PATCH /api/users/{id} - Update user (using sample data)
  async updateUser(id: number, data: UpdateUserRequest): Promise<void> {
    console.log(`Updating user ${id}:`, data);
    
    // Simulate network delay
    await delay(400);
    
    const userIndex = sampleUsers.findIndex(u => u.userId === id);
    if (userIndex === -1) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    // Update only provided fields
    const user = sampleUsers[userIndex];
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.secondName !== undefined) user.secondName = data.secondName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.email !== undefined) {
      // Check for email conflicts
      if (sampleUsers.some(u => u.email === data.email && u.userId !== id)) {
        throw new Error("User with this email already exists");
      }
      user.email = data.email;
    }
    if (data.contactNumber !== undefined) user.contactNumber = data.contactNumber;
    
    console.log("User updated successfully");
  },

  // DELETE /api/users/{id} - Delete user (using sample data)
  async deleteUser(id: number): Promise<void> {
    console.log(`Deleting user ${id}`);
    
    // Simulate network delay
    await delay(300);
    
    const userIndex = sampleUsers.findIndex(u => u.userId === id);
    if (userIndex === -1) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    // Remove from sample data
    sampleUsers.splice(userIndex, 1);
    
    console.log("User deleted successfully");
  },

  // POST /api/users/login - Login user (using sample data)
  async loginUser(email: string, password: string): Promise<{ userId: number }> {
    console.log(`Login attempt for email: ${email}`);
    
    // Simulate network delay
    await delay(400);
    
    const user = sampleUsers.find(u => u.email === email);
    if (!user) {
      throw new Error("Invalid email or password");
    }
    
    // For demo purposes, accept any password for existing users
    // In real implementation, this would validate against stored password hash
    if (password.length < 6) {
      throw new Error("Invalid email or password");
    }
    
    return { userId: user.userId };
  },

  // Helper method to get total user count for pagination
  async getTotalUsers(): Promise<number> {
    await delay(100);
    return sampleUsers.length;
  },
};