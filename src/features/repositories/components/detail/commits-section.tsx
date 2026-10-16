import type { RepositoryCommit } from "@/api/repositories";
import Avatar from "@/components/_ui/avatar";
import { formatWhen } from "@/features/issues/lib/triage";

function subject(message: string) {
  const [first = ""] = message.split("\n");
  return first.trim();
}

export default function CommitsSection({ commits }: { commits: RepositoryCommit[] }) {
  if (commits.length === 0) {
    return <p className="text-subtle py-4">No commits on the default branch yet.</p>;
  }

  return (
    <ol className="flex max-w-[56em] flex-col">
      {commits.map((commit) => (
        <li
          key={commit.sha}
          className="border-border flex items-start justify-between gap-4 border-b py-3 last:border-b-0"
        >
          <div className="flex min-w-0 items-start gap-3">
            {commit.authorAvatarUrl ? (
              <Avatar src={commit.authorAvatarUrl} alt="" className="mt-0.5" />
            ) : (
              <span aria-hidden className="bg-muted mt-0.5 size-5 shrink-0 rounded-full" />
            )}
            <div className="flex min-w-0 flex-col gap-1">
              <a
                href={commit.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium leading-[1.3] break-words underline-offset-2 hover:underline"
              >
                {subject(commit.message)}
              </a>
              <span className="caption-style text-subtle">
                {commit.authorLogin ?? commit.authorName} · {formatWhen(commit.date)}
              </span>
            </div>
          </div>
          <code className="bg-muted shrink-0 rounded px-1.5 py-0.5 font-mono text-[13px]">
            {commit.shortSha}
          </code>
        </li>
      ))}
    </ol>
  );
}
