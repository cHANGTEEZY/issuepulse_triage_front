import { api } from "@/lib/apiClient";
import { ENDPOINTS } from "./endpoints";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "./types";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  role: string;
  status: string;
  avatar: string;
  joinDate: string;
}

export interface UserFilters extends PaginationParams {
  search?: string;
  role?: string;
  status?: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  username?: string;
  role: string;
  status?: string;
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, "password">>;

export const usersApi = {
  list: (filters?: UserFilters) =>
    api.get<PaginatedResponse<User>>(ENDPOINTS.users.list, { params: filters }),
  get: (id: string | number) =>
    api.get<ApiResponse<User>>(ENDPOINTS.users.detail(id)),
  create: (payload: CreateUserPayload) =>
    api.post<ApiResponse<User>>(ENDPOINTS.users.create, payload),
  update: (id: string | number, payload: UpdateUserPayload) =>
    api.put<ApiResponse<User>>(ENDPOINTS.users.update(id), payload),
  patch: (id: string | number, payload: UpdateUserPayload) =>
    api.patch<ApiResponse<User>>(ENDPOINTS.users.update(id), payload),
  remove: (id: string | number) =>
    api.delete<void>(ENDPOINTS.users.delete(id)),
  uploadAvatar: (
    id: string | number,
    file: File,
    onProgress?: (percent: number) => void,
  ) => {
    const form = new FormData();
    form.append("avatar", file);
    return api.upload<ApiResponse<User>>(
      ENDPOINTS.users.avatar(id),
      form,
      onProgress,
    );
  },
};
