export type Role = {
  id: number;
  name: string;
  permissions: string[];
};

export type User = {
  id: number;
  name: string;
  surname: string | null;
  email: string;
  avatar: string | null;
  role: Role | null;
  token?: string;
  permissions?: string[];
};

export type ResponseAuthLogin = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: Omit<User, 'token' | 'permissions'>;
};