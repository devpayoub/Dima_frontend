import { apiFetch } from "../apiClient";
import type { Transaction } from "../../types";

export async function list(): Promise<Transaction[]> {
  return apiFetch<Transaction[]>("/api/v1/transactions");
}

export async function log(cardId: string, transaction: Transaction): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("/api/v1/transactions", {
    method: "POST",
    body: JSON.stringify({ cardId, transaction }),
  });
}
