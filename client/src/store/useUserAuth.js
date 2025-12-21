import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserAuthStore = create(
  persist((set) => ({
    userData: null,
    userToken: null,
    isUserLoggedIn: false,
    loginUser: (token) => set({ userToken: token, isUserLoggedIn: true }),
    logoutUser: () => set({ userData: null, userToken: null, isUserLoggedIn: false}),
    userDetail: (data) =>set({userData: data})
  })),
  { name: "userToken" }
);
