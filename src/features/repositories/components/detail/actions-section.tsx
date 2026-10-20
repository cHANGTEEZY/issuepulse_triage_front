import { Terminal } from "@lucasmarkes/hairline/react";
import HairlineFigure from "@/components/_common/hairline-figure";
import type { WorkflowRun } from "@/api/github";
import { useRerunWorkflow } from "@/api/hooks/use-github";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import Tag from "@/components/_ui/tag";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { useUiStore } from "@/features/app/stores/ui-store";
import GithubError from "@/features/github/components/github-error";
import { formatWhen } from "@/features/issues/lib/triage";
import { outcomeLabel, outcomeTone } from "./commit-checks";

const FAILED = new Set([
  "failure",
  "cancelled",
  "timed_out",
  "startup_failure",
]);

type ActionsSectionProps = {
  repositoryId: string;
  runs: WorkflowRun[];
};

export default function ActionsSection({
  repositoryId,
  runs,
}: ActionsSectionProps) {
  const rerun = useRerunWorkflow(repositoryId);
  const showToast = useUiStore((state) => state.showToast);

  if (runs.length === 0) {
    return (
      <EmptyState
        illustration={<HairlineFigure figure={Terminal} />}
        title="No workflow runs yet"
        description="GitHub Actions runs for this repository will be listed here once a workflow has run."
      />
    );
  }

  const pendingId = rerun.isPending ? rerun.variables?.runId : null;

  return (
    <div className="flex flex-col gap-3">
      <GithubError error={rerun.error} />
      <ol className="flex flex-col">
        {runs.map((run) => {
          const outcome =
            run.status === "completed" ? run.conclusion : run.status;
          const finished = run.status === "completed";
          const failed = finished && FAILED.has(run.conclusion ?? "");
          const busy = pendingId === run.id;
          return (
            <li
              key={run.id}
              className="border-border flex items-start justify-between gap-4 border-b py-3 last:border-b-0"
            >
              <div className="flex min-w-0 items-start gap-3">
                {run.actor.avatarUrl ? (
                  <Avatar src={run.actor.avatarUrl} alt="" className="mt-0.5" />
                ) : (
                  <span
                    aria-hidden
                    className="bg-muted mt-0.5 size-5 shrink-0 rounded-full"
                  />
                )}
                <div className="flex min-w-0 flex-col gap-1">
                  <a
                    href={run.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="leading-[1.3] font-medium break-words underline-offset-2 hover:underline"
                  >
                    {run.title}
                  </a>
                  <span className="caption-style text-subtle break-all">
                    {run.name} #{run.runNumber} · {run.event} · {run.branch} ·{" "}
                    {formatWhen(run.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Tag tone={outcomeTone(outcome)} size="sm">
                  {outcomeLabel(outcome)}
                </Tag>
                {finished && failed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={rerun.isPending}
                    onClick={() =>
                      rerun.mutate(
                        { runId: run.id, failedOnly: true },
                        {
                          onSuccess: () =>
                            showToast({
                              title: "Re-running failed jobs",
                              description: run.title,
                            }),
                        },
                      )
                    }
                  >
                    Failed jobs
                  </Button>
                )}
                {finished && (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={rerun.isPending}
                    onClick={() =>
                      rerun.mutate(
                        { runId: run.id, failedOnly: false },
                        {
                          onSuccess: () =>
                            showToast({
                              title: "Workflow re-run queued",
                              description: run.title,
                            }),
                        },
                      )
                    }
                  >
                    {busy ? "Queuing…" : "Re-run"}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
