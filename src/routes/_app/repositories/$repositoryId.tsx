import { createFileRoute } from "@tanstack/react-router";
import RepositoryDetailPage from "@/features/repositories/detail-page";
import { canonicalLink, headMeta } from "@/lib/seo";

type RepositorySearch = {
  tab?: "overview" | "commits" | "files" | "pulls";
  path?: string;
};

export const Route = createFileRoute("/_app/repositories/$repositoryId")({
  component: RepositoryRoute,
  validateSearch: (search: Record<string, unknown>): RepositorySearch => ({
    tab:
      search.tab === "commits" ||
      search.tab === "files" ||
      search.tab === "pulls"
        ? search.tab
        : undefined,
    path: typeof search.path === "string" && search.path.length > 0 ? search.path : undefined,
  }),
  head: ({ params }) => ({
    meta: headMeta({
      title: "Repository",
      description: "Overview, commits, files, and pull requests.",
      path: `/repositories/${params.repositoryId}`,
    }),
    links: canonicalLink(`/repositories/${params.repositoryId}`),
  }),
});

function RepositoryRoute() {
  const { repositoryId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <RepositoryDetailPage
      repositoryId={repositoryId}
      tab={search.tab ?? "overview"}
      path={search.path ?? ""}
      onTabChange={(tab) =>
        void navigate({
          search: (previous) => ({
            ...previous,
            tab: tab === "overview" ? undefined : tab,
          }),
        })
      }
      onPathChange={(path) =>
        void navigate({
          search: (previous) => ({ ...previous, tab: "files", path: path || undefined }),
        })
      }
    />
  );
}
