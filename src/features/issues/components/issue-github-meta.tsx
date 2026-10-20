import type { ReactNode } from "react";
import type { IssueRecord } from "@/api/issues";
import {
  useIssueThread,
  useRepositoryAssignees,
  useRepositoryLabels,
  useUpdateGithubIssue,
} from "@/api/hooks/use-github";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import Tag from "@/components/_ui/tag";
import ChecklistPicker from "@/features/github/components/checklist-picker";
import GithubError from "@/features/github/components/github-error";

function Swatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="size-2.5 shrink-0 rounded-full outline-1 -outline-offset-1 outline-white/15"
      style={{ backgroundColor: `#${color}` }}
    />
  );
}

function Row({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="caption-style text-subtle">{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function IssueGithubMeta({ issue }: { issue: IssueRecord }) {
  const thread = useIssueThread(issue.id);
  const labels = useRepositoryLabels(issue.repository.id);
  const people = useRepositoryAssignees(issue.repository.id);
  const update = useUpdateGithubIssue(issue.id);

  const state =
    thread.data?.state ?? (issue.state === "closed" ? "closed" : "open");
  const assignees = thread.data?.assignees ?? [];
  const busy = update.isPending;

  return (
    <div className="border-line-strong flex flex-col gap-5 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">On GitHub</span>
        <Tag tone={state === "open" ? "green" : "purple"} size="sm">
          {state === "open"
            ? "Open"
            : thread.data?.stateReason === "not_planned"
              ? "Not planned"
              : "Closed"}
        </Tag>
      </div>

      <div className="flex flex-wrap gap-2">
        {state === "open" ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() =>
                update.mutate({ state: "closed", stateReason: "completed" })
              }
            >
              Close as completed
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() =>
                update.mutate({ state: "closed", stateReason: "not_planned" })
              }
            >
              Close as not planned
            </Button>
          </>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() =>
              update.mutate({ state: "open", stateReason: "reopened" })
            }
          >
            Reopen issue
          </Button>
        )}
      </div>

      <Row
        title="Labels"
        action={
          <ChecklistPicker
            label="Labels"
            disabled={busy}
            loading={labels.isPending}
            emptyLabel={
              labels.isError ? "Labels could not be loaded" : "No labels match"
            }
            selected={issue.labels.map((label) => label.name)}
            options={(labels.data ?? []).map((label) => ({
              value: label.name,
              label: label.name,
              hint: label.description,
              leading: <Swatch color={label.color} />,
            }))}
            onApply={(values) => update.mutate({ labels: values })}
          />
        }
      >
        {issue.labels.length === 0 ? (
          <span className="text-subtle">None yet</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {issue.labels.map((label) => (
              <Tag key={label.name} size="sm" className="gap-1.5">
                <Swatch color={label.color} />
                {label.name}
              </Tag>
            ))}
          </div>
        )}
      </Row>

      <Row
        title="Assignees"
        action={
          <ChecklistPicker
            label="Assignees"
            max={10}
            disabled={busy || thread.isPending}
            loading={people.isPending}
            emptyLabel={
              people.isError
                ? "Assignees could not be loaded"
                : "Nobody matches"
            }
            selected={assignees.map((person) => person.login)}
            options={(people.data ?? []).map((person) => ({
              value: person.login,
              label: person.login,
              leading: person.avatarUrl ? (
                <Avatar src={person.avatarUrl} alt="" />
              ) : undefined,
            }))}
            onApply={(values) => update.mutate({ assignees: values })}
          />
        }
      >
        {thread.isPending ? (
          <span className="text-subtle">Loading…</span>
        ) : assignees.length === 0 ? (
          <span className="text-subtle">Nobody assigned</span>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {assignees.map((person) => (
              <li key={person.login} className="flex items-center gap-2">
                {person.avatarUrl && <Avatar src={person.avatarUrl} alt="" />}
                <span className="truncate">{person.login}</span>
              </li>
            ))}
          </ul>
        )}
      </Row>

      {busy && (
        <span className="caption-style text-subtle" aria-live="polite">
          Saving to GitHub…
        </span>
      )}
      <GithubError error={update.error} />
      {thread.isError && (
        <GithubError
          error={thread.error}
          fallback="Could not load GitHub details."
        />
      )}
    </div>
  );
}
