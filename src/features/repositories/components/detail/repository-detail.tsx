import PageHeader from "@/components/_common/page-header";
import Button from "@/components/_ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import { useWorkflowRuns } from "@/api/hooks/use-github";
import {
  useRepositoryCommits,
  useRepositoryOverview,
  useRepositoryPulls,
  useSyncRepository,
} from "@/api/hooks/use-repositories";
import { formatWhen } from "@/features/issues/lib/triage";
import ActionsSection from "./actions-section";
import CommitsSection from "./commits-section";
import ComposePullDialog from "./compose-pull-dialog";
import DetailState, { readError } from "./detail-state";
import FilesSection from "./files-section";
import OverviewSection from "./overview-section";
import PullDetail from "./pull-detail";
import PullsSection from "./pulls-section";

export const REPOSITORY_TABS = [
  "overview",
  "commits",
  "files",
  "pulls",
  "actions",
] as const;

export type RepositoryTab = (typeof REPOSITORY_TABS)[number];

export type RepositorySearch = {
  tab?: RepositoryTab;
  path?: string;
  file?: string;
  ref?: string;
  newFile?: boolean;
  pull?: number;
  compose?: string;
};

const TAB_LABEL: Record<RepositoryTab, string> = {
  overview: "Overview",
  commits: "Commits",
  files: "Files",
  pulls: "Pull requests",
  actions: "Actions",
};

type RepositoryDetailProps = {
  repositoryId: string;
  search: RepositorySearch;
  onSearchChange: (search: RepositorySearch) => void;
};

export default function RepositoryDetail({
  repositoryId,
  search,
  onSearchChange,
}: RepositoryDetailProps) {
  const tab = search.tab ?? "overview";
  const path = search.path ?? "";
  const overview = useRepositoryOverview(repositoryId);
  const commits = useRepositoryCommits(repositoryId);
  const pulls = useRepositoryPulls(repositoryId);
  const runs = useWorkflowRuns(repositoryId, tab === "actions");
  const sync = useSyncRepository();

  const defaultBranch = overview.data?.defaultBranch ?? "main";
  const composing = search.compose !== undefined;
  const [composeHead, composeBase] =
    search.compose && search.compose !== "new"
      ? search.compose.split("...")
      : [];

  const title = overview.data ? overview.data.fullName : "Repository";
  const description = overview.data
    ? `${overview.data.defaultBranch} · last sync ${formatWhen(overview.data.lastSyncedAt)}`
    : "Overview, commits, files, pull requests, and workflow runs.";

  function go(next: RepositorySearch) {
    onSearchChange(next);
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PageHeader
        title={title}
        breadcrumb={
          <>
            <span>Repositories</span>
            <span aria-hidden>/</span>
            <span className="text-foreground truncate">{title}</span>
          </>
        }
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
        <Tabs
          value={tab}
          onValueChange={(value) => go({ tab: value as RepositoryTab })}
        >
          <TabsList className="border-border overflow-x-auto border-b px-4">
            {REPOSITORY_TABS.map((item) => (
              <TabsTrigger key={item} value={item}>
                {TAB_LABEL[item]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-auto px-4 py-5">
        {sync.isError && (
          <p className="text-destructive pb-3">
            {readError(sync.error, "Sync failed.")}
          </p>
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
            <CommitsSection
              repositoryId={repositoryId}
              commits={commits.data ?? []}
            />
          </DetailState>
        )}

        {tab === "files" && (
          <FilesSection
            repositoryId={repositoryId}
            defaultBranch={defaultBranch}
            folder={path}
            file={search.file}
            branch={search.ref}
            isNew={search.newFile === true}
            htmlUrl={overview.data?.htmlUrl}
            onOpenFile={(filePath) =>
              go({
                tab: "files",
                path: filePath.split("/").slice(0, -1).join("/") || undefined,
                file: filePath,
                ref: search.ref,
              })
            }
            onNewFile={(next) =>
              go({
                tab: "files",
                path: next || undefined,
                newFile: true,
                ref: search.ref,
              })
            }
            onClose={() =>
              go({ tab: "files", path: path || undefined, ref: search.ref })
            }
            onRefChange={(ref) =>
              go({ ...search, ref: ref === defaultBranch ? undefined : ref })
            }
            onOpened={(filePath, ref) =>
              go({
                tab: "files",
                path: filePath.split("/").slice(0, -1).join("/") || undefined,
                file: filePath,
                ref: ref === defaultBranch ? undefined : ref,
              })
            }
            onComposePull={(head, base) =>
              go({ tab: "pulls", compose: `${head}...${base}` })
            }
          />
        )}

        {tab === "pulls" && search.pull !== undefined && (
          <PullDetail
            repositoryId={repositoryId}
            number={search.pull}
            onBack={() => go({ tab: "pulls" })}
          />
        )}

        {tab === "pulls" && search.pull === undefined && (
          <DetailState
            isPending={pulls.isPending}
            isError={pulls.isError}
            error={pulls.error}
            fallback="Could not load pull requests."
            pendingLabel="Loading pull requests…"
          >
            <PullsSection
              pulls={pulls.data ?? []}
              onOpen={(number) => go({ tab: "pulls", pull: number })}
              onCompose={() => go({ tab: "pulls", compose: "new" })}
            />
          </DetailState>
        )}

        {tab === "actions" && (
          <DetailState
            isPending={runs.isPending}
            isError={runs.isError}
            error={runs.error}
            fallback="Could not load workflow runs."
            pendingLabel="Loading workflow runs…"
          >
            <ActionsSection
              repositoryId={repositoryId}
              runs={runs.data ?? []}
            />
          </DetailState>
        )}
      </div>

      <ComposePullDialog
        repositoryId={repositoryId}
        defaultBranch={defaultBranch}
        open={tab === "pulls" && composing}
        head={composeHead || undefined}
        base={composeBase || undefined}
        onOpenChange={(open) => {
          if (!open) go({ tab: "pulls", pull: search.pull });
        }}
        onCreated={(number) => go({ tab: "pulls", pull: number })}
      />
    </section>
  );
}
