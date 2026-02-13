import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import AuthLayout from "@/features/auth/layouts/AuthLayout";

// ใช้ LoginPage ตัวเดียว (มันอ่าน role จาก URL อยู่แล้ว)
import LoginPage from "@/features/auth/pages/LoginPage";

// OWNER flow (B)
import OwnerRegisterPage from "@/features/auth/pages/OwnerRegisterPage";
import OwnerOtpPage from "@/features/auth/OwnerOtpPage";
import OwnerVerifyEmailPage from "@/features/auth/OwnerVerifyEmailPage";
import OwnerSetPasswordPage from "@/features/auth/OwnerSetPasswordPage";

// shared pages (ถ้ามี)
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";

// tenant OTP (ถ้าเธอจะใช้ไว้สำหรับ forgot/reset ก็ได้)
import OtpVerifyPage from "@/features/auth/pages/OtpVerifyPage";

const authRoutes: RouteObject[] = [
  // เข้าเว็บครั้งแรก: ให้ไป owner login ก่อน (เพราะ tenant ยังไม่เสร็จ)
  { path: "/", element: <Navigate to="/auth/owner/login" replace /> },

  // ===== OWNER =====
  {
    path: "/auth/owner",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },

      // ✅ OWNER Register Flow (B)
      { path: "register", element: <OwnerRegisterPage /> },
      { path: "otp", element: <OwnerOtpPage /> },
      { path: "verify-email", element: <OwnerVerifyEmailPage /> },
      { path: "set-password", element: <OwnerSetPasswordPage /> },

      // (Optional) forgot/reset ถ้ายังใช้ร่วม
      { path: "forgot", element: <ForgotPasswordPage /> },
      { path: "reset", element: <ResetPasswordPage /> },

      { index: true, element: <Navigate to="login" replace /> },
    ],
  },

  // ===== TENANT =====
  {
    path: "/auth/tenant",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },

      // ❌ tenant ยังไม่ทำ register → เด้งกลับ login
      { path: "register", element: <Navigate to="/auth/tenant/login" replace /> },

      // ถ้า tenant ยังไม่ใช้ otp/fogot/reset ก็เด้งกลับ login ได้เหมือนกัน
      { path: "otp", element: <OtpVerifyPage /> },
      { path: "forgot", element: <ForgotPasswordPage /> },
      { path: "reset", element: <ResetPasswordPage /> },

      { index: true, element: <Navigate to="login" replace /> },
    ],
  },

  // เผื่อมี /auth เฉย ๆ
  { path: "/auth", element: <Navigate to="/auth/owner/login" replace /> },
];

export default authRoutes;
