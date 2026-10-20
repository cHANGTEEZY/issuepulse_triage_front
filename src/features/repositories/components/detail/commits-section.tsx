import { Terminal } from "@lucasmarkes/hairline/react";
import { useState } from "react";
import HairlineFigure from "@/components/_common/hairline-figure";
import type { RepositoryCommit } from "@/api/repositories";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { formatWhen } from "@/features/issues/lib/triage";
import CommitChecks from "./commit-checks";

function subject(message: string) {
  const [first = ""] = message.split("\n");
  return first.trim();
}

type CommitsSectionProps = {
  repositoryId: string;
  commits: RepositoryCommit[];
};

export default function CommitsSection({
  repositoryId,
  commits,
}: CommitsSectionProps) {
  const [open, setOpen] = useState<string | null>(null);

  if (commits.length === 0) {
    return (
      <EmptyState
        illustration={<HairlineFigure figure={Terminal} />}
        title="No commits yet"
        description="Commits on the default branch will appear here once the repository has history to show."
      />
    );
  }

  return (
    <ol className="flex flex-col">
      {commits.map((commit) => {
        const expanded = open === commit.sha;
        return (
          <li
            key={commit.sha}
            className="border-border flex flex-col gap-3 border-b py-3 last:border-b-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                {commit.authorAvatarUrl ? (
                  <Avatar
                    src={commit.authorAvatarUrl}
                    alt=""
                    className="mt-0.5"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="bg-muted mt-0.5 size-5 shrink-0 rounded-full"
                  />
                )}
                <div className="flex min-w-0 flex-col gap-1">
                  <a
                    href={commit.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="leading-[1.3] font-medium break-words underline-offset-2 hover:underline"
                  >
                    {subject(commit.message)}
                  </a>
                  <span className="caption-style text-subtle">
                    {commit.authorLogin ?? commit.authorName} ·{" "}
                    {formatWhen(commit.date)}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : commit.sha)}
                >
                  {expanded ? "Hide checks" : "Checks"}
                </Button>
                <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[13px]">
                  {commit.shortSha}
                </code>
              </div>
            </div>
            {expanded && (
              <div className="pl-8">
                <CommitChecks repositoryId={repositoryId} sha={commit.sha} />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
