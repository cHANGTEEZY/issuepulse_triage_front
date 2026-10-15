import { createAuthClient } from "better-auth/react";

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:3000/api";

function originFromApiUrl(apiUrl: string) {
  try {
    return new URL(apiUrl).origin;
  } catch {
    return "http://localhost:8000";
  }
}

export function authBaseUrl() {
  const explicit = import.meta.env.VITE_AUTH_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  return originFromApiUrl(API_URL);
}

export function appCallback(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (typeof window === "undefined") return normalized;
  return new URL(normalized, window.location.origin).toString();
}

export const authClient = createAuthClient({
  baseURL: authBaseUrl(),
  fetchOptions: {
    credentials: "include",
    timeout: 15_000,
  },
});
