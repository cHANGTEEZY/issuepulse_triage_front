import {
  TRIAGE_PRIORITIES,
  TRIAGE_STATUSES,
  type IssueFilters,
  type TriagePriority,
  type TriageStatus,
} from "@/api/issues";

export const FEED_STATUSES = ["all", ...TRIAGE_STATUSES] as const;
export type FeedStatus = (typeof FEED_STATUSES)[number];

export const FEED_PRIORITIES = ["any", "elevated", ...TRIAGE_PRIORITIES] as const;
export type FeedPriority = (typeof FEED_PRIORITIES)[number];

export type IssueSearchInput = {
  q?: string;
  repositoryId?: string;
  status?: FeedStatus;
  priority?: FeedPriority;
  stale?: boolean;
  view?: "table" | "board";
};

export type IssueFeedSearch = {
  q: string;
  repositoryId: string;
  status: FeedStatus;
  priority: FeedPriority;
  stale: boolean;
  view: "table" | "board";
};

export function parseIssueSearch(search: Record<string, unknown>): IssueSearchInput {
  const status = FEED_STATUSES.find((item) => item === search.status);
  const priority = FEED_PRIORITIES.find((item) => item === search.priority);
  const view = search.view === "board" ? "board" : search.view === "table" ? "table" : undefined;
  return {
    q: typeof search.q === "string" && search.q.length > 0 ? search.q : undefined,
    repositoryId:
      typeof search.repositoryId === "string" && search.repositoryId.length > 0
        ? search.repositoryId
        : undefined,
    status,
    priority,
    stale: search.stale === true || search.stale === "true" ? true : undefined,
    view,
  };
}

export function normalizeIssueSearch(search: IssueSearchInput): IssueFeedSearch {
  return {
    q: search.q ?? "",
    repositoryId: search.repositoryId ?? "",
    status: search.status ?? "inbox",
    priority: search.priority ?? "any",
    stale: search.stale ?? false,
    view: search.view ?? "table",
  };
}

export function toIssueFilters(search: IssueFeedSearch): IssueFilters {
  return {
    search: search.q,
    repositoryId: search.repositoryId,
    status: search.status === "all" ? undefined : (search.status as TriageStatus),
    priority:
      search.priority === "any"
        ? undefined
        : search.priority === "elevated"
          ? "critical,high"
          : (search.priority as TriagePriority),
    stale: search.stale,
  };
}
