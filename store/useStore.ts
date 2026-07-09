import { create } from 'zustand';
import { fetchDashboard } from '../lib/api/dashboard';
import { fromStoredTemplate, toStoredTemplate } from '../lib/templateSerialization';
import { upsertCampaign, deleteCampaign as dbDeleteCampaign, setCampaignEnabled } from '../lib/db/campaigns';
import type { Template, Customer } from '../types';

interface DashboardState {
  campaigns: Template[];
  customers: Customer[];
  pendingRequestCount: number;
  dataReady: boolean;
  isLoading: boolean;
  
  // Actions
  loadData: (ownerId: string, silent?: boolean) => Promise<void>;
  refreshData: (ownerId: string) => Promise<void>;
  setPendingRequestCount: (count: number) => void;
  saveCampaign: (template: Template, ownerId: string) => Promise<void>;
  deleteCampaign: (cardId: string) => Promise<void>;
  toggleCampaignEnabled: (cardId: string, ownerId: string, isEnabled: boolean) => Promise<void>;
  updateCustomerStateLocally: (customers: Customer[]) => void;
}

export const useStore = create<DashboardState>((set, get) => ({
  campaigns: [],
  customers: [],
  pendingRequestCount: 0,
  dataReady: false,
  isLoading: false,

  loadData: async (ownerId: string, silent = false) => {
    if (!silent) set({ dataReady: false, isLoading: true });
    try {
      const data = await fetchDashboard();
      set({
        campaigns: data.campaigns.map(fromStoredTemplate),
        customers: data.customers,
        pendingRequestCount: data.pendingRequestCount,
        dataReady: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      set({ campaigns: [], customers: [], pendingRequestCount: 0, dataReady: true, isLoading: false });
    }
  },

  refreshData: async (ownerId: string) => {
    await get().loadData(ownerId, true);
  },

  setPendingRequestCount: (count: number) => {
    set({ pendingRequestCount: count });
  },

  updateCustomerStateLocally: (customers: Customer[]) => {
    set({ customers });
  },

  saveCampaign: async (template: Template, ownerId: string) => {
    const isNew = !get().campaigns.find(c => c.id === template.id);
    const saved = isNew
      ? { ...template, id: `custom-${Date.now()}`, isEnabled: template.isEnabled ?? true }
      : { ...template, isEnabled: template.isEnabled ?? true };
    const stored = toStoredTemplate(saved);
    const result = await upsertCampaign(stored, ownerId);
    
    if (!result.ok) {
      throw new Error(result.error ?? 'Failed to save the campaign.');
    }

    set(state => ({
      campaigns: isNew 
        ? [...state.campaigns, saved] 
        : state.campaigns.map(c => c.id === saved.id ? saved : c)
    }));
  },

  deleteCampaign: async (cardId: string) => {
    const result = await dbDeleteCampaign(cardId);
    if (!result.ok) {
      throw new Error(result.error ?? 'Failed to delete the campaign.');
    }
    set(state => ({
      campaigns: state.campaigns.filter(c => c.id !== cardId)
    }));
  },

  toggleCampaignEnabled: async (cardId: string, ownerId: string, isEnabled: boolean) => {
    const result = await setCampaignEnabled(cardId, ownerId, isEnabled);
    if (!result.ok) {
      throw new Error(result.error ?? 'Failed to update campaign status.');
    }
    set(state => ({
      campaigns: state.campaigns.map(card => (card.id === cardId ? { ...card, isEnabled } : card))
    }));
  }
}));
