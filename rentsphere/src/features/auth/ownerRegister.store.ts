import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  requestId: string | null;
  email: string | null;
  phone: string | null;
  channel: "EMAIL" | "PHONE" | null;

  setStart: (payload: { requestId: string; email: string; phone: string; channel: "EMAIL" | "PHONE" }) => void;
  setRequestId: (requestId: string) => void;
  clear: () => void;
};

export const useOwnerRegisterStore = create<State>()(
  persist(
    (set) => ({
      requestId: null,
      email: null,
      phone: null,
      channel: null,

      setStart: ({ requestId, email, phone, channel }) => set({ requestId, email, phone, channel }),
      setRequestId: (requestId) => set({ requestId }),
      clear: () => set({ requestId: null, email: null, phone: null, channel: null }),
    }),
    { name: "rentsphere_owner_register_flow" }
  )
);
