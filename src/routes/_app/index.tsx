import { createFileRoute } from "@tanstack/react-router";
import IssuesPage from "@/features/issues/page";
import {
  normalizeIssueSearch,
  parseIssueSearch,
} from "@/features/issues/lib/search";
import { canonicalLink, headMeta } from "@/lib/seo";

const TITLE = "Issues";
const DESCRIPTION = "Private triage for GitHub issues.";

export const Route = createFileRoute("/_app/")({
  validateSearch: (search) => parseIssueSearch(search),
  component: IssuesRoute,
  head: () => ({
    meta: headMeta({
      title: TITLE,
      description: DESCRIPTION,
      path: "/",
    }),
    links: canonicalLink("/"),
  }),
});

function IssuesRoute() {
  const search = normalizeIssueSearch(Route.useSearch());
  return <IssuesPage search={search} />;
}
