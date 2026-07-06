import { apiFetch } from "../apiClient";
import type { StoredTemplate } from "../../types";

export async function list(): Promise<StoredTemplate[]> {
  return apiFetch<StoredTemplate[]>("/api/v1/campaigns");
}

export async function count(): Promise<number> {
  const res = await apiFetch<{ count: number }>("/api/v1/campaigns/count");
  return res.count;
}

export async function create(campaign: StoredTemplate): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("/api/v1/campaigns", {
    method: "POST",
    body: JSON.stringify(campaign),
  });
}

export async function upsert(id: string, campaign: StoredTemplate): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/v1/campaigns/${id}`, {
    method: "PUT",
    body: JSON.stringify(campaign),
  });
}

export async function simpleUpdate(id: string, fields: { name: string; reward_name: string; total_stamps: number }): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/v1/campaigns/${id}/simple`, {
    method: "PUT",
    body: JSON.stringify(fields),
  });
}

export async function toggle(id: string, isEnabled: boolean): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/v1/campaigns/${id}/toggle`, {
    method: "PATCH",
    body: JSON.stringify({ isEnabled }),
  });
}

export async function remove(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/v1/campaigns/${id}`, {
    method: "DELETE",
  });
}
