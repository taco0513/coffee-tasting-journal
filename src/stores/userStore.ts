import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';

interface UserState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuthState: (authState: {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
  }) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  setUser: (user) =>
    set((state) => ({
      user,
      isAuthenticated: !!user,
    })),

  setSession: (session) =>
    set((state) => ({
      session,
      user: session?.user || null,
      isAuthenticated: !!session,
    })),

  setLoading: (isLoading) =>
    set((state) => ({
      isLoading,
    })),

  setError: (error) =>
    set((state) => ({
      error,
    })),

  setAuthState: (authState) =>
    set(() => ({
      ...authState,
    })),

  reset: () =>
    set(() => ({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    })),
}));