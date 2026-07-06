import { apiFetch } from "../apiClient";
import type { IssuedCard } from "../../types";

export async function list(): Promise<IssuedCard[]> {
  return apiFetch<IssuedCard[]>("/api/v1/issued-cards");
}

export async function count(): Promise<number> {
  const res = await apiFetch<{ count: number }>("/api/v1/issued-cards/count");
  return res.count;
}

export async function issue(card: any): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("/api/v1/issued-cards", {
    method: "POST",
    body: JSON.stringify(card),
  });
}

export async function update(id: string, updates: Partial<IssuedCard>): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/v1/issued-cards/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function remove(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/v1/issued-cards/${id}`, {
    method: "DELETE",
  });
}

export async function inspect(uniqueId: string): Promise<{ status: "owned" | "foreign" | "missing" }> {
  return apiFetch<{ status: "owned" | "foreign" | "missing" }>("/api/v1/issued-cards/inspect", {
    method: "POST",
    body: JSON.stringify({ uniqueId }),
  });
}
