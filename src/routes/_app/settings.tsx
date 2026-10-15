import { createFileRoute } from "@tanstack/react-router";
import SettingsPage from "@/features/settings/page";
import { canonicalLink, headMeta } from "@/lib/seo";

const TITLE = "Settings";
const DESCRIPTION = "Manage your profile, appearance, and session.";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
  head: () => ({
    meta: headMeta({
      title: TITLE,
      description: DESCRIPTION,
      path: "/settings",
    }),
    links: canonicalLink("/settings"),
  }),
});
