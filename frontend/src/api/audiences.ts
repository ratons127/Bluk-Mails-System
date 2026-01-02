import apiClient from "../lib/apiClient";
import { Audience } from "../types";

export async function fetchAudiences() {
  const { data } = await apiClient.get<Audience[]>("/api/audiences");
  return data;
}

export async function createAudience(payload: Partial<Audience>) {
  const { data } = await apiClient.post<Audience>("/api/audiences", payload);
  return data;
}

export async function updateAudience(id: number, payload: Partial<Audience>) {
  const { data } = await apiClient.put<Audience>(`/api/audiences/${id}`, payload);
  return data;
}

export async function deleteAudience(id: number) {
  const { data } = await apiClient.delete(`/api/audiences/${id}`);
  return data;
}

export async function previewAudience(audienceId: number) {
  const { data } = await apiClient.get<{ count: number; sample: any[] }>(`/api/audiences/${audienceId}/preview`);
  return data;
}
