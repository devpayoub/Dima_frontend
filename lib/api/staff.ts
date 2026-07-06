import { apiFetch } from "../apiClient";
import type { User } from "../../types";

export async function list(): Promise<User[]> {
  return apiFetch<User[]>("/api/v1/staff");
}

export async function create(payload: { email: string; pin: string; name: string }): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("/api/v1/staff", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePin(id: string, pin: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/v1/staff/${id}/pin`, {
    method: "PATCH",
    body: JSON.stringify({ pin }),
  });
}

export async function setAccess(id: string, access: "active" | "disabled"): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/v1/staff/${id}/access`, {
    method: "PATCH",
    body: JSON.stringify({ access }),
  });
}

export async function remove(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/v1/staff/${id}`, {
    method: "DELETE",
  });
}
