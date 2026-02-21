export interface UserResponse {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: Date;
}
