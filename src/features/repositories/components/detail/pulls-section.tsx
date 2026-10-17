import type { RepositoryPull } from "@/api/repositories";
import Avatar from "@/components/_ui/avatar";
import Tag from "@/components/_ui/tag";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { formatWhen } from "@/features/issues/lib/triage";
import TargetIcon from "@/public/assets/images/companies/sidebar/target-05.svg?react";

function pullState(pull: RepositoryPull) {
  if (pull.merged) return { label: "Merged", tone: "purple" as const };
  if (pull.state === "closed") return { label: "Closed", tone: "red" as const };
  if (pull.draft) return { label: "Draft", tone: "neutral" as const };
  return { label: "Open", tone: "green" as const };
}

export default function PullsSection({ pulls }: { pulls: RepositoryPull[] }) {
  if (pulls.length === 0) {
    return (
      <EmptyState
        icon={<TargetIcon className="size-6" />}
        className="max-w-[56em]"
        title="No pull requests yet"
        description="Open, draft, and merged pull requests for this repository will be listed here."
      />
    );
  }

  return (
    <ol className="flex max-w-[56em] flex-col">
      {pulls.map((pull) => {
        const state = pullState(pull);
        return (
          <li
            key={pull.number}
            className="border-border flex items-start justify-between gap-4 border-b py-3 last:border-b-0"
          >
            <div className="flex min-w-0 items-start gap-3">
              {pull.authorAvatarUrl ? (
                <Avatar src={pull.authorAvatarUrl} alt="" className="mt-0.5" />
              ) : (
                <span aria-hidden className="bg-muted mt-0.5 size-5 shrink-0 rounded-full" />
              )}
              <div className="flex min-w-0 flex-col gap-1">
                <a
                  href={pull.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium leading-[1.3] break-words underline-offset-2 hover:underline"
                >
                  #{pull.number} {pull.title}
                </a>
                <span className="caption-style text-subtle break-all">
                  {pull.authorLogin} · {pull.headRef} → {pull.baseRef} · updated{" "}
                  {formatWhen(pull.updatedAt)}
                </span>
              </div>
            </div>
            <Tag tone={state.tone} size="sm">
              {state.label}
            </Tag>
          </li>
        );
      })}
    </ol>
  );
}
