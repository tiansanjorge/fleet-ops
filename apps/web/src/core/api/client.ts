import { useAuthStore } from "@/core/auth/authStore";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK === "true";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Wrapper de fetch que, cuando mock=false:
//   - construye la URL absoluta con API_URL
//   - inyecta el Authorization header con el JWT del authStore
// Cuando mock=true el path relativo llega a MSW sin modificación.
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  if (IS_MOCK) return fetch(path, init);

  const token = useAuthStore.getState().token;
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(`${API_URL}${path}`, { ...init, headers });
}
