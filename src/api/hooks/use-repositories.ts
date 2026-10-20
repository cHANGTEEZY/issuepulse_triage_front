import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { repositoriesApi } from "@/api/repositories";
import { issueKeys } from "@/api/hooks/use-issues";

export const repositoryKeys = {
  all: () => ["repositories"] as const,
  overview: (id: string) => ["repositories", "overview", id] as const,
  commits: (id: string) => ["repositories", "commits", id] as const,
  contents: (id: string, path: string) =>
    ["repositories", "contents", id, path] as const,
  tree: (id: string, ref: string) =>
    ["repositories", "contents", id, "tree", ref] as const,
  pulls: (id: string) => ["repositories", "pulls", id] as const,
};

export function useRepositoryOverview(id: string) {
  return useQuery({
    queryKey: repositoryKeys.overview(id),
    queryFn: async () => (await repositoriesApi.overview(id)).data,
    enabled: id.length > 0,
    retry: false,
  });
}

export function useRepositoryCommits(id: string) {
  return useQuery({
    queryKey: repositoryKeys.commits(id),
    queryFn: async () => (await repositoriesApi.commits(id)).data,
    enabled: id.length > 0,
    retry: false,
  });
}

export function useRepositoryTree(id: string, ref: string) {
  return useQuery({
    queryKey: repositoryKeys.tree(id, ref),
    queryFn: async () => (await repositoriesApi.tree(id, ref)).data,
    enabled: id.length > 0,
    retry: false,
    placeholderData: (previous) => previous,
  });
}

export function useRepositoryContents(id: string, path: string) {
  return useQuery({
    queryKey: repositoryKeys.contents(id, path),
    queryFn: async () => (await repositoriesApi.contents(id, path)).data,
    enabled: id.length > 0,
    retry: false,
    placeholderData: (previous) => previous,
  });
}

export function useRepositoryPulls(id: string) {
  return useQuery({
    queryKey: repositoryKeys.pulls(id),
    queryFn: async () => (await repositoriesApi.pulls(id)).data,
    enabled: id.length > 0,
    retry: false,
  });
}

export function useRepositories() {
  return useQuery({
    queryKey: repositoryKeys.all(),
    queryFn: async () => (await repositoriesApi.list()).data,
  });
}

export function useSyncRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repositoriesApi.sync(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: repositoryKeys.all() });
      await queryClient.invalidateQueries({ queryKey: issueKeys.all() });
    },
  });
}

export function useInstallUrl() {
  return useMutation({
    mutationFn: async () => (await repositoriesApi.installUrl()).data.url,
  });
}

export function useRepositoryRefresh() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["repositories", "refresh"] as const,
    queryFn: async () => {
      const data = (await repositoriesApi.refresh()).data;
      queryClient.setQueryData(repositoryKeys.all(), data);
      return data;
    },
    staleTime: 60_000,
    retry: false,
  });
}

export function useRepositoryCatalog() {
  const list = useRepositories();
  const refresh = useRepositoryRefresh();
  const data = refresh.data ?? list.data;

  return {
    data,
    error: list.error ?? refresh.error,
    isPending: !data && (list.isPending || refresh.isPending),
    isError: !data && list.isError && refresh.isError,
    isRefreshing: refresh.isFetching,
    refreshError: refresh.error,
  };
}
