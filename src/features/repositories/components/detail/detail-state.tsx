import type { ReactNode } from "react";
import { isApiError } from "@/lib/apiClient";

export function readError(error: unknown, fallback: string) {
  if (isApiError(error)) return error.message;
  return fallback;
}

type DetailStateProps = {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  fallback: string;
  pendingLabel: string;
  children: ReactNode;
};

export default function DetailState({
  isPending,
  isError,
  error,
  fallback,
  pendingLabel,
  children,
}: DetailStateProps) {
  if (isPending) return <p className="text-subtle py-4">{pendingLabel}</p>;
  if (isError) {
    return <p className="text-destructive py-4">{readError(error, fallback)}</p>;
  }
  return <>{children}</>;
}
