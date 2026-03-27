import api from './api';
import type { ResponseAuthLogin } from '@/types/auth';

export const authService = {
  async login(email: string, password: string): Promise<ResponseAuthLogin> {
    const res = await api.post<ResponseAuthLogin>('api/auth/login', {
      email,
      password,
    });
    return res.data;
  },
};
