import { api } from "@/lib/apiClient";

export type RepositoryRecord = {
  id: string;
  githubRepoId: number;
  owner: string;
  name: string;
  lastSyncedAt: string | null;
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
};
