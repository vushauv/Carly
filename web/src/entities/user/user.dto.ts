// Updated DTOs to match API documentation exactly
export interface UserResponseDto {
    userId: number; // Changed from number to match API (int64)
    firstName: string;
    secondName: string;
    lastName: string;
    email: string;
    contactNumber: number; // Changed to number to match API (int64)
}

export interface UserCreateDto {
    firstName: string;        // 0–64, required
    secondName: string;       // 0–64, required  
    lastName: string;         // 0–128, required

    email: string;            // email, 0–256, required
    password: string;         // 6–128, required

    contactNumber?: number;   // int64, optional
}

export interface UserUpdateDto {
    firstName?: string;        // 0–64
    secondName?: string;       // 0–64
    lastName?: string;         // 0–128
  
    email?: string;            // email, 0–256
    password?: string;         // 6–128
  
    contactNumber?: number;    // int64
}