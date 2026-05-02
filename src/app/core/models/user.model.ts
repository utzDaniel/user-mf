export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateRequest {
  name: string;
  email: string;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
}
