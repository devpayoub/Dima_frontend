import { supabase } from "../supabase";
import { apiFetch } from "../apiClient";

export interface StampRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  campaignId: string;
  campaignName: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  acceptedCardId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Public: Create a stamp request via Supabase RPC (no backend needed)
export async function createStampRequest(data: {
  ownerSlug: string;
  campaignId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}): Promise<{ requestId: string }> {
  const { data: result, error } = await supabase.rpc('create_stamp_request_public', {
    slug_input: data.ownerSlug,
    campaign_id_input: data.campaignId,
    customer_name_input: data.customerName,
    customer_phone_input: data.customerPhone,
    customer_email_input: data.customerEmail || '',
  });

  if (error) {
    throw new Error(error.message || 'Failed to create stamp request');
  }

  if (result?.error) {
    throw new Error(result.error);
  }

  if (!result?.requestId) {
    throw new Error('No request ID returned');
  }

  return { requestId: result.requestId };
}

// Owner: Fetch requests via backend (authenticated)
export async function getStampRequests(): Promise<StampRequest[]> {
  return apiFetch('/api/v1/stamp-requests');
}

// Owner: Accept a request via backend (authenticated)
export async function acceptStampRequest(id: string): Promise<{ status: string; cardId: string; cardUniqueId: string }> {
  return apiFetch(`/api/v1/stamp-requests/${id}/accept`, {
    method: 'POST',
  });
}

// Owner: Decline a request via backend (authenticated)
export async function declineStampRequest(id: string): Promise<{ status: string }> {
  return apiFetch(`/api/v1/stamp-requests/${id}/decline`, {
    method: 'POST',
  });
}
