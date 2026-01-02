import apiClient from "../lib/apiClient";
import { Approval } from "../types";

export async function fetchMyApprovals() {
  const { data } = await apiClient.get<Approval[]>("/api/approvals/inbox");
  return data;
}

export async function approve(id: number, comment: string) {
  const { data } = await apiClient.post<Approval>(`/api/approvals/${id}/approve`, { comment });
  return data;
}

export async function reject(id: number, comment: string) {
  const { data } = await apiClient.post<Approval>(`/api/approvals/${id}/reject`, { comment });
  return data;
}
