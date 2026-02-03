export interface RegisterRequest {
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
}

export type JwtPayload = {
  userId: string;
  role: 'USER' | 'ADMIN';
};
