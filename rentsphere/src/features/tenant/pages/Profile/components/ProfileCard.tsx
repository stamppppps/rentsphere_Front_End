import React from 'react';
import { User, Mail, Phone } from 'lucide-react';
import type { UserProfile } from '../types/profile.type';

interface ProfileCardProps {
  profile: UserProfile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
      <div className="flex flex-col items-center text-center relative z-10">
        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full border-4 border-white/30 flex items-center justify-center mb-4 shadow-lg">
          <User size={48} className="text-white" />
        </div>
        
        <h2 className="text-2xl font-bold">{profile.name}</h2>
        <p className="text-blue-100 text-sm font-medium mt-1 mb-4">{profile.unit} • {profile.condo}</p>
        
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2 text-blue-50/80 text-sm">
            <Mail size={14} className="opacity-70" />
            <span>{profile.email}</span>
          </div>
          <div className="flex items-center gap-2 text-blue-50/80 text-sm">
            <Phone size={14} className="opacity-70" />
            <span>{profile.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
