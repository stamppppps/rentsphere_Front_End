import type{ ReactNode }from "react";
import { Navigate } from "react-router-dom";

type Role="tenant" | "owner" | "admin";

interface Props{
  children: ReactNode;
  role?: Role;
}

export default function ProtectedRoute({children,role}:Props){
  const token = localStorage.getItem("token");
  const userRole = (localStorage.getItem("role") || "") as Role | "";

  if(!token){
    return <Navigate to="/tenant/login" replace />;
  }
  if(role && userRole !== role){
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
