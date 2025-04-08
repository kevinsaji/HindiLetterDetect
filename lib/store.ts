import { create } from "zustand";

interface User {
  username: string;
  user_email: string;
  user_password: string;
  letters_completed: string[];
  last_login_date: string;
  login_streak: number;
  longest_login_streak: number;
  mistakes: number;
}

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
