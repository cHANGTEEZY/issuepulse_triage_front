import { api } from "@/lib/apiClient";

export const TRIAGE_STATUSES = [
  "inbox",
  "investigating",
  "planned",
  "blocked",
  "done",
] as const;

export const TRIAGE_PRIORITIES = [
  "critical",
  "high",
  "medium",
  "low",
] as const;

export type TriageStatus = (typeof TRIAGE_STATUSES)[number];
export type TriagePriority = (typeof TRIAGE_PRIORITIES)[number];

export type IssueLabel = {
  name: string;
  color: string;
};

export type IssueOwner = {
  id: string;
  name: string;
  image: string | null;
};

export type IssueRecord = {
  id: string;
  number: number;
  title: string;
  body: string | null;
  state: string;
  authorLogin: string;
  authorAvatarUrl: string | null;
  htmlUrl: string;
  isPullRequest: boolean;
  githubCreatedAt: string;
  githubUpdatedAt: string;
  repository: {
    id: string;
    owner: string;
    name: string;
  };
  labels: IssueLabel[];
  triage: {
    status: TriageStatus;
    priority: TriagePriority;
    notes: string;
    owner: IssueOwner | null;
  };
};

export type IssueSummary = {
  untriaged: number;
  highPriority: number;
  stale: number;
};

export type Assignee = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type IssueFilters = {
  search?: string;
  repositoryId?: string;
  status?: TriageStatus;
  priority?: string;
  stale?: boolean;
};

export type TriagePatch = {
  status?: TriageStatus;
  priority?: TriagePriority;
  ownerId?: string | null;
  notes?: string;
};

type Envelope<T> = {
  success: boolean;
  data: T;
};

export const issuesApi = {
  list(filters: IssueFilters = {}) {
    return api.get<Envelope<IssueRecord[]>>("/v1/issues", {
      params: {
        search: filters.search || undefined,
        repositoryId: filters.repositoryId || undefined,
        status: filters.status,
        priority: filters.priority || undefined,
        stale: filters.stale ? "true" : undefined,
      },
    });
  },

  summary() {
    return api.get<Envelope<IssueSummary>>("/v1/issues/summary");
  },

  get(id: string) {
    return api.get<Envelope<IssueRecord>>(`/v1/issues/${id}`);
  },

  updateTriage(id: string, patch: TriagePatch) {
    return api.patch<Envelope<IssueRecord>>(`/v1/issues/${id}/triage`, patch);
  },

  assignees() {
    return api.get<Envelope<Assignee[]>>("/v1/users");
  },
};
