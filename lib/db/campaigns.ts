import type { StoredTemplate } from '../../types';
import * as apiCampaigns from '../api/campaigns';

export async function fetchCampaigns(_ownerId: string): Promise<StoredTemplate[]> {
  return apiCampaigns.list();
}

export async function upsertCampaign(template: StoredTemplate, _ownerId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    return await apiCampaigns.upsert(template.id, template);
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function setCampaignEnabled(
  campaignId: string,
  _ownerId: string,
  isEnabled: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    return await apiCampaigns.toggle(campaignId, isEnabled);
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function deleteCampaign(campaignId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    return await apiCampaigns.remove(campaignId);
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function countCampaigns(_ownerId: string): Promise<number> {
  try {
    return await apiCampaigns.count();
  } catch {
    return 0;
  }
}
