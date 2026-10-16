import PageHeader from "@/components/_common/page-header";
import Button from "@/components/_ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import {
  useRepositoryCommits,
  useRepositoryContents,
  useRepositoryOverview,
  useRepositoryPulls,
  useSyncRepository,
} from "@/api/hooks/use-repositories";
import { formatWhen } from "@/features/issues/lib/triage";
import CommitsSection from "./commits-section";
import DetailState, { readError } from "./detail-state";
import FilesSection from "./files-section";
import OverviewSection from "./overview-section";
import PullsSection from "./pulls-section";

export type RepositoryTab = "overview" | "commits" | "files" | "pulls";

const TABS: Array<{ value: RepositoryTab; label: string }> = [
  { value: "overview", label: "Overview" },
  { value: "commits", label: "Commits" },
  { value: "files", label: "Files" },
  { value: "pulls", label: "Pull requests" },
];

type RepositoryDetailProps = {
  repositoryId: string;
  tab: RepositoryTab;
  path: string;
  onTabChange: (tab: RepositoryTab) => void;
  onPathChange: (path: string) => void;
};

export default function RepositoryDetail({
  repositoryId,
  tab,
  path,
  onTabChange,
  onPathChange,
}: RepositoryDetailProps) {
  const overview = useRepositoryOverview(repositoryId);
  const commits = useRepositoryCommits(repositoryId);
  const contents = useRepositoryContents(repositoryId, path);
  const pulls = useRepositoryPulls(repositoryId);
  const sync = useSyncRepository();

  const title = overview.data ? overview.data.fullName : "Repository";
  const description = overview.data
    ? `${overview.data.defaultBranch} · last sync ${formatWhen(overview.data.lastSyncedAt)}`
    : "Overview, commits, files, and pull requests.";

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PageHeader
        title={title}
        description={description}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="md" href="/repositories">
              All repositories
            </Button>
            <Button
              variant="secondary"
              size="md"
              href="/"
              search={{ repositoryId, status: "all" }}
            >
              Issues
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={sync.isPending}
              onClick={() => sync.mutate(repositoryId)}
            >
              {sync.isPending ? "Syncing…" : "Sync now"}
            </Button>
          </div>
        }
      >
        <Tabs value={tab} onValueChange={(value) => onTabChange(value as RepositoryTab)}>
          <TabsList className="border-border overflow-x-auto border-b px-4">
            {TABS.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-auto px-4 py-5">
        {sync.isError && (
          <p className="text-destructive pb-3">{readError(sync.error, "Sync failed.")}</p>
        )}

        {tab === "overview" && (
          <DetailState
            isPending={overview.isPending}
            isError={overview.isError}
            error={overview.error}
            fallback="Could not load this repository."
            pendingLabel="Loading repository…"
          >
            {overview.data && <OverviewSection repository={overview.data} />}
          </DetailState>
        )}

        {tab === "commits" && (
          <DetailState
            isPending={commits.isPending}
            isError={commits.isError}
            error={commits.error}
            fallback="Could not load commits."
            pendingLabel="Loading commits…"
          >
            <CommitsSection commits={commits.data ?? []} />
          </DetailState>
        )}

        {tab === "files" && (
          <DetailState
            isPending={contents.isPending}
            isError={contents.isError}
            error={contents.error}
            fallback="Could not load files."
            pendingLabel="Loading files…"
          >
            <FilesSection entries={contents.data ?? []} path={path} onNavigate={onPathChange} />
          </DetailState>
        )}

        {tab === "pulls" && (
          <DetailState
            isPending={pulls.isPending}
            isError={pulls.isError}
            error={pulls.error}
            fallback="Could not load pull requests."
            pendingLabel="Loading pull requests…"
          >
            <PullsSection pulls={pulls.data ?? []} />
          </DetailState>
        )}
      </div>
    </section>
  );
}
