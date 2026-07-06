import { apiFetch } from "../apiClient";

export async function getCard(slug: string, uniqueId: string): Promise<any> {
  return apiFetch<any>(`/api/v1/public/card/${slug}/${uniqueId}`);
}

export async function getCampaignContext(slug: string, campaignId: string): Promise<any> {
  return apiFetch<any>(`/api/v1/public/campaign/${slug}/${campaignId}`);
}

export async function registerSignup(
  slug: string,
  campaignId: string,
  customer: { name: string; email?: string; mobile?: string }
): Promise<any> {
  return apiFetch<any>(`/api/v1/public/campaign/${slug}/${campaignId}/signup`, {
    method: "POST",
    body: JSON.stringify(customer),
  });
}

export async function getScanContext(slug: string, uniqueId: string): Promise<any> {
  return apiFetch<any>(`/api/v1/public/scan/${slug}/${uniqueId}`);
}

export async function generateReward(): Promise<{ code: string; message: string }> {
  return apiFetch<{ code: string; message: string }>("/api/v1/public/reward");
}
