import { createFileRoute } from "@tanstack/react-router";
import RepositoriesPage from "@/features/repositories/page";
import { canonicalLink, headMeta } from "@/lib/seo";

const TITLE = "Repositories";
const DESCRIPTION = "Connect GitHub repositories and sync their issues.";

export const Route = createFileRoute("/_app/repositories/")({
  component: RepositoriesPage,
  head: () => ({
    meta: headMeta({
      title: TITLE,
      description: DESCRIPTION,
      path: "/repositories",
    }),
    links: canonicalLink("/repositories"),
  }),
});
