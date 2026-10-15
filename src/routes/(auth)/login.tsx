import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "@/features/auth/login";
import { authHead } from "@/features/auth/lib/head";
import { safeNextPath } from "@/features/auth/lib/session";

const TITLE = "Sign in";
const DESCRIPTION = "Sign in to IssueNest.";

export type LoginSearch = {
  redirect?: string;
  error?: string;
};

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    const redirect =
      typeof search.redirect === "string" ? search.redirect : undefined;
    const next = redirect ? safeNextPath(redirect) : undefined;
    return {
      redirect: next && next !== "/" ? next : undefined,
      error: typeof search.error === "string" ? search.error : undefined,
    };
  },
  component: LoginRoute,
  head: () => authHead(TITLE, DESCRIPTION, "/login"),
});

function LoginRoute() {
  const { redirect, error } = Route.useSearch();
  return <LoginPage redirectTo={redirect} error={error} />;
}
