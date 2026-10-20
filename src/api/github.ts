import { api } from "@/lib/apiClient";
import type { IssueLabel, IssueRecord } from "@/api/issues";

export type GithubPerson = {
  login: string;
  avatarUrl: string | null;
};

export type IssueComment = {
  id: number;
  body: string;
  author: GithubPerson;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
};

export type IssueThread = {
  state: "open" | "closed";
  stateReason: string | null;
  assignees: GithubPerson[];
  labels: IssueLabel[];
  comments: IssueComment[];
};

export type IssueGithubPatch = {
  state?: "open" | "closed";
  stateReason?: "completed" | "not_planned" | "reopened";
  labels?: string[];
  assignees?: string[];
};

export type RepositoryLabel = {
  name: string;
  color: string;
  description: string | null;
};

export type RepositoryFile = {
  name: string;
  path: string;
  sha: string;
  size: number;
  ref: string;
  binary: boolean;
  tooLarge: boolean;
  content: string | null;
  htmlUrl: string | null;
};

export type RepositoryBranch = {
  name: string;
  sha: string;
  protected: boolean;
  isDefault: boolean;
};

export type CommitInput = {
  path: string;
  content: string;
  message: string;
  branch: string;
  sha?: string;
};

export type CommitResult = {
  commitSha: string;
  fileSha: string;
  branch: string;
  htmlUrl: string;
};

export type PullReview = {
  id: number;
  state: string;
  body: string;
  author: GithubPerson;
  submittedAt: string | null;
};

export type PullDetail = {
  number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  merged: boolean;
  mergeable: boolean | null;
  mergeableState: string | null;
  draft: boolean;
  author: GithubPerson;
  headRef: string;
  headSha: string;
  baseRef: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  commits: number;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
  reviews: PullReview[];
};

export type PullInput = {
  title: string;
  body?: string;
  head: string;
  base: string;
  draft?: boolean;
};

export type PullPatch = {
  title?: string;
  body?: string;
  state?: "open" | "closed";
  base?: string;
};

export type ReviewEvent = "COMMENT" | "APPROVE" | "REQUEST_CHANGES";
export type MergeMethod = "merge" | "squash" | "rebase";

export type CheckRun = {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  htmlUrl: string | null;
  startedAt: string | null;
  completedAt: string | null;
};

export type CommitStatus = {
  id: number;
  context: string;
  state: string;
  description: string | null;
  targetUrl: string | null;
  createdAt: string;
};

export type CommitChecks = {
  sha: string;
  state: string;
  checkRuns: CheckRun[];
  statuses: CommitStatus[];
};

export type StatusInput = {
  state: "error" | "failure" | "pending" | "success";
  context: string;
  description?: string;
  targetUrl?: string;
};

export type WorkflowRun = {
  id: number;
  name: string;
  title: string;
  event: string;
  status: string;
  conclusion: string | null;
  branch: string;
  headSha: string;
  runNumber: number;
  actor: GithubPerson;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
};

type Envelope<T> = {
  success: boolean;
  data: T;
};

const repo = (id: string) => `/v1/repositories/${id}`;

export const githubApi = {
  issueThread(issueId: string) {
    return api.get<Envelope<IssueThread>>(`/v1/issues/${issueId}/github`);
  },

  comment(issueId: string, body: string) {
    return api.post<Envelope<IssueComment>>(`/v1/issues/${issueId}/comments`, {
      body,
    });
  },

  updateIssue(issueId: string, patch: IssueGithubPatch) {
    return api.patch<Envelope<IssueRecord>>(
      `/v1/issues/${issueId}/github`,
      patch,
    );
  },

  labels(repositoryId: string) {
    return api.get<Envelope<RepositoryLabel[]>>(`${repo(repositoryId)}/labels`);
  },

  assignees(repositoryId: string) {
    return api.get<Envelope<GithubPerson[]>>(`${repo(repositoryId)}/assignees`);
  },

  file(repositoryId: string, path: string, ref?: string) {
    return api.get<Envelope<RepositoryFile>>(`${repo(repositoryId)}/file`, {
      params: { path, ref: ref || undefined },
    });
  },

  commitFile(repositoryId: string, input: CommitInput) {
    return api.put<Envelope<CommitResult>>(
      `${repo(repositoryId)}/contents`,
      input,
      {
        timeout: 30_000,
      },
    );
  },

  branches(repositoryId: string) {
    return api.get<Envelope<RepositoryBranch[]>>(
      `${repo(repositoryId)}/branches`,
    );
  },

  createBranch(repositoryId: string, name: string, from?: string) {
    return api.post<Envelope<RepositoryBranch>>(
      `${repo(repositoryId)}/branches`,
      { name, from },
    );
  },

  pull(repositoryId: string, number: number) {
    return api.get<Envelope<PullDetail>>(
      `${repo(repositoryId)}/pulls/${number}`,
    );
  },

  createPull(repositoryId: string, input: PullInput) {
    return api.post<Envelope<PullDetail>>(`${repo(repositoryId)}/pulls`, input);
  },

  updatePull(repositoryId: string, number: number, patch: PullPatch) {
    return api.patch<Envelope<PullDetail>>(
      `${repo(repositoryId)}/pulls/${number}`,
      patch,
    );
  },

  reviewPull(
    repositoryId: string,
    number: number,
    event: ReviewEvent,
    body: string,
  ) {
    return api.post<Envelope<PullDetail>>(
      `${repo(repositoryId)}/pulls/${number}/reviews`,
      {
        event,
        body: body || undefined,
      },
    );
  },

  mergePull(repositoryId: string, number: number, method: MergeMethod) {
    return api.put<Envelope<PullDetail>>(
      `${repo(repositoryId)}/pulls/${number}/merge`,
      {
        method,
      },
    );
  },

  checks(repositoryId: string, ref: string) {
    return api.get<Envelope<CommitChecks>>(
      `${repo(repositoryId)}/commits/${encodeURIComponent(ref)}/checks`,
    );
  },

  postStatus(repositoryId: string, sha: string, input: StatusInput) {
    return api.post<Envelope<CommitChecks>>(
      `${repo(repositoryId)}/commits/${encodeURIComponent(sha)}/statuses`,
      input,
    );
  },

  workflowRuns(repositoryId: string) {
    return api.get<Envelope<WorkflowRun[]>>(
      `${repo(repositoryId)}/actions/runs`,
    );
  },

  rerun(repositoryId: string, runId: number, failedOnly: boolean) {
    return api.post<Envelope<{ runId: number; queued: boolean }>>(
      `${repo(repositoryId)}/actions/runs/${runId}/rerun`,
      { failedOnly },
    );
  },
};
