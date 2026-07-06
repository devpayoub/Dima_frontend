import { apiFetch } from "../apiClient";
import type { Customer } from "../../types";

export async function list(): Promise<Customer[]> {
  return apiFetch<Customer[]>("/api/v1/customers");
}

export async function create(customer: any): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("/api/v1/customers", {
    method: "POST",
    body: JSON.stringify(customer),
  });
}

export async function upsert(id: string, customer: any): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/v1/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(customer),
  });
}

export async function setStatus(id: string, status: "Active" | "Inactive"): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/v1/customers/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
