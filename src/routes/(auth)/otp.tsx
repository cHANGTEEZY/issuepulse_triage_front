import { createFileRoute } from "@tanstack/react-router";
import OtpPage from "@/features/auth/otp";
import { authHead } from "@/features/auth/lib/head";

const TITLE = "Verify email";
const DESCRIPTION = "Open the verification link sent to your email.";

export type OtpSearch = {
  email?: string;
};

export const Route = createFileRoute("/(auth)/otp")({
  validateSearch: (search: Record<string, unknown>): OtpSearch => ({
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  component: OtpRoute,
  head: () => authHead(TITLE, DESCRIPTION, "/otp"),
});

function OtpRoute() {
  const { email } = Route.useSearch();
  return <OtpPage email={email ?? ""} />;
}
