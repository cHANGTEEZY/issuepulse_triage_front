import { Branches } from "@lucasmarkes/hairline/react";
import HairlineFigure from "@/components/_common/hairline-figure";
import type { RepositoryPull } from "@/api/repositories";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import Tag from "@/components/_ui/tag";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { formatWhen } from "@/features/issues/lib/triage";

export function pullState(
  pull: Pick<RepositoryPull, "merged" | "state" | "draft">,
) {
  if (pull.merged) return { label: "Merged", tone: "purple" as const };
  if (pull.state === "closed") return { label: "Closed", tone: "red" as const };
  if (pull.draft) return { label: "Draft", tone: "neutral" as const };
  return { label: "Open", tone: "green" as const };
}

type PullsSectionProps = {
  pulls: RepositoryPull[];
  onOpen: (number: number) => void;
  onCompose: () => void;
};

export default function PullsSection({
  pulls,
  onOpen,
  onCompose,
}: PullsSectionProps) {
  const compose = (
    <Button variant="primary" size="md" onClick={onCompose}>
      New pull request
    </Button>
  );

  if (pulls.length === 0) {
    return (
      <EmptyState
        illustration={<HairlineFigure figure={Branches} />}
        title="No pull requests yet"
        description="Open, draft, and merged pull requests for this repository will be listed here."
        action={compose}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">{compose}</div>
      <ol className="flex flex-col">
        {pulls.map((pull) => {
          const state = pullState(pull);
          return (
            <li
              key={pull.number}
              className="border-border border-b last:border-b-0"
            >
              <button
                type="button"
                onClick={() => onOpen(pull.number)}
                className="hover:bg-card/60 flex w-full items-start justify-between gap-4 rounded-lg px-2 py-3 text-left"
              >
                <span className="flex min-w-0 items-start gap-3">
                  {pull.authorAvatarUrl ? (
                    <Avatar
                      src={pull.authorAvatarUrl}
                      alt=""
                      className="mt-0.5"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="bg-muted mt-0.5 size-5 shrink-0 rounded-full"
                    />
                  )}
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="leading-[1.3] font-medium break-words">
                      #{pull.number} {pull.title}
                    </span>
                    <span className="caption-style text-subtle break-all">
                      {pull.authorLogin} · {pull.headRef} → {pull.baseRef} ·
                      updated {formatWhen(pull.updatedAt)}
                    </span>
                  </span>
                </span>
                <Tag tone={state.tone} size="sm">
                  {state.label}
                </Tag>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
