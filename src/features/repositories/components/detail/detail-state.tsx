import type { ReactNode } from "react";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { isApiError } from "@/lib/apiClient";
import AlertTriangleIcon from "@/public/assets/images/companies/sidebar/alert-triangle.svg?react";

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
    const message = readError(error, fallback);
    return (
      <EmptyState
        icon={<AlertTriangleIcon className="size-6" />}
        className="max-w-[56em]"
        title={fallback}
        description={
          message === fallback
            ? "Check your connection and try again in a moment."
            : message
        }
      />
    );
  }
  return <>{children}</>;
}
