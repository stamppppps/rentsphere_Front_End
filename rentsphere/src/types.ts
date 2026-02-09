export const AuthStep = {
  LOGIN: "LOGIN",
  REGISTER_PHONE: "REGISTER_PHONE",
  OTP_VERIFY: "OTP_VERIFY",
  REGISTER_DETAIL: "REGISTER_DETAIL",
  SET_PASSWORD: "SET_PASSWORD",
  SUCCESS: "SUCCESS",
} as const;

export type AuthStep = typeof AuthStep[keyof typeof AuthStep];

export const UserRole = {
  OWNER: "OWNER",
  TENANT: "TENANT",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface AuthState {
  step: AuthStep;
  role: UserRole;
  phoneNumber?: string;
}
