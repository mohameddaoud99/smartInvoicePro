export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: RoleInfo[];
}

export interface RoleInfo {
  id: number;
  name: string;
}

export interface AuthUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  token: string;
}
