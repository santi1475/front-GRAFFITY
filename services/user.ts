import api from './api';
import { UserResponse } from '@/types/user';

export const userService = {
  getUsers: async (page = 1, search = '') => {
    const { data } = await api.get(`/api/users?page=${page}&search=${search}`);
    return data as UserResponse;
  },

  saveUser: async (userData: any, id?: number) => {
    const formData = new FormData();
    
    Object.keys(userData).forEach(key => {
      const value = userData[key];
      if (value !== null && value !== undefined && value !== 'null') {
        formData.append(key, value);
      }
    });

    if (id) {
      const { data } = await api.put(`/api/users/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } else {
      const { data } = await api.post('/api/users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    }
  },

  deleteUser: async (id: number) => {
    const { data } = await api.delete(`/api/users/${id}`);
    return data;
  }
};