import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  variant?: 'dark' | 'light';
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, variant = 'dark' }) => {
  if (variant === 'light') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 font-sans max-w-md mx-auto relative shadow-2xl border-x border-gray-100 overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden flex flex-col items-center justify-center p-6 font-sans max-w-md mx-auto shadow-2xl border-x border-gray-800">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 grayscale"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop")',
        }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0f172a]/80 via-[#0f172a]/90 to-[#0f172a]" />

      {/* Content */}
      <div className="relative z-20 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
