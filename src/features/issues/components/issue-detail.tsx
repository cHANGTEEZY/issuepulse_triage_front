import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import PageHeader from "@/components/_common/page-header";
import Button from "@/components/_ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import { isApiError } from "@/lib/apiClient";
import {
  TRIAGE_PRIORITIES,
  TRIAGE_STATUSES,
  type TriagePriority,
  type TriageStatus,
} from "@/api/issues";
import { useAssignees, useIssue, useUpdateTriage } from "@/api/hooks/use-issues";
import IssueBadges from "@/features/issues/components/issue-badges";
import MarkdownBody from "@/features/issues/components/markdown-body";
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  formatWhen,
} from "@/features/issues/lib/triage";

function errorMessage(error: unknown) {
  if (isApiError(error)) return error.message;
  return "Could not save triage.";
}

export default function IssueDetail({ issueId }: { issueId: string }) {
  const issue = useIssue(issueId);
  const assignees = useAssignees();
  const update = useUpdateTriage(issueId);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setNotes(issue.data?.triage.notes ?? "");
  }, [issue.data?.id, issue.data?.triage.notes]);

  const savedNotes = issue.data?.triage.notes ?? "";
  const notesDirty = notes !== savedNotes;
  const saveLabel = update.isPending
    ? "Saving…"
    : notesDirty
      ? "Unsaved changes"
      : "Saved";

  async function save(patch: Parameters<typeof update.mutateAsync>[0]) {
    await update.mutateAsync(patch);
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PageHeader
        title={issue.data ? `#${issue.data.number} ${issue.data.title}` : "Issue"}
        description={
          issue.data
            ? `${issue.data.repository.owner}/${issue.data.repository.name} · updated ${formatWhen(issue.data.githubUpdatedAt)}`
            : "Internal triage for a GitHub issue."
        }
        actions={
          <Button variant="ghost" size="md" href="/">
            Back to issues
          </Button>
        }
      />

      <div className="min-h-0 flex-1 overflow-auto px-4 py-5">
        {issue.isPending && <p className="text-subtle">Loading issue…</p>}
        {issue.isError && (
          <p className="text-destructive">
            {isApiError(issue.error) ? issue.error.message : "Issue not found."}
          </p>
        )}
        {issue.data && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,42em)_20em]">
            <div className="flex min-w-0 flex-col gap-4">
              <IssueBadges issue={issue.data} />
              <p className="text-subtle">
                Opened by {issue.data.authorLogin} · {issue.data.state}
              </p>
              <a
                href={issue.data.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="w-fit underline decoration-from-font underline-offset-2"
              >
                View on GitHub
              </a>
              <MarkdownBody source={issue.data.body ?? ""} />
            </div>

            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void save({ notes });
              }}
            >
              <label className="flex flex-col gap-1.5">
                <span className="caption-style text-subtle">Status</span>
                <Select
                  value={issue.data.triage.status}
                  onValueChange={(status) =>
                    void save({ status: status as TriageStatus })
                  }
                >
                  <SelectTrigger aria-label="Status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIAGE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABEL[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="caption-style text-subtle">Priority</span>
                <Select
                  value={issue.data.triage.priority}
                  onValueChange={(priority) =>
                    void save({ priority: priority as TriagePriority })
                  }
                >
                  <SelectTrigger aria-label="Priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIAGE_PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {PRIORITY_LABEL[priority]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="caption-style text-subtle">Owner</span>
                <Select
                  value={issue.data.triage.owner?.id ?? "unassigned"}
                  onValueChange={(ownerId) =>
                    void save({
                      ownerId: ownerId === "unassigned" ? null : ownerId,
                    })
                  }
                >
                  <SelectTrigger aria-label="Owner">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {(assignees.data ?? []).map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="caption-style text-subtle">Internal notes</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={8}
                  className="border-line-strong bg-secondary focus-visible:border-ring min-h-32 w-full rounded-lg border px-3 py-2 text-[14px] leading-[1.4] outline-none"
                />
              </label>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={!notesDirty || update.isPending}
                >
                  Save notes
                </Button>
                <span className="caption-style text-subtle" aria-live="polite">
                  {saveLabel}
                </span>
              </div>
              {update.isError && (
                <p className="text-destructive">{errorMessage(update.error)}</p>
              )}
              <p className="caption-style text-subtle">
                Notes stay local. GitHub sync does not replace them.{" "}
                <Link to="/repositories" className="underline underline-offset-2">
                  Manage repositories
                </Link>
              </p>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
