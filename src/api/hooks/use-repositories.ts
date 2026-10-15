import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { repositoriesApi } from "@/api/repositories";
import { issueKeys } from "@/api/hooks/use-issues";

export const repositoryKeys = {
  all: () => ["repositories"] as const,
};

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
