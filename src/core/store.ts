import { create } from 'zustand';
import { UserSession } from '@/server/services/auth.service';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  createdAt: string;
  isRead?: boolean;
}

interface AppState {
  user: UserSession | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  notifications: AppNotification[];
  isLoadingSession: boolean;
  
  // Actions
  setUser: (user: UserSession | null) => void;
  setAuthenticated: (auth: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notif: AppNotification) => void;
  setNotifications: (notifs: AppNotification[]) => void;
  clearNotifications: () => void;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  theme: 'dark', // Default to stunning dark mode
  notifications: [],
  isLoadingSession: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  
  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'light' ? 'dark' : 'light';
    set({ theme: next });
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(next);
    }
  },

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
  },

  addNotification: (notif) => set((state) => ({
    notifications: [notif, ...state.notifications],
  })),

  setNotifications: (notifications) => set({ notifications }),
  
  clearNotifications: () => set({ notifications: [] }),

  checkSession: async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.authenticated && data.user) {
        set({ user: data.user, isAuthenticated: true });
        // Sync theme class
        const currentTheme = get().theme;
        if (typeof window !== 'undefined') {
          window.document.documentElement.classList.add(currentTheme);
        }
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (e) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoadingSession: false });
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      set({ user: null, isAuthenticated: false });
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }
}));
