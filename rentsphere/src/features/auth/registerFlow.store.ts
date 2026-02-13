import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type RegisterRole = "TENANT" | "OWNER";

type RegisterFlowState = {
  // ===== ข้อมูลผู้สมัคร =====
  role: RegisterRole;

  name: string;
  email: string;
  phone: string;
  password: string;

  // TENANT เท่านั้น
  inviteCode?: string;

  // จาก backend ตอนขอ OTP
  otpRef: string | null;

  // ===== actions =====
  setForm: (data: Partial<RegisterFlowState>) => void;
  clear: () => void;
};

export const useRegisterFlowStore = create<RegisterFlowState>()(
  persist(
    (set) => ({
      // ===== default state =====
      role: "TENANT",

      name: "",
      email: "",
      phone: "",
      password: "",

      inviteCode: "",

      otpRef: null,

      // ===== actions =====
      setForm: (data) =>
        set((state) => ({
          ...state,
          ...data,
        })),

      clear: () =>
        set({
          role: "TENANT",

          name: "",
          email: "",
          phone: "",
          password: "",

          inviteCode: "",

          otpRef: null,
        }),
    }),
    {
      name: "rentsphere_register_flow", // key ใน sessionStorage
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
