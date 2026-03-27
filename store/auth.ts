import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, ResponseAuthLogin } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  saveSession: (data: ResponseAuthLogin) => void;
  removeSession: () => void;
  isAuthenticated: () => boolean;
  getUser: () => User | null;
  getToken: () => string | null;
  isPermitedRoute: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      saveSession: (data: ResponseAuthLogin) => {
        // Flatten role permissions into user for isPermitedRoute compatibility
        const permissions = data.user.role?.permissions ?? [];
        const user: User = {
          ...data.user,
          token: data.access_token,
          permissions,
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.access_token);
          // Set cookie for Next.js middleware (Edge can't read localStorage)
          document.cookie = `token=${data.access_token}; path=/; max-age=${data.expires_in}; SameSite=Lax`;
        }

        set({ user, token: data.access_token });
      },

      removeSession: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Remove cookie
          document.cookie = 'token=; path=/; max-age=0';
        }
        set({ user: null, token: null });
      },

      isAuthenticated: () => get().user !== null && get().token !== null,
      getUser: () => get().user,
      getToken: () => get().token,

      isPermitedRoute: (permission: string) => {
        const { user } = get();
        if (user && user.role?.name !== 'Super-Admin') {
          const permissions = user.permissions;
          return permissions?.includes(permission) || permission === 'all';
        }
        return true;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);