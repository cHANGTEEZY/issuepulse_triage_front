import { useState } from "react";
import { authApi } from "@/api/auth";
import Button from "@/components/_ui/button";
import { isApiError } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

export function needsReconnect(error: unknown) {
  return isApiError(error) && error.code === "GITHUB_RECONNECT";
}

export function githubErrorMessage(
  error: unknown,
  fallback = "GitHub did not accept that change.",
) {
  if (isApiError(error)) return error.message;
  return fallback;
}

export function reconnectGithub() {
  const here = `${window.location.pathname}${window.location.search}`;
  return authApi.signInGitHub(here);
}

type GithubErrorProps = {
  error: unknown;
  fallback?: string;
  className?: string;
};

export default function GithubError({
  error,
  fallback,
  className,
}: GithubErrorProps) {
  const [connecting, setConnecting] = useState(false);
  if (!error) return null;

  if (needsReconnect(error)) {
    return (
      <div
        role="alert"
        className={cn(
          "border-line-strong bg-card flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2.5",
          className,
        )}
      >
        <span className="text-soft min-w-0 flex-1 text-pretty">
          GitHub needs you to sign in again before changes can be made in your
          name.
        </span>
        <Button
          variant="primary"
          size="sm"
          disabled={connecting}
          onClick={() => {
            setConnecting(true);
            void reconnectGithub().finally(() => setConnecting(false));
          }}
        >
          {connecting ? "Opening GitHub…" : "Reconnect GitHub"}
        </Button>
      </div>
    );
  }

  return (
    <p role="alert" className={cn("text-destructive text-pretty", className)}>
      {githubErrorMessage(error, fallback)}
    </p>
  );
}
