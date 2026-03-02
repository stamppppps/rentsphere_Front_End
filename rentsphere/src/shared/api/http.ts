const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

function getTokenFromStorage(): string | null {
  try {
    const raw = localStorage.getItem("rentsphere_auth"); 
    if (!raw) return null;

    const parsed = JSON.parse(raw);

   
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getTokenFromStorage();

  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) throw new Error(data?.error || data?.message || "API Error");
  return data as T;
}