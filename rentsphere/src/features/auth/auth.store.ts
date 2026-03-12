import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type UserRole = "TENANT" | "OWNER" | "ADMIN" | "STAFF";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
};

export type StaffMembership = {
  id: string;
  condoId: string;
  condoName: string;
  staffPosition?: string | null;
  isActive?: boolean;
  allowedModules: string[];
};

type SetAuthExtra = {
  staffMemberships?: StaffMembership[];
  activeMembership?: StaffMembership | null;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  staffMemberships: StaffMembership[];
  activeMembership: StaffMembership | null;

  setAuth: (token: string, user: AuthUser, extra?: SetAuthExtra) => void;
  setActiveMembership: (membership: StaffMembership | null) => void;
  updateAllowedModules: (modules: string[]) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      staffMemberships: [],
      activeMembership: null,

      setAuth: (token, user, extra) => {
        const memberships = extra?.staffMemberships ?? [];
        const activeMembership =
          extra?.activeMembership ??
          memberships[0] ??
          null;

        set({
          token,
          user,
          staffMemberships: memberships,
          activeMembership,
        });
      },

      setActiveMembership: (membership) => {
        set({ activeMembership: membership });
      },

      updateAllowedModules: (modules) => {
        const { activeMembership, staffMemberships } = get();

        if (!activeMembership) return;

        const nextActiveMembership: StaffMembership = {
          ...activeMembership,
          allowedModules: modules,
        };

        const nextMemberships = staffMemberships.map((item) =>
          item.id === activeMembership.id
            ? { ...item, allowedModules: modules }
            : item
        );

        set({
          activeMembership: nextActiveMembership,
          staffMemberships: nextMemberships,
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          staffMemberships: [],
          activeMembership: null,
        });
      },
    }),
    {
      name: "rentsphere_auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        staffMemberships: state.staffMemberships,
        activeMembership: state.activeMembership,
      }),
    }
  )
);