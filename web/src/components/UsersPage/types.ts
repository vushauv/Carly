type UserType = "ADMIN" | "CUSTOMER" | "PLATFORM";

type User = {
  userId: number;
  firstName: string;
  secondName?: string | null;
  lastName: string;
  email: string;
  contactNumber?: number | null;
  userType: UserType;
  isEnabled: boolean;
  createdAt: string; // ISO-like string for demo
};

export { type User, type UserType };