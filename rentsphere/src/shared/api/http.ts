// src/shared/api/http.ts
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || `API Error (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}
