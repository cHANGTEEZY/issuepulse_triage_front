import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  usersApi,
  type CreateUserPayload,
  type UpdateUserPayload,
  type UserFilters,
} from "../users";

export const userKeys = {
  all: () => ["users"] as const,
  lists: () => [...userKeys.all(), "list"] as const,
  list: (filters?: UserFilters) =>
    [...userKeys.lists(), filters ?? {}] as const,
  detail: (id: string | number) => [...userKeys.all(), "detail", id] as const,
};

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => usersApi.list(filters),
  });
}

export function useUser(id: string | number | undefined) {
  return useQuery({
    queryKey: userKeys.detail(id!),
    queryFn: () => usersApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser(id: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => usersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function usePatchUser(id: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => usersApi.patch(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => usersApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUploadAvatar(id: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (pct: number) => void;
    }) => usersApi.uploadAvatar(id, file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}
