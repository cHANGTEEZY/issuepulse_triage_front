import { Outlet, createFileRoute } from "@tanstack/react-router";
import AppShell from "@/features/app/components/app-shell";
import { RequireSession } from "@/features/auth/components/session-gate";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <RequireSession>
      <AppShell>
        <Outlet />
      </AppShell>
    </RequireSession>
  );
}
