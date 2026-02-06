import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import LoginPortal  from "./components/LoginPortal";
import SuccessPortal from "./components/SuccessPortal";

type Screen = "login" | "success";

export default function TenantLogin() {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");

  const handleLogin = (token: string) => {
    if (!token) return;


    localStorage.setItem("token", token);
    localStorage.setItem("role", "tenant");

    setCurrentScreen("success");
  };

  const handleEnter = () => {
   
    navigate("/tenant/home", { replace: true });
  };

  const handleReset = () => {
  
    setCurrentScreen("login");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#05070a] overflow-hidden bg-mesh">
      {/* Phone Frame Emulator (เหมือนเดโม) */}
      <div className="relative w-full max-w-md h-[844px] sm:h-[844px] h-screen sm:rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden border-0 sm:border-[12px] border-black ring-4 ring-[#1a1a1a] transition-all duration-700 ease-in-out">
        {currentScreen === "login" ? (
          <LoginPortal onLogin={handleLogin} />
        ) : (
          // Success: กด Enter Dashboard แล้วเข้า /tenant/home
          <SuccessPortal onConfirm={handleEnter} />
        )}

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/10 rounded-full z-50 pointer-events-none" />

        {/* Hidden reset (ถ้าอยากใช้) */}
        <button
          type="button"
          onClick={handleReset}
          className="sr-only"
          aria-label="Reset login screen"
        />
      </div>
    </div>
  );
}
