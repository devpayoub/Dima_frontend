import { supabase } from "./supabase";

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = "An unexpected error occurred.";
    try {
      const errBody = await response.json();
      if (errBody && errBody.error) {
        errorMsg = errBody.error;
      }
    } catch {
      // ignore parsing error
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}
