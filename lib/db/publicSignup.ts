import * as apiPublic from '../api/public';

export interface PublicCampaignSignupContext {
  owner: {
    id: string;
    slug: string;
    businessName: string;
  };
  campaign: {
    id: string;
    name: string;
    isEnabled: boolean;
  };
}

export type PublicCampaignSignupOutcome =
  | { outcome: 'issued'; uniqueId: string }
  | { outcome: 'redirect_existing'; uniqueId: string }
  | { outcome: 'campaign_disabled_no_existing' }
  | { outcome: 'error'; error: string };

export async function fetchPublicCampaignSignupContext(
  slug: string,
  campaignId: string
): Promise<PublicCampaignSignupContext | null> {
  try {
    const res = await apiPublic.getCampaignContext(slug, campaignId);
    if (!res || !res.owner || !res.campaign) return null;
    return {
      owner: {
        id: res.owner.id,
        slug: res.owner.slug,
        businessName: res.owner.businessName || '',
      },
      campaign: {
        id: res.campaign.id,
        name: res.campaign.name,
        isEnabled: res.campaign.isEnabled !== false,
      },
    };
  } catch {
    return null;
  }
}

export async function registerPublicCampaignSignup(input: {
  slug: string;
  campaignId: string;
  name: string;
  email?: string;
  mobile?: string;
}): Promise<PublicCampaignSignupOutcome> {
  try {
    const res = await apiPublic.registerSignup(input.slug, input.campaignId, {
      name: input.name,
      email: input.email,
      mobile: input.mobile,
    });
    return res as PublicCampaignSignupOutcome;
  } catch (err: any) {
    return { outcome: 'error', error: err.message || 'Unable to complete signup right now.' };
  }
}
