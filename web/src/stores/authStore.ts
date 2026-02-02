import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isLoggedIn: boolean;
  user: {
    email: string;
  } | null;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      login: (email: string) => {
        set({ 
          isLoggedIn: true, 
          user: { email } 
        });
      },
      logout: () => {
        set({ 
          isLoggedIn: false, 
          user: null 
        });
      },
    }),
    {
      name: 'carly-auth', // unique name for localStorage key
      partialize: (state) => ({ 
        isLoggedIn: state.isLoggedIn, 
        user: state.user 
      }),
    }
  )
);