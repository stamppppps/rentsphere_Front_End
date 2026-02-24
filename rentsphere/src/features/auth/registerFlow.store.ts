import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type RegisterRole = "TENANT" | "OWNER";

type RegisterFlowState ={

  role: RegisterRole;

  name: string;
  email: string;
  phone: string;
  password: string;

 
  inviteCode?: string;

  
  otpRef: string | null;


  setForm: (data: Partial<RegisterFlowState>) => void;
  clear: () => void;
};

export const useRegisterFlowStore = create<RegisterFlowState>()(
  persist(
    (set) => ({
      
      role: "TENANT",

      name: "",
      email: "",
      phone: "",
      password: "",

      inviteCode: "",

      otpRef: null,

   
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
      name: "rentsphere_register_flow", 
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
