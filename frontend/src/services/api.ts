const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export function getToken() {
  return localStorage.getItem("minimarket_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("minimarket_token", token);
  else localStorage.removeItem("minimarket_token");
}

export function imageUrl(path: string | null) {
  if (!path) return null;
  return `${API_URL}${path}`;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 204) {
    return undefined as T;
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Error de red");
  }
  return data as T;
}
