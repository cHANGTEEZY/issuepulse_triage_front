import { Outlet, createFileRoute } from "@tanstack/react-router";
import AuthShell from "@/features/auth/components/auth-shell";
import { RedirectSignedIn } from "@/features/auth/components/session-gate";

export const Route = createFileRoute("/(auth)")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <RedirectSignedIn>
      <AuthShell>
        <Outlet />
      </AuthShell>
    </RedirectSignedIn>
  );
}
