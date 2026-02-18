import React from 'react';

interface LogoIconProps {
  className?: string;
  color?: string;
  glow?: boolean;
}

const LogoIcon: React.FC<LogoIconProps> = ({ className = "w-12 h-12", color = "white", glow = true }) => {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        {glow && (
          <filter id="glow-eff" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>
      
      {/* Stylized ribbon S shape based on image */}
      <path 
        d="M30 35C30 25 45 20 55 20C75 20 85 35 85 50C85 65 75 80 55 80C35 80 20 70 20 50L20 45C20 45 45 45 55 45C65 45 70 50 70 55C70 60 65 65 55 65C45 65 40 60 40 45L40 40" 
        stroke="url(#logoGrad)" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter={glow ? "url(#glow-eff)" : "none"}
      />
    </svg>
  );
};

export default LogoIcon;
