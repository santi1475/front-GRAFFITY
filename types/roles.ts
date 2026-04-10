export interface Permission {
  id: number;
  name: string;
  codename?: string;
  module?: string;
}

export interface Role {
  id: number;
  name: string;
  created_at: string;
  permissions: Permission[];
  permissions_pluck: string[];
}

export interface RolesResponse {
  total: number;
  paginate: number;
  roles: Role[];
}

export interface RoleMutationResponse {
  code: number;
  message: string;
  role?: Role;
}

