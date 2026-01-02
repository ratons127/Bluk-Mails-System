import apiClient from "../lib/apiClient";
import { SenderIdentity, SmtpAccount, PolicySettings } from "../types";

export async function fetchSenderIdentities() {
  const { data } = await apiClient.get<SenderIdentity[]>("/api/admin/sender-identities");
  return data;
}

export async function createSenderIdentity(payload: Partial<SenderIdentity>) {
  const { data } = await apiClient.post<SenderIdentity>("/api/admin/sender-identities", payload);
  return data;
}

export async function updateSenderIdentity(id: number, payload: Partial<SenderIdentity>) {
  const { data } = await apiClient.put<SenderIdentity>(`/api/admin/sender-identities/${id}`, payload);
  return data;
}

export async function deleteSenderIdentity(id: number) {
  const { data } = await apiClient.delete(`/api/admin/sender-identities/${id}`);
  return data;
}

export async function fetchSmtpAccounts() {
  const { data } = await apiClient.get<SmtpAccount[]>("/api/admin/smtp-accounts");
  return data;
}

export async function createSmtpAccount(payload: Partial<SmtpAccount>) {
  const { data } = await apiClient.post<SmtpAccount>("/api/admin/smtp-accounts", payload);
  return data;
}

export async function updateSmtpAccount(id: number, payload: Partial<SmtpAccount>) {
  const { data } = await apiClient.put<SmtpAccount>(`/api/admin/smtp-accounts/${id}`, payload);
  return data;
}

export async function deleteSmtpAccount(id: number) {
  const { data } = await apiClient.delete(`/api/admin/smtp-accounts/${id}`);
  return data;
}

export async function fetchPolicySettings() {
  const { data } = await apiClient.get<PolicySettings>("/api/admin/policies");
  return data;
}

export async function updatePolicySettings(payload: PolicySettings) {
  const { data } = await apiClient.put<PolicySettings>("/api/admin/policies", payload);
  return data;
}
