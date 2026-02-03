import React from 'react';
import Button from './Button';

interface UtilitySetupCardProps {
  icon: React.ReactNode;
  buttonText: string;
  onConfigure: () => void;
}

const UtilitySetupCard: React.FC<UtilitySetupCardProps> = ({ icon, buttonText, onConfigure }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-200 space-y-6">
      <div className="transform hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <Button onClick={onConfigure} variant="secondary">
        {buttonText}
      </Button>
    </div>
  );
};

export default UtilitySetupCard;
