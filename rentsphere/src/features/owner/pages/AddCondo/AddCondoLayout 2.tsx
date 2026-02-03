import React from "react";
import { Outlet } from "react-router-dom";

export default function AddCondoLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Outlet />
    </div>
  );
}
