import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Minimal layout wrapper for auth routes.
 * Pages handle their own backgrounds; this just provides a stable mount.
 */
const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
