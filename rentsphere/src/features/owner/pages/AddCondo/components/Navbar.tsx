import rentsphereLogo from "@/assets/brand/rentsphere-logo.png";
import React from "react";

type NavbarProps = {
  userName?: string | null;
};

const Navbar: React.FC<NavbarProps> = ({ userName }) => {
  return (
    <nav
      style={{
        background:
          "linear-gradient(90deg, rgba(37, 99, 235, 0.9), rgba(14, 165, 233, 0.9))",
      }}
      className="shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <img
                src={rentsphereLogo}
                alt="RentSphere"
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="text-xl font-bold text-white tracking-wide">
              RentSphere
            </span>
          </div>

          <div className="text-white font-medium">
            {userName?.trim() ? userName : "—"}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;