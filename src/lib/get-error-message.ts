import { isAxiosError } from "axios";
import { isApiError } from "@/lib/apiClient";

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (isAxiosError(error)) {
    return error.response?.data?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}
