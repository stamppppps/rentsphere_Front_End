import React from 'react';

interface FeatureCardProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  bgColor: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ label, icon, onClick, bgColor }) => {
  return (
    <button 
      onClick={onClick}
      className="bg-white rounded-3xl p-5 flex flex-col items-start gap-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all text-left group"
    >
      <div className={`w-12 h-12 rounded-2xl ${bgColor} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-gray-700 font-bold text-sm leading-tight">{label}</span>
    </button>
  );
};

export default FeatureCard;
