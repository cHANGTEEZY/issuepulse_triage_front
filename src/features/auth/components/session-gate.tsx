import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { safeNextPath } from "../lib/session";

export function RequireSession({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const href = useRouterState({ select: (state) => state.location.href });

  useEffect(() => {
    if (isPending || data) return;
    const next = safeNextPath(href);
    void navigate({
      to: "/login",
      search: next === "/" ? {} : { redirect: next },
    });
  }, [data, href, isPending, navigate]);

  useEffect(() => {
    function onUnauthorized() {
      void authClient.getSession();
    }

    window.addEventListener("api:unauthorized", onUnauthorized);
    return () => window.removeEventListener("api:unauthorized", onUnauthorized);
  }, []);

  if (isPending || !data) return null;
  return children;
}

export function RedirectSignedIn({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const href = useRouterState({ select: (state) => state.location.href });

  useEffect(() => {
    if (isPending || !data) return;
    if (href.startsWith("/reset-password")) return;
    void navigate({ to: "/" });
  }, [data, href, isPending, navigate]);

  return children;
}
