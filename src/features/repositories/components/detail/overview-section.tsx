import type { RepositoryOverview } from "@/api/repositories";
import Tag from "@/components/_ui/tag";
import { formatWhen } from "@/features/issues/lib/triage";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="caption-style text-subtle">{label}</span>
      <span className="leading-[1.3] break-words">{value}</span>
    </div>
  );
}

export default function OverviewSection({
  repository,
}: {
  repository: RepositoryOverview;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag tone={repository.private ? "amber" : "green"} size="sm">
            {repository.private ? "Private" : "Public"}
          </Tag>
          {repository.language && (
            <Tag tone="blue" size="sm">
              {repository.language}
            </Tag>
          )}
        </div>
        <p className={repository.description ? "" : "text-subtle"}>
          {repository.description ?? "This repository has no description."}
        </p>
        <a
          href={repository.htmlUrl}
          target="_blank"
          rel="noreferrer"
          className="w-fit underline decoration-from-font underline-offset-2"
        >
          View on GitHub
        </a>
      </div>

      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <Fact label="Default branch" value={repository.defaultBranch} />
        <Fact label="Open issues" value={String(repository.openIssues)} />
        <Fact label="Stars" value={String(repository.stars)} />
        <Fact label="Forks" value={String(repository.forks)} />
        <Fact label="Last push" value={formatWhen(repository.pushedAt)} />
        <Fact label="Last sync" value={formatWhen(repository.lastSyncedAt)} />
      </div>
    </div>
  );
}
