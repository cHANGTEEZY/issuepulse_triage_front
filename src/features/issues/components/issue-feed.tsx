import { Basket, Loupe, Plug } from "@lucasmarkes/hairline/react";
import HairlineFigure from "@/components/_common/hairline-figure";
import { Link } from "@tanstack/react-router";
import CommandSearch from "@/components/_common/command-search";
import PageHeader from "@/components/_common/page-header";
import Button from "@/components/_ui/button";
import { Input } from "@/components/_ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import { isApiError } from "@/lib/apiClient";
import {
  TRIAGE_PRIORITIES,
  TRIAGE_STATUSES,
  type IssueRecord,
  type TriageStatus,
} from "@/api/issues";
import { useIssueList } from "@/api/hooks/use-issues";
import { useRepositoryCatalog } from "@/api/hooks/use-repositories";
import IssueBadges from "@/features/issues/components/issue-badges";
import IssueTable from "@/features/issues/components/table/issue-table";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/features/issues/lib/triage";
import {
  type FeedPriority,
  type FeedStatus,
  type IssueFeedSearch,
  toIssueFilters,
} from "@/features/issues/lib/search";

const STATUS_TABS: Array<{ value: FeedStatus; label: string }> = [
  { value: "all", label: "All" },
  ...TRIAGE_STATUSES.map((status) => ({
    value: status,
    label: STATUS_LABEL[status],
  })),
];

type IssueFeedProps = {
  search: IssueFeedSearch;
  onSearchChange: (next: IssueFeedSearch) => void;
};

function errorMessage(error: unknown) {
  if (isApiError(error)) return error.message;
  return "Could not load issues.";
}

export default function IssueFeed({ search, onSearchChange }: IssueFeedProps) {
  const issues = useIssueList(toIssueFilters(search));
  const repositories = useRepositoryCatalog();
  const rows = issues.data ?? [];
  const connected = (repositories.data ?? []).length > 0;
  const hasFilters =
    search.q.trim().length > 0 ||
    search.repositoryId.length > 0 ||
    (search.status !== "all" && search.status !== "inbox") ||
    search.priority !== "any" ||
    search.stale;

  function patch(next: Partial<IssueFeedSearch>) {
    onSearchChange({ ...search, ...next });
  }

  function clearFilters() {
    patch({
      q: "",
      repositoryId: "",
      status: "all",
      priority: "any",
      stale: false,
    });
  }

  const emptyState = !connected ? (
    <EmptyState
      illustration={<HairlineFigure figure={Plug} />}
      title="No repositories connected yet"
      description="Install the GitHub App on a repository, sync it, and its issues will land here for triage."
      action={
        <Button variant="primary" size="md" href="/repositories">
          Connect a repository
        </Button>
      }
    />
  ) : hasFilters ? (
    <EmptyState
      illustration={<HairlineFigure figure={Loupe} />}
      title={
        search.q
          ? `No results for “${search.q}”`
          : "No issues match these filters"
      }
      description="Loosen a filter or clear them all to see everything across your repositories."
      action={
        <Button variant="secondary" size="md" onClick={clearFilters}>
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      illustration={<HairlineFigure figure={Basket} />}
      title="All caught up"
      description="Nothing is waiting in this view. Sync a repository to pull in anything new."
      action={
        <Button variant="secondary" size="md" href="/repositories">
          Go to repositories
        </Button>
      }
    />
  );

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PageHeader
        title="Issues"
        description="Triage GitHub issues without leaving your notes behind."
        search={<CommandSearch placeholder="Search issues…" />}
        actions={
          <Button variant="secondary" size="md" href="/repositories">
            Repositories
          </Button>
        }
      >
        <Tabs
          value={search.status}
          onValueChange={(status) => patch({ status: status as FeedStatus })}
        >
          <TabsList className="border-border overflow-x-auto border-b px-4">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </PageHeader>

      <div className="border-border flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <Input
          value={search.q}
          onChange={(event) => patch({ q: event.target.value })}
          placeholder="Search title or body"
          aria-label="Search issues"
          className="max-w-[18em]"
        />
        <Select
          value={search.repositoryId || "all"}
          onValueChange={(repositoryId) =>
            patch({ repositoryId: repositoryId === "all" ? "" : repositoryId })
          }
        >
          <SelectTrigger className="w-[14em]" aria-label="Repository">
            <SelectValue placeholder="All repositories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All repositories</SelectItem>
            {(repositories.data ?? []).map((repository) => (
              <SelectItem key={repository.id} value={repository.id}>
                {repository.owner}/{repository.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={search.priority}
          onValueChange={(priority) =>
            patch({ priority: priority as FeedPriority })
          }
        >
          <SelectTrigger className="w-[11em]" aria-label="Priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any priority</SelectItem>
            <SelectItem value="elevated">Critical or high</SelectItem>
            {TRIAGE_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {PRIORITY_LABEL[priority]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={search.stale ? "primary" : "secondary"}
          size="md"
          aria-pressed={search.stale}
          onClick={() => patch({ stale: !search.stale })}
        >
          Stale
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant={search.view === "table" ? "muted" : "ghost"}
            size="md"
            aria-pressed={search.view === "table"}
            onClick={() => patch({ view: "table" })}
          >
            Table
          </Button>
          <Button
            variant={search.view === "board" ? "muted" : "ghost"}
            size="md"
            aria-pressed={search.view === "board"}
            onClick={() => patch({ view: "board" })}
          >
            Board
          </Button>
        </div>
      </div>

      {issues.isPending && (
        <p className="text-subtle px-4 py-6">Loading issues…</p>
      )}
      {issues.isError && (
        <p className="text-destructive px-4 py-6">
          {errorMessage(issues.error)}
        </p>
      )}
      {issues.isSuccess && search.view === "table" && (
        <IssueTable rows={rows} empty={emptyState} />
      )}
      {issues.isSuccess && search.view === "board" && rows.length === 0 && (
        <div className="px-4">{emptyState}</div>
      )}
      {issues.isSuccess && search.view === "board" && rows.length > 0 && (
        <div className="min-h-0 flex-1 overflow-auto">
          <IssueBoard rows={rows} />
        </div>
      )}
    </section>
  );
}

function IssueBoard({ rows }: { rows: IssueRecord[] }) {
  return (
    <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
      {TRIAGE_STATUSES.map((status) => (
        <BoardColumn
          key={status}
          status={status}
          rows={rows.filter((issue) => issue.triage.status === status)}
        />
      ))}
    </div>
  );
}

function BoardColumn({
  status,
  rows,
}: {
  status: TriageStatus;
  rows: IssueRecord[];
}) {
  return (
    <section className="bg-secondary flex min-h-40 flex-col gap-2 rounded-xl p-2">
      <h2 className="px-1 py-1">
        {STATUS_LABEL[status]}{" "}
        <span className="text-subtle font-normal">{rows.length}</span>
      </h2>
      {rows.map((issue) => (
        <Link
          key={issue.id}
          to="/issues/$issueId"
          params={{ issueId: issue.id }}
          className="bg-background hover:bg-muted ease-power3-out flex flex-col gap-2 rounded-lg p-3 transition-colors duration-150"
        >
          <span className="font-medium">
            #{issue.number} {issue.title}
          </span>
          <span className="caption-style text-subtle">
            {issue.repository.owner}/{issue.repository.name}
          </span>
          <IssueBadges issue={issue} />
        </Link>
      ))}
    </section>
  );
}
