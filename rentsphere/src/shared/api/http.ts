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

export class ApiError extends Error {
  name = "ApiError";
  status: number;
  raw?: string;
  data?: any;

  constructor(message: string, status: number, data?: any, raw?: string) {
    super(message);
    this.status = status;
    this.data = data;
    this.raw = raw;
  }
}

function looksLikeHtml(s: string) {
  const t = (s || "").trim().toLowerCase();
  return t.startsWith("<!doctype") || t.startsWith("<html");
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getTokenFromStorage();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store", 
  });

  const text = await res.text();


  if (looksLikeHtml(text)) {
    throw new ApiError("API returned HTML (check VITE_API_URL / proxy / server route)", res.status, undefined, text);
  }

  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new ApiError(data?.error || data?.message || "API Error", res.status, data, text);
  }

  return data as T;
}