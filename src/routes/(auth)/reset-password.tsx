import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordPage from "@/features/auth/reset-password";
import { authHead } from "@/features/auth/lib/head";

const TITLE = "Reset password";
const DESCRIPTION = "Reset your IssueNest password.";

export type ResetPasswordSearch = {
  token?: string;
  error?: string;
};

export const Route = createFileRoute("/(auth)/reset-password")({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    token: typeof search.token === "string" ? search.token : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: ResetPasswordRoute,
  head: () => authHead(TITLE, DESCRIPTION, "/reset-password"),
});

function ResetPasswordRoute() {
  const { token, error } = Route.useSearch();
  return <ResetPasswordPage token={token ?? ""} error={error ?? ""} />;
}
