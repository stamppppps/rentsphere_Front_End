import React from "react";
import condoBg from "@/assets/brand/condo.png";

export const Meteors: React.FC<{ count?: number }> = ({ count = 10 }) => {
  return (
    <div className="stars-container pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="meteor"
          style={{
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 150 + 60}px`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
};

export const CondoBackground: React.FC = () => (
  <>
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `url(${condoBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.18,
      }}
    />
    <div className="absolute inset-0 bg-[#0b1020]/70 pointer-events-none" />
  </>
);

export const SaaSBackground: React.FC = () => (
  <>
    <div className="absolute inset-0 bg-[#eaf3ff] pointer-events-none" />
    <div className="absolute -top-24 -right-28 w-[560px] h-[560px] bg-blue-300/35 blur-[110px] rounded-full pointer-events-none" />
    <div className="absolute -bottom-28 -left-28 w-[560px] h-[560px] bg-indigo-300/30 blur-[110px] rounded-full pointer-events-none" />
    <div className="absolute inset-0 bg-gradient-to-br from-white/55 via-transparent to-indigo-50/70 pointer-events-none" />
    {/* subtle grid */}
    <div
      className="absolute inset-0 opacity-[0.10] pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(99,102,241,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.25) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />
  </>
);
