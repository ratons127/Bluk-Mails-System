import apiClient from "../lib/apiClient";

export async function fetchDeliverySummary(campaignId: number) {
  const { data } = await apiClient.get(`/api/reports/campaigns/${campaignId}/summary`);
  return data;
}

export async function exportCampaignRecipients(campaignId: number) {
  const { data } = await apiClient.get(`/api/reports/campaigns/${campaignId}/export`, {
    responseType: "blob"
  });
  return data;
}
