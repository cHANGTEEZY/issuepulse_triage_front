import { createFileRoute } from "@tanstack/react-router";
import IssueDetailPage from "@/features/issues/detail-page";
import { canonicalLink, headMeta } from "@/lib/seo";

export const Route = createFileRoute("/_app/issues/$issueId")({
  component: IssueRoute,
  head: ({ params }) => ({
    meta: headMeta({
      title: "Issue",
      description: "Internal status, priority, owner, and notes.",
      path: `/issues/${params.issueId}`,
    }),
    links: canonicalLink(`/issues/${params.issueId}`),
  }),
});

function IssueRoute() {
  const { issueId } = Route.useParams();
  return <IssueDetailPage issueId={issueId} />;
}
