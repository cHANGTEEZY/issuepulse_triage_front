import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  githubApi,
  type CommitInput,
  type IssueGithubPatch,
  type MergeMethod,
  type PullInput,
  type PullPatch,
  type ReviewEvent,
  type StatusInput,
} from "@/api/github";
import { issueKeys } from "@/api/hooks/use-issues";
import { repositoryKeys } from "@/api/hooks/use-repositories";

export const githubKeys = {
  thread: (issueId: string) => ["github", "thread", issueId] as const,
  labels: (repositoryId: string) => ["github", "labels", repositoryId] as const,
  assignees: (repositoryId: string) =>
    ["github", "assignees", repositoryId] as const,
  file: (repositoryId: string, path: string, ref: string) =>
    ["github", "file", repositoryId, path, ref] as const,
  branches: (repositoryId: string) =>
    ["github", "branches", repositoryId] as const,
  pull: (repositoryId: string, number: number) =>
    ["github", "pull", repositoryId, number] as const,
  checks: (repositoryId: string, ref: string) =>
    ["github", "checks", repositoryId, ref] as const,
  runs: (repositoryId: string) => ["github", "runs", repositoryId] as const,
};

export function useIssueThread(issueId: string) {
  return useQuery({
    queryKey: githubKeys.thread(issueId),
    queryFn: async () => (await githubApi.issueThread(issueId)).data,
    enabled: issueId.length > 0,
    retry: false,
  });
}

export function useCommentOnIssue(issueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) =>
      (await githubApi.comment(issueId, body)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: githubKeys.thread(issueId),
      });
      await queryClient.invalidateQueries({ queryKey: issueKeys.all() });
    },
  });
}

export function useUpdateGithubIssue(issueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: IssueGithubPatch) =>
      (await githubApi.updateIssue(issueId, patch)).data,
    onSuccess: async (issue) => {
      queryClient.setQueryData(issueKeys.detail(issueId), issue);
      await queryClient.invalidateQueries({
        queryKey: githubKeys.thread(issueId),
      });
      await queryClient.invalidateQueries({ queryKey: issueKeys.all() });
    },
  });
}

export function useRepositoryLabels(repositoryId: string, enabled = true) {
  return useQuery({
    queryKey: githubKeys.labels(repositoryId),
    queryFn: async () => (await githubApi.labels(repositoryId)).data,
    enabled: enabled && repositoryId.length > 0,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useRepositoryAssignees(repositoryId: string, enabled = true) {
  return useQuery({
    queryKey: githubKeys.assignees(repositoryId),
    queryFn: async () => (await githubApi.assignees(repositoryId)).data,
    enabled: enabled && repositoryId.length > 0,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useRepositoryFile(
  repositoryId: string,
  path: string,
  ref: string,
) {
  return useQuery({
    queryKey: githubKeys.file(repositoryId, path, ref),
    queryFn: async () => (await githubApi.file(repositoryId, path, ref)).data,
    enabled: repositoryId.length > 0 && path.length > 0,
    retry: false,
  });
}

export function useRepositoryBranches(repositoryId: string) {
  return useQuery({
    queryKey: githubKeys.branches(repositoryId),
    queryFn: async () => (await githubApi.branches(repositoryId)).data,
    enabled: repositoryId.length > 0,
    retry: false,
  });
}

export function useCreateBranch(repositoryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; from?: string }) =>
      (await githubApi.createBranch(repositoryId, input.name, input.from)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: githubKeys.branches(repositoryId),
      });
    },
  });
}

export function useCommitFile(repositoryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CommitInput) =>
      (await githubApi.commitFile(repositoryId, input)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["github", "file", repositoryId],
      });
      await queryClient.invalidateQueries({
        queryKey: githubKeys.branches(repositoryId),
      });
      await queryClient.invalidateQueries({
        queryKey: ["repositories", "contents", repositoryId],
      });
      await queryClient.invalidateQueries({
        queryKey: repositoryKeys.commits(repositoryId),
      });
    },
  });
}

export function usePullRequest(repositoryId: string, number: number | null) {
  return useQuery({
    queryKey: githubKeys.pull(repositoryId, number ?? 0),
    queryFn: async () => (await githubApi.pull(repositoryId, number ?? 0)).data,
    enabled: repositoryId.length > 0 && number != null,
    retry: false,
  });
}

function usePullWrite<TInput>(
  repositoryId: string,
  run: (input: TInput) => ReturnType<typeof githubApi.pull>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TInput) => (await run(input)).data,
    onSuccess: async (pull) => {
      queryClient.setQueryData(
        githubKeys.pull(repositoryId, pull.number),
        pull,
      );
      await queryClient.invalidateQueries({
        queryKey: repositoryKeys.pulls(repositoryId),
      });
      await queryClient.invalidateQueries({
        queryKey: repositoryKeys.commits(repositoryId),
      });
    },
  });
}

export function useCreatePull(repositoryId: string) {
  return usePullWrite(repositoryId, (input: PullInput) =>
    githubApi.createPull(repositoryId, input),
  );
}

export function useUpdatePull(repositoryId: string, number: number) {
  return usePullWrite(repositoryId, (patch: PullPatch) =>
    githubApi.updatePull(repositoryId, number, patch),
  );
}

export function useReviewPull(repositoryId: string, number: number) {
  return usePullWrite(
    repositoryId,
    (input: { event: ReviewEvent; body: string }) =>
      githubApi.reviewPull(repositoryId, number, input.event, input.body),
  );
}

export function useMergePull(repositoryId: string, number: number) {
  return usePullWrite(repositoryId, (method: MergeMethod) =>
    githubApi.mergePull(repositoryId, number, method),
  );
}

export function useCommitChecks(repositoryId: string, ref: string | null) {
  return useQuery({
    queryKey: githubKeys.checks(repositoryId, ref ?? ""),
    queryFn: async () => (await githubApi.checks(repositoryId, ref ?? "")).data,
    enabled: repositoryId.length > 0 && Boolean(ref),
    retry: false,
  });
}

export function usePostStatus(repositoryId: string, sha: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: StatusInput) =>
      (await githubApi.postStatus(repositoryId, sha, input)).data,
    onSuccess: (checks) => {
      queryClient.setQueryData(githubKeys.checks(repositoryId, sha), checks);
    },
  });
}

export function useWorkflowRuns(repositoryId: string, enabled = true) {
  return useQuery({
    queryKey: githubKeys.runs(repositoryId),
    queryFn: async () => (await githubApi.workflowRuns(repositoryId)).data,
    enabled: enabled && repositoryId.length > 0,
    retry: false,
  });
}

export function useRerunWorkflow(repositoryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { runId: number; failedOnly: boolean }) =>
      (await githubApi.rerun(repositoryId, input.runId, input.failedOnly)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: githubKeys.runs(repositoryId),
      });
    },
  });
}
