import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, FileText, Package, Calendar } from 'lucide-react';
import FeatureCard from './FeatureCard';

const FeatureGrid: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { 
      label: 'พัสดุ', 
      icon: <Package size={24} className="text-purple-600" />, 
      bgColor: 'bg-purple-50',
      onClick: () => navigate('/parcel')
    },
    { 
      label: 'รายงานซ่อมบำรุง', 
      icon: <Wrench size={24} className="text-blue-600" />, 
      bgColor: 'bg-blue-50',
      onClick: () => navigate('/maintenance')
    },
    { 
      label: 'บิล / การชำระเงิน', 
      icon: <FileText size={24} className="text-indigo-600" />, 
      bgColor: 'bg-indigo-50',
      onClick: () => navigate('/billing')
    },
    { 
      label: 'จองส่วนกลาง', 
      icon: <Calendar size={24} className="text-pink-600" />, 
      bgColor: 'bg-pink-50',
      onClick: () => navigate('/booking')
    },
  ];

  return (
    <div className="px-6 grid grid-cols-2 gap-4 mt-2">
      {features.map((f, i) => (
        <FeatureCard key={i} {...f} />
      ))}
    </div>
  );
};

export default FeatureGrid;
