import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import AuthLayout from "@/features/auth/layouts/AuthLayout";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import OtpVerifyPage from "@/features/auth/pages/OtpVerifyPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";

const authRoutes: RouteObject[] = [
  { path: "/auth/owner", element: <Navigate to="/owner/login" replace /> },
  { path: "/", element: <Navigate to="/auth/tenant/login" replace /> },

  // Auth pages by role
  {
    path: "/auth/:role",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "otp", element: <OtpVerifyPage /> },
      { path: "forgot", element: <ForgotPasswordPage /> },
      { path: "reset", element: <ResetPasswordPage /> },
      { index: true, element: <Navigate to="login" replace /> },
    ],
  },
];

export default authRoutes;
