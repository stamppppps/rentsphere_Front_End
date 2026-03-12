import { api } from '@/shared/api/http';
import type { UserProfile } from '../types/profile.type';

type DormStatusResponse = {
  linked?: boolean;
  tenantName?: string | null;
  tenantPhone?: string | null;
  condoName?: string | null;
  roomNo?: string | null;
};

type AuthMeResponse = {
  user?: {
    email?: string | null;
  } | null;
};

const PUBLIC_API = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/v1\/?$/, '');

function readJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readAuthStorage(): { email?: string } | null {
  const parsed = readJson<{ state?: { user?: { email?: string } } }>(
    localStorage.getItem('rentsphere_auth')
  );
  return parsed?.state?.user ?? null;
}

function hasActiveSession(): boolean {
  return Boolean(
    localStorage.getItem('lineUserId') ||
    localStorage.getItem('token') ||
    localStorage.getItem('rentsphere_auth')
  );
}

async function fetchDormStatus(): Promise<DormStatusResponse | null> {
  const lineUserId = localStorage.getItem('lineUserId');
  if (!lineUserId) return null;

  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(
      `${PUBLIC_API}/dorm/status?lineUserId=${encodeURIComponent(lineUserId)}`,
      { headers, cache: 'no-store' }
    );
    if (!res.ok) return null;
    return (await res.json()) as DormStatusResponse;
  } catch {
    return null;
  }
}

async function fetchAuthMe(): Promise<AuthMeResponse | null> {
  try {
    return await api<AuthMeResponse>('/auth/me');
  } catch {
    return null;
  }
}

function pickFirstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

export const getProfileData = async (): Promise<UserProfile> => {
  const authStorage = readAuthStorage();
  const [authMe, dormStatus] = await Promise.all([fetchAuthMe(), fetchDormStatus()]);

  const linked = dormStatus?.linked !== false;

  const name = linked
    ? pickFirstString(dormStatus?.tenantName, 'ผู้เช่า')
    : 'ผู้เช่า';

  const phone = linked
    ? pickFirstString(dormStatus?.tenantPhone)
    : '';

  const email = pickFirstString(
    authMe?.user?.email,
    authStorage?.email
  );

  const condoName = linked
    ? pickFirstString(dormStatus?.condoName)
    : '';

  const roomNo = linked
    ? pickFirstString(dormStatus?.roomNo)
    : '';

  const isActive = hasActiveSession() && linked;

  return {
    name,
    email,
    phone,
    condoName,
    roomNo,
    isActive,
  };
};
