import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useOrgAuthStore = create(
  persist((set) => ({
    orgToken: null,
    isOrgLoggedIn: false,
    loginOrg: (token) => set({ orgToken: token, isOrgLoggedIn: true }),
    logoutOrg: () => set({ orgToken: null, isOrgLoggedIn: false }),
  })),
  { name: "orgToken" }
);
