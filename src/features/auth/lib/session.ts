export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPassword(value: string) {
  return value.length >= 8 && value.length <= 128;
}

export function safeNextPath(value: string | undefined) {
  if (!value) return "/";
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/";
  }

  const path = value.split("?")[0]?.split("#")[0] ?? "/";
  if (
    path === "/login" ||
    path === "/register" ||
    path === "/otp" ||
    path === "/reset-password"
  ) {
    return "/";
  }

  return value;
}

export function authErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return "Something went wrong. Try again.";
  }

  const record = error as { message?: unknown; status?: unknown };
  const status = typeof record.status === "number" ? record.status : 0;
  const message = typeof record.message === "string" ? record.message : "";

  if (status === 403) return "Verify your email, then sign in.";
  if (
    status === 0 ||
    message === "Failed to fetch" ||
    message === "NetworkError when attempting to fetch resource."
  ) {
    return "Could not reach the server. Check your connection and try again.";
  }

  return message || "Something went wrong. Try again.";
}

export function oauthErrorMessage(code: string | undefined) {
  if (!code) return "";
  if (code === "access_denied") return "GitHub sign-in was cancelled.";
  if (code === "INVALID_TOKEN" || code === "invalid_token") {
    return "That reset link is invalid or expired. Request a new one.";
  }
  return "Sign-in didn't complete. Try again.";
}
