import { api } from "@/lib/apiClient";

export type RepositoryRecord = {
  id: string;
  githubRepoId: number;
  owner: string;
  name: string;
  isPrivate: boolean;
  description: string | null;
  defaultBranch: string | null;
  language: string | null;
  openIssues: number;
  pushedAt: string | null;
  lastSyncedAt: string | null;
};

export type RepositoryOverview = RepositoryRecord & {
  fullName: string;
  description: string | null;
  defaultBranch: string;
  private: boolean;
  htmlUrl: string;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string | null;
};

export type RepositoryCommit = {
  sha: string;
  shortSha: string;
  message: string;
  authorName: string;
  authorLogin: string | null;
  authorAvatarUrl: string | null;
  date: string | null;
  htmlUrl: string;
};

export type RepositoryEntry = {
  name: string;
  path: string;
  type: "dir" | "file" | "symlink" | "submodule";
  size: number;
  htmlUrl: string | null;
};

export type RepositoryTreeEntry = {
  path: string;
  type: "dir" | "file" | "submodule";
  size: number;
};

export type RepositoryTree = {
  truncated: boolean;
  entries: RepositoryTreeEntry[];
};

export type RepositoryPull = {
  number: number;
  title: string;
  state: "open" | "closed";
  merged: boolean;
  draft: boolean;
  authorLogin: string;
  authorAvatarUrl: string | null;
  headRef: string;
  baseRef: string;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
};

type Envelope<T> = {
  success: boolean;
  data: T;
};

export const repositoriesApi = {
  list() {
    return api.get<Envelope<RepositoryRecord[]>>("/v1/repositories");
  },

  sync(id: string) {
    return api.post<Envelope<RepositoryRecord>>(`/v1/repositories/${id}/sync`);
  },

  installUrl() {
    return api.get<Envelope<{ url: string }>>("/v1/repositories/install-url");
  },

  refresh() {
    return api.post<Envelope<RepositoryRecord[]>>(
      "/v1/repositories/refresh",
      undefined,
      {
        timeout: 60_000,
      },
    );
  },

  overview(id: string) {
    return api.get<Envelope<RepositoryOverview>>(`/v1/repositories/${id}`);
  },

  commits(id: string) {
    return api.get<Envelope<RepositoryCommit[]>>(
      `/v1/repositories/${id}/commits`,
    );
  },

  contents(id: string, path: string) {
    return api.get<Envelope<RepositoryEntry[]>>(
      `/v1/repositories/${id}/contents`,
      {
        params: { path },
      },
    );
  },

  tree(id: string, ref: string) {
    return api.get<Envelope<RepositoryTree>>(`/v1/repositories/${id}/tree`, {
      params: { ref: ref || undefined },
    });
  },

  pulls(id: string) {
    return api.get<Envelope<RepositoryPull[]>>(`/v1/repositories/${id}/pulls`);
  },
};
