import { apiFetch } from "../apiClient";
import type { User } from "../../types";

export async function checkSlug(slug: string): Promise<boolean> {
  const res = await apiFetch<{ available: boolean }>(`/api/v1/profile/slug-available/${slug}`);
  return res.available;
}

export async function bySlug(slug: string): Promise<User> {
  return apiFetch<User>(`/api/v1/profile/by-slug/${slug}`);
}

export async function updateProfile(updates: {
  businessName?: string;
  email?: string;
  slug?: string;
}): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("/api/v1/profile", {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}
