import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  issuesApi,
  type IssueFilters,
  type TriagePatch,
} from "@/api/issues";

export const issueKeys = {
  all: () => ["issues"] as const,
  list: (filters: IssueFilters) => ["issues", "list", filters] as const,
  summary: () => ["issues", "summary"] as const,
  detail: (id: string) => ["issues", "detail", id] as const,
  assignees: () => ["issues", "assignees"] as const,
};

export function useIssueList(filters: IssueFilters, enabled = true) {
  return useQuery({
    queryKey: issueKeys.list(filters),
    queryFn: async () => (await issuesApi.list(filters)).data,
    enabled,
  });
}

export function useIssueSummary() {
  return useQuery({
    queryKey: issueKeys.summary(),
    queryFn: async () => (await issuesApi.summary()).data,
  });
}

export function useIssue(id: string) {
  return useQuery({
    queryKey: issueKeys.detail(id),
    queryFn: async () => (await issuesApi.get(id)).data,
    enabled: id.length > 0,
  });
}

export function useAssignees() {
  return useQuery({
    queryKey: issueKeys.assignees(),
    queryFn: async () => (await issuesApi.assignees()).data,
  });
}

export function useUpdateTriage(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: TriagePatch) => issuesApi.updateTriage(id, patch),
    onSuccess: async (response) => {
      queryClient.setQueryData(issueKeys.detail(id), response.data);
      await queryClient.invalidateQueries({ queryKey: issueKeys.all() });
    },
  });
}
