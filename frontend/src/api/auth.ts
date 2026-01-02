import apiClient from "../lib/apiClient";

export type LoginResponse = {
  token: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    active: boolean;
    roles: string[];
  };
};

const AUTH_BASE = "/public/auth";

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<LoginResponse>(`${AUTH_BASE}/login`, { email, password });
  return data;
}

export async function bootstrapAdmin(payload: { email: string; fullName: string; password: string }) {
  const { data } = await apiClient.post<LoginResponse>(`${AUTH_BASE}/bootstrap`, payload);
  return data;
}

export async function requestPasswordReset(email: string) {
  const { data } = await apiClient.post(`${AUTH_BASE}/forgot-password`, { email });
  return data;
}

export async function resetPassword(token: string, newPassword: string) {
  const { data } = await apiClient.post(`${AUTH_BASE}/reset-password`, { token, newPassword });
  return data;
}
