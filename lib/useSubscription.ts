import { useMemo } from 'react';
import { Customer, Template, SubscriptionTier, TIER_LIMITS } from '../types';
import { useAuth } from '../components/AuthProvider';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  isPaid: boolean;
  campaignCount: number;
  issuedCardCount: number;
  staffCount: number;
  campaignLimit: number;
  cardLimit: number;
  staffLimit: number;
  canCreateCampaign: boolean;
  canIssueCard: boolean;
  canCreateStaff: boolean;
}

export function useSubscription(campaigns: Template[], customers: Customer[]): SubscriptionInfo {
  const { currentOwner, staffAccounts } = useAuth();

  return useMemo(() => {
    const tier: SubscriptionTier = currentOwner?.tier ?? 'standard';
    const limits = TIER_LIMITS[tier] ?? TIER_LIMITS.standard;
    const campaignCount = campaigns.length;
    const issuedCardCount = customers.reduce((sum, c) => sum + c.cards.length, 0);
    const staffCount = staffAccounts.length;

    return {
      tier,
      isPaid: true,
      campaignCount,
      issuedCardCount,
      staffCount,
      campaignLimit: limits.campaigns,
      cardLimit: limits.issuedCards,
      staffLimit: limits.staff,
      canCreateCampaign: campaignCount < limits.campaigns,
      canIssueCard: issuedCardCount < limits.issuedCards,
      canCreateStaff: staffCount < limits.staff,
    };
  }, [currentOwner?.tier, campaigns, customers, staffAccounts]);
}
