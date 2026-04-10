// types/user.ts
export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  role_id: number | null;
  role: { id: number; name: string } | null;
  phone: string | null;
  avatar: string | null;
  type_document: string | null;
  n_document: string | null;
  gender: 1 | 2 | null;
  gender_text?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserResponse {
  total: number;
  paginate: number;
  users: User[];
  roles: { id: number; name: string }[];
}

export interface UserMutationResponse {
  code: number;
  message: string;
  user?: User;
}
