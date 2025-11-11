import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserAuthStore = create(
  persist((set) => ({
    userToken: null,
    isUserLoggedIn: false,
    loginUser: (token) => set({ userToken: token, isUserLoggedIn: true }),
    logoutUser: () => set({ userToken: null, isUserLoggedIn: false }),
  })),
  { name: "userToken" }
);
