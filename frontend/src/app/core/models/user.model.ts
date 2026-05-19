export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  roles: { id: number; name: string }[];
}

export interface UserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleIds: number[];
}
