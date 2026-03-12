import React from 'react';
import { Phone } from 'lucide-react';
import type { UserProfile } from '../types/profile.type';

interface ProfileCardProps {
  profile: UserProfile;
}

type AvatarTheme = {
  bg: string;
  text: string;
};

const AVATAR_THEMES: AvatarTheme[] = [
  { bg: 'from-rose-200 via-pink-200 to-fuchsia-200', text: 'text-rose-700' },
  { bg: 'from-orange-200 via-amber-200 to-yellow-200', text: 'text-amber-700' },
  { bg: 'from-emerald-200 via-green-200 to-lime-200', text: 'text-emerald-700' },
  { bg: 'from-cyan-200 via-sky-200 to-blue-200', text: 'text-sky-700' },
  { bg: 'from-violet-200 via-purple-200 to-indigo-200', text: 'text-violet-700' },
  { bg: 'from-teal-200 via-cyan-200 to-slate-200', text: 'text-teal-700' },
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getThemeByProfileName(fullName: string): AvatarTheme {
  const name = fullName.trim();
  if (!name) return AVATAR_THEMES[0];
  return AVATAR_THEMES[hashString(name) % AVATAR_THEMES.length];
}

function getInitials(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '-';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  const firstNameInitial = parts[0].charAt(0);
  const lastNameInitial = parts[parts.length - 1].charAt(0);
  return `${firstNameInitial}${lastNameInitial}`.toUpperCase();
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const initials = getInitials(profile.name);
  const avatarTheme = getThemeByProfileName(profile.name);
  const statusClass = profile.isActive
    ? 'bg-emerald-500 border-emerald-100'
    : 'bg-gray-400 border-gray-100';

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
      <div className="flex flex-col items-center text-center relative z-10">
        <div className="relative mb-4">
          <div
            className={`w-24 h-24 rounded-full border-4 border-white/35 shadow-lg bg-gradient-to-br ${avatarTheme.bg} flex items-center justify-center relative overflow-hidden`}
          >
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_25%,#ffffff,transparent_45%)]" />
            <span className={`relative text-3xl font-black tracking-wide ${avatarTheme.text}`}>
              {initials}
            </span>
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 ${statusClass}`} />
        </div>

        <h2 className="text-2xl font-bold">{profile.name}</h2>

        <div className="flex flex-col items-center gap-1.5 mt-4 text-blue-100 text-sm font-medium">
          <p>คอนโด : {profile.condoName || '-'}</p>
          <p>ห้อง : {profile.roomNo || '-'}</p>
          <div className="flex items-center gap-2 text-blue-50/80 text-sm">
            <Phone size={14} className="opacity-70" />
            <span>{profile.phone || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
