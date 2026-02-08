// frontend/api/client.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "https://hacklahoma2026.onrender.com";

let authToken: string | null = null;

export async function initAuthToken() {
  const saved = await AsyncStorage.getItem("trail_auth_token");
  if (saved) authToken = saved;
  return saved;
}

export async function setAuthToken(token: string) {
  authToken = token;
  await AsyncStorage.setItem("trail_auth_token", token);
}

export async function clearAuthToken() {
  authToken = null;
  await AsyncStorage.removeItem("trail_auth_token");
}

export function getAuthToken() {
  return authToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API Error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: any) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: any) =>
    request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
