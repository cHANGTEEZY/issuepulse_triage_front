import { createFileRoute } from "@tanstack/react-router";
import DashboardPage from "@/features/dashboard/page";
import { canonicalLink, headMeta } from "@/lib/seo";

const TITLE = "Dashboard";
const DESCRIPTION = "Backlog health across every connected repository.";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: headMeta({
      title: TITLE,
      description: DESCRIPTION,
      path: "/dashboard",
    }),
    links: canonicalLink("/dashboard"),
  }),
});
