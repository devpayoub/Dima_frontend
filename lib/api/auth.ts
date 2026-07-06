import { apiFetch } from "../apiClient";
import type { User } from "../../types";

export interface AuthSessionResponse {
  session: {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
  };
  user?: User;
  message?: string;
}

export interface MeResponse {
  profile: User;
  ownerProfile: User | null;
  staffAccounts: User[];
}

export async function login(email: string, password: string): Promise<AuthSessionResponse> {
  return apiFetch<AuthSessionResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function loginStaff(email: string, pin: string, orgId: string): Promise<AuthSessionResponse> {
  return apiFetch<AuthSessionResponse>("/api/v1/auth/login/staff", {
    method: "POST",
    body: JSON.stringify({ email, pin, orgId }),
  });
}

export async function signup(payload: {
  businessName: string;
  email: string;
  password: string;
  slug: string;
}): Promise<AuthSessionResponse> {
  return apiFetch<AuthSessionResponse>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout(): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("/api/v1/auth/logout", {
    method: "POST",
  });
}

export async function me(): Promise<MeResponse> {
  return apiFetch<MeResponse>("/api/v1/auth/me");
}

export async function resetPassword(email: string, redirectTo: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, redirectTo }),
  });
}

export async function updatePassword(newPassword: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("/api/v1/auth/update-password", {
    method: "POST",
    body: JSON.stringify({ newPassword }),
  });
}

export async function resendVerification(redirectTo: string): Promise<{ ok: boolean; message?: string }> {
  return apiFetch<{ ok: boolean; message?: string }>("/api/v1/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ redirectTo }),
  });
}
