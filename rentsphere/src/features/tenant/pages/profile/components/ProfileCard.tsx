import React, { useRef } from 'react';
import { User, Mail, Phone, Camera } from 'lucide-react';
import type { UserProfile } from '../types/profile.type';

interface ProfileCardProps {
  profile: UserProfile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarImageRef = useRef<HTMLImageElement | null>(null);

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !avatarImageRef.current) return;

    if (avatarImageRef.current.dataset.blobUrl) {
      URL.revokeObjectURL(avatarImageRef.current.dataset.blobUrl);
    }

    const nextUrl = URL.createObjectURL(file);
    avatarImageRef.current.src = nextUrl;
    avatarImageRef.current.dataset.blobUrl = nextUrl;
    event.target.value = '';
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
      <div className="flex flex-col items-center text-center relative z-10">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <div className="relative mb-4">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full border-4 border-white/30 flex items-center justify-center shadow-lg overflow-hidden">
            <img
              ref={avatarImageRef}
              src=""
              alt="Profile avatar"
              className="hidden w-full h-full object-cover"
              onLoad={(e) => {
                e.currentTarget.classList.remove('hidden');
                e.currentTarget.parentElement?.querySelector('[data-avatar-fallback]')?.classList.add('hidden');
              }}
            />
            <User size={48} className="text-white" data-avatar-fallback />
          </div>
          <button
            type="button"
            onClick={handleOpenFilePicker}
            className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-white text-blue-700 flex items-center justify-center shadow-md border border-blue-100"
            aria-label="Change profile image"
          >
            <Camera size={15} />
          </button>
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
