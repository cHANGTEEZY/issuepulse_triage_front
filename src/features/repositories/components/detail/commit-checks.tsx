import { useState } from "react";
import type { StatusInput } from "@/api/github";
import { useCommitChecks, usePostStatus } from "@/api/hooks/use-github";
import Button from "@/components/_ui/button";
import Field from "@/components/_ui/field";
import { Input } from "@/components/_ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import Tag from "@/components/_ui/tag";
import GithubError from "@/features/github/components/github-error";

type Tone = "green" | "red" | "amber" | "neutral" | "blue";

export function outcomeTone(value: string | null | undefined): Tone {
  switch (value) {
    case "success":
      return "green";
    case "failure":
    case "error":
    case "timed_out":
    case "startup_failure":
    case "action_required":
      return "red";
    case "cancelled":
    case "skipped":
    case "neutral":
    case "stale":
      return "neutral";
    case "pending":
    case "queued":
    case "in_progress":
    case "waiting":
    case "requested":
      return "amber";
    default:
      return "blue";
  }
}

export function outcomeLabel(value: string | null | undefined) {
  if (!value) return "Unknown";
  const text = value.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const STATES: StatusInput["state"][] = [
  "success",
  "pending",
  "failure",
  "error",
];

function StatusForm({
  repositoryId,
  sha,
}: {
  repositoryId: string;
  sha: string;
}) {
  const post = usePostStatus(repositoryId, sha);
  const [state, setState] = useState<StatusInput["state"]>("success");
  const [context, setContext] = useState("issuenest/review");
  const [description, setDescription] = useState("");
  const [targetUrl, setTargetUrl] = useState("");

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        post.mutate({
          state,
          context: context.trim(),
          description: description.trim() || undefined,
          targetUrl: targetUrl.trim() || undefined,
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[10em_minmax(0,1fr)]">
        <Field label="State" htmlFor={`status-state-${sha}`}>
          <Select
            value={state}
            onValueChange={(value) => setState(value as StatusInput["state"])}
          >
            <SelectTrigger id={`status-state-${sha}`} aria-label="State">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATES.map((item) => (
                <SelectItem key={item} value={item}>
                  {outcomeLabel(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Context" htmlFor={`status-context-${sha}`} required>
          <Input
            id={`status-context-${sha}`}
            value={context}
            onChange={(event) => setContext(event.target.value)}
            className="font-mono text-[13px]"
          />
        </Field>
      </div>
      <Field
        label="Description"
        htmlFor={`status-description-${sha}`}
        hint="Up to 140 characters."
      >
        <Input
          id={`status-description-${sha}`}
          value={description}
          maxLength={140}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Reviewed in IssueNest"
        />
      </Field>
      <Field label="Details link" htmlFor={`status-url-${sha}`}>
        <Input
          id={`status-url-${sha}`}
          type="url"
          value={targetUrl}
          onChange={(event) => setTargetUrl(event.target.value)}
          placeholder="https://"
        />
      </Field>
      <div className="flex items-center justify-end gap-2">
        {post.isSuccess && (
          <span className="caption-style text-subtle" aria-live="polite">
            Status posted
          </span>
        )}
        <Button
          variant="secondary"
          size="md"
          type="submit"
          disabled={post.isPending || context.trim().length === 0}
        >
          {post.isPending ? "Posting…" : "Post status"}
        </Button>
      </div>
      <GithubError error={post.error} />
    </form>
  );
}

export default function CommitChecks({
  repositoryId,
  sha,
}: {
  repositoryId: string;
  sha: string;
}) {
  const checks = useCommitChecks(repositoryId, sha);
  const [composing, setComposing] = useState(false);
  const runs = checks.data?.checkRuns ?? [];
  const statuses = checks.data?.statuses ?? [];

  return (
    <div className="flex flex-col gap-3">
      {checks.isPending && <p className="text-subtle">Loading checks…</p>}
      {checks.isError && (
        <GithubError error={checks.error} fallback="Could not load checks." />
      )}
      {checks.data && runs.length === 0 && statuses.length === 0 && (
        <p className="text-subtle">
          No checks or statuses have reported on this commit.
        </p>
      )}
      {(runs.length > 0 || statuses.length > 0) && (
        <ul className="border-line-strong flex flex-col rounded-lg border">
          {runs.map((run) => (
            <li
              key={`run-${run.id}`}
              className="border-line-strong flex items-center justify-between gap-3 border-b px-3 py-2 last:border-b-0"
            >
              <span className="min-w-0 truncate">
                {run.htmlUrl ? (
                  <a
                    href={run.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {run.name}
                  </a>
                ) : (
                  run.name
                )}
              </span>
              <Tag tone={outcomeTone(run.conclusion ?? run.status)} size="sm">
                {outcomeLabel(run.conclusion ?? run.status)}
              </Tag>
            </li>
          ))}
          {statuses.map((status) => (
            <li
              key={`status-${status.id}`}
              className="border-line-strong flex items-center justify-between gap-3 border-b px-3 py-2 last:border-b-0"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-mono text-[13px]">
                  {status.context}
                </span>
                {status.description && (
                  <span className="caption-style text-subtle truncate">
                    {status.description}
                  </span>
                )}
              </span>
              <Tag tone={outcomeTone(status.state)} size="sm">
                {outcomeLabel(status.state)}
              </Tag>
            </li>
          ))}
        </ul>
      )}
      {composing ? (
        <div className="border-line-strong flex flex-col gap-3 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Post a commit status</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setComposing(false)}
            >
              Close
            </Button>
          </div>
          <StatusForm repositoryId={repositoryId} sha={sha} />
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => setComposing(true)}
        >
          Post a status
        </Button>
      )}
    </div>
  );
}
