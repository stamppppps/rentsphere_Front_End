import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  requestId: string | null;
  email: string | null;
  phone: string | null;

  setStart: (payload: { requestId: string; email: string; phone: string }) => void;
  clear: () => void;
};

export const useOwnerRegisterStore = create<State>()(
  persist(
    (set) => ({
      requestId: null,
      email: null,
      phone: null,

      setStart: ({ requestId, email, phone }) => set({ requestId, email, phone }),
      clear: () => set({ requestId: null, email: null, phone: null }),
    }),
    { name: "rentsphere_owner_register_flow" }
  )
);
