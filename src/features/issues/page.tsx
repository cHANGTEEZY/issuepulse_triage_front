import { useNavigate } from "@tanstack/react-router";
import IssueFeed from "@/features/issues/components/issue-feed";
import type { IssueFeedSearch } from "@/features/issues/lib/search";

export default function IssuesPage({ search }: { search: IssueFeedSearch }) {
  const navigate = useNavigate();

  return (
    <IssueFeed
      search={search}
      onSearchChange={(next) => {
        void navigate({
          to: "/",
          search: {
            q: next.q || undefined,
            repositoryId: next.repositoryId || undefined,
            status: next.status === "inbox" ? undefined : next.status,
            priority: next.priority === "any" ? undefined : next.priority,
            stale: next.stale || undefined,
            view: next.view === "table" ? undefined : next.view,
          },
        });
      }}
    />
  );
}
