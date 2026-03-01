import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import AuthLayout from "@/features/auth/layouts/AuthLayout";


import LoginPage from "@/features/auth/pages/LoginPage";

// OWNER flow 
import OwnerRegisterPage from "@/features/auth/pages/OwnerRegisterPage";
import OwnerVerifyMethodPage from "@/features/auth/pages/OwnerVerifyMethodPage";
import OwnerVerifyEmailPage from "@/features/auth/pages/OwnerVerifyEmailPage";
import OwnerVerifyPhonePage from "@/features/auth/pages/OwnerVerifyPhonePage";


// shared pages 
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import RegisterSuccessPage from "@/features/auth/pages/RegisterSuccessPage";

const authRoutes: RouteObject[] = [
  { path: "/", element: <Navigate to="/auth/owner/login" replace /> },

  //OWNER 
  {
    path: "/auth/owner",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },

      // OWNER Register Flow
      { path: "register", element: <OwnerRegisterPage /> },
      { path: "verify-method", element: <OwnerVerifyMethodPage /> },
      { path: "verify-email", element: <OwnerVerifyEmailPage /> },
      { path: "verify-phone", element: <OwnerVerifyPhonePage /> },
      { path: "register-success", element: <RegisterSuccessPage /> },

      { path: "forgot", element: <ForgotPasswordPage /> },
      { path: "reset", element: <ResetPasswordPage /> },

      { index: true, element: <Navigate to="login" replace /> },
    ],
  },


  { path: "/auth", element: <Navigate to="/auth/owner/login" replace /> },
];

export default authRoutes;
