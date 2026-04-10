import api from './api';
import { RoleMutationResponse, RolesResponse, Permission } from '../types/roles';

export const roleService = {
  getPermissions: async (): Promise<Permission[]> => {
    const { data } = await api.get('/api/permissions');
    return data;
  },

  getRoles: async (page: number = 1, search: string = ''): Promise<RolesResponse> => {
    const { data } = await api.get(`/api/roles?page=${page}&search=${search}`);
    return data;
  },

  createRole: async (name: string, permissions: number[]): Promise<RoleMutationResponse> => {
    const { data } = await api.post('/api/roles', { name, permissions });
    return data;
  },

  updateRole: async (id: number, name: string, permissions: number[]): Promise<RoleMutationResponse> => {
    const { data } = await api.put(`/api/roles/${id}`, { name, permissions });
    return data;
  },

  deleteRole: async (id: number): Promise<RoleMutationResponse> => {
    const { data } = await api.delete(`/api/roles/${id}`);
    return data;
  }
};