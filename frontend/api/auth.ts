// frontend/api/auth.ts
import { api, setAuthToken } from "./client";

export interface AuthResponse { token: string; user_id: string; name: string; }

export interface CanvasValidation {
  valid: boolean;
  canvas_name: string;
  canvas_email: string;
  courses: string[];
  courses_count: number;
}

export interface CanvasStatus {
  connected: boolean;
  canvas_name?: string;
  canvas_email?: string;
  courses_count: number;
}

export interface ServiceStatus {
  canvas: { connected: boolean; user_name?: string; email?: string; courses_count: number; institution: string };
  google_calendar: { connected: boolean; email?: string };
  elevenlabs: { connected: boolean };
  gemini: { connected: boolean };
}

export async function register(email: string, name: string): Promise<AuthResponse> {
  const data = await api.post<AuthResponse>("/auth/register", { email, name });
  await setAuthToken(data.token);
  return data;
}

export async function login(email: string): Promise<AuthResponse> {
  const data = await api.post<AuthResponse>(`/auth/login?email=${encodeURIComponent(email)}`);
  await setAuthToken(data.token);
  return data;
}

export const validateCanvasToken = (token: string) =>
  api.post<CanvasValidation>(`/canvas/validate-token?token=${encodeURIComponent(token)}`);

export const getCanvasStatus = () => api.get<CanvasStatus>("/canvas/status");
export const disconnectCanvas = () => api.delete("/canvas/disconnect");
export const getServicesStatus = () => api.get<ServiceStatus>("/services/status");
