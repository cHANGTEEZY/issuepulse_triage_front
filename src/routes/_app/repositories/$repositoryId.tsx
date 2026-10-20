import { createFileRoute } from "@tanstack/react-router";
import RepositoryDetailPage from "@/features/repositories/detail-page";
import {
  REPOSITORY_TABS,
  type RepositorySearch,
} from "@/features/repositories/components/detail/repository-detail";
import { canonicalLink, headMeta } from "@/lib/seo";

function text(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export const Route = createFileRoute("/_app/repositories/$repositoryId")({
  component: RepositoryRoute,
  validateSearch: (search: Record<string, unknown>): RepositorySearch => {
    const pull = Number(search.pull);
    return {
      tab:
        search.tab !== "overview" &&
        (REPOSITORY_TABS as readonly unknown[]).includes(search.tab)
          ? (search.tab as RepositorySearch["tab"])
          : undefined,
      path: text(search.path),
      file: text(search.file),
      ref: text(search.ref),
      newFile:
        search.newFile === true || search.newFile === "true" ? true : undefined,
      pull: Number.isInteger(pull) && pull > 0 ? pull : undefined,
      compose: text(search.compose),
    };
  },
  head: ({ params }) => ({
    meta: headMeta({
      title: "Repository",
      description:
        "Overview, commits, files, pull requests, and workflow runs.",
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
      search={search}
      onSearchChange={(next) =>
        void navigate({
          search: () => ({
            ...next,
            tab: next.tab === "overview" ? undefined : next.tab,
          }),
        })
      }
    />
  );
}
