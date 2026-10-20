import { useState, type ReactNode } from "react";
import type { MergeMethod, ReviewEvent } from "@/api/github";
import {
  useMergePull,
  usePullRequest,
  useReviewPull,
  useUpdatePull,
} from "@/api/hooks/use-github";
import Avatar from "@/components/_ui/avatar";
import Button, { buttonVariants } from "@/components/_ui/button";
import { Input } from "@/components/_ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import Tag from "@/components/_ui/tag";
import { Textarea } from "@/components/_ui/textarea";
import HoldToConfirm from "@/components/arc/hold-to-confirm/hold-to-confirm";
import SegmentedControl from "@/components/arc/segmented-control/segmented-control";
import { useUiStore } from "@/features/app/stores/ui-store";
import GithubError from "@/features/github/components/github-error";
import MarkdownBody from "@/features/issues/components/markdown-body";
import { formatWhen } from "@/features/issues/lib/triage";
import CommitChecks from "./commit-checks";
import { pullState } from "./pulls-section";

const REVIEW_LABEL: Record<string, string> = {
  APPROVED: "Approved",
  CHANGES_REQUESTED: "Requested changes",
  COMMENTED: "Commented",
  DISMISSED: "Dismissed",
  PENDING: "Pending",
};

const REVIEW_TONE: Record<string, "green" | "red" | "neutral" | "amber"> = {
  APPROVED: "green",
  CHANGES_REQUESTED: "red",
  COMMENTED: "neutral",
  DISMISSED: "neutral",
  PENDING: "amber",
};

const MERGE_LABEL: Record<MergeMethod, string> = {
  merge: "Create a merge commit",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-line-strong flex flex-col gap-3 rounded-xl border p-4">
      <h2 className="font-medium">{title}</h2>
      {children}
    </section>
  );
}

type PullDetailProps = {
  repositoryId: string;
  number: number;
  onBack: () => void;
};

export default function PullDetail({
  repositoryId,
  number,
  onBack,
}: PullDetailProps) {
  const pull = usePullRequest(repositoryId, number);
  const update = useUpdatePull(repositoryId, number);
  const review = useReviewPull(repositoryId, number);
  const merge = useMergePull(repositoryId, number);
  const showToast = useUiStore((state) => state.showToast);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [event, setEvent] = useState<ReviewEvent>("COMMENT");
  const [reviewBody, setReviewBody] = useState("");
  const [method, setMethod] = useState<MergeMethod>("squash");

  const back = (
    <Button variant="ghost" size="sm" className="w-fit" onClick={onBack}>
      ← All pull requests
    </Button>
  );

  if (pull.isPending) {
    return (
      <div className="flex flex-col gap-3">
        {back}
        <p className="text-subtle">Loading pull request…</p>
      </div>
    );
  }
  if (pull.isError || !pull.data) {
    return (
      <div className="flex flex-col gap-3">
        {back}
        <GithubError
          error={pull.error}
          fallback="Could not load this pull request."
        />
      </div>
    );
  }

  const data = pull.data;
  const state = pullState(data);
  const open = data.state === "open" && !data.merged;
  const reviewReady = event === "APPROVE" || reviewBody.trim().length > 0;
  const blocked = data.draft
    ? "Drafts can't be merged. Mark it ready on GitHub first."
    : data.mergeable === false
      ? "This branch has conflicts that must be resolved on GitHub."
      : null;

  return (
    <div className="flex flex-col gap-5">
      {back}

      <header className="flex flex-col gap-3">
        {editing ? (
          <form
            className="flex flex-col gap-3"
            onSubmit={(formEvent) => {
              formEvent.preventDefault();
              update.mutate(
                { title: title.trim(), body },
                { onSuccess: () => setEditing(false) },
              );
            }}
          >
            <Input
              value={title}
              onChange={(change) => setTitle(change.target.value)}
              aria-label="Title"
            />
            <Textarea
              value={body}
              onChange={(change) => setBody(change.target.value)}
              rows={8}
              aria-label="Description"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={update.isPending || title.trim().length === 0}
              >
                {update.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="h2-style min-w-0 break-words">
              {data.title} <span className="text-subtle">#{data.number}</span>
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTitle(data.title);
                  setBody(data.body);
                  setEditing(true);
                }}
              >
                Edit
              </Button>
              <a
                href={data.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                GitHub
              </a>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone={state.tone} size="sm">
            {state.label}
          </Tag>
          <span className="caption-style text-subtle flex items-center gap-1.5">
            {data.author.avatarUrl && (
              <Avatar src={data.author.avatarUrl} alt="" />
            )}
            {data.author.login} wants to merge{" "}
            <code className="bg-muted rounded px-1 font-mono text-[12px]">
              {data.headRef}
            </code>{" "}
            into{" "}
            <code className="bg-muted rounded px-1 font-mono text-[12px]">
              {data.baseRef}
            </code>
          </span>
        </div>
        <span className="caption-style text-subtle tabular-nums">
          {data.commits} commits · {data.changedFiles} files ·{" "}
          <span className="text-(--tag-green-text)">+{data.additions}</span>{" "}
          <span className="text-(--tag-red-text)">−{data.deletions}</span> ·
          updated {formatWhen(data.updatedAt)}
        </span>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22em]">
        <div className="flex min-w-0 flex-col gap-5">
          {!editing &&
            (data.body ? (
              <MarkdownBody source={data.body} />
            ) : (
              <p className="text-subtle">No description provided.</p>
            ))}

          <Panel title={`Reviews · ${data.reviews.length}`}>
            {data.reviews.length === 0 && (
              <p className="text-subtle">No reviews yet.</p>
            )}
            {data.reviews.length > 0 && (
              <ol className="flex flex-col gap-3">
                {data.reviews.map((item) => (
                  <li key={item.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        {item.author.avatarUrl && (
                          <Avatar src={item.author.avatarUrl} alt="" />
                        )}
                        <span className="truncate font-medium">
                          {item.author.login}
                        </span>
                        <span className="caption-style text-subtle">
                          {formatWhen(item.submittedAt)}
                        </span>
                      </span>
                      <Tag
                        tone={REVIEW_TONE[item.state] ?? "neutral"}
                        size="sm"
                      >
                        {REVIEW_LABEL[item.state] ?? item.state}
                      </Tag>
                    </div>
                    {item.body && (
                      <div className="pl-7">
                        <MarkdownBody source={item.body} />
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}

            {open && (
              <form
                className="border-line-strong flex flex-col gap-3 border-t pt-3"
                onSubmit={(formEvent) => {
                  formEvent.preventDefault();
                  if (!reviewReady) return;
                  review.mutate(
                    { event, body: reviewBody.trim() },
                    {
                      onSuccess: () => {
                        setReviewBody("");
                        showToast({
                          title: "Review submitted",
                          description: `#${data.number}`,
                        });
                      },
                    },
                  );
                }}
              >
                <SegmentedControl
                  label="Review type"
                  value={event}
                  onValueChange={(value) => setEvent(value as ReviewEvent)}
                  options={[
                    { value: "COMMENT", label: "Comment" },
                    { value: "APPROVE", label: "Approve" },
                    { value: "REQUEST_CHANGES", label: "Request changes" },
                  ]}
                />
                <Textarea
                  value={reviewBody}
                  onChange={(change) => setReviewBody(change.target.value)}
                  rows={4}
                  aria-label="Review comment"
                  placeholder={
                    event === "APPROVE"
                      ? "Optional note"
                      : "What should change, or what you noticed"
                  }
                />
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    disabled={!reviewReady || review.isPending}
                  >
                    {review.isPending ? "Submitting…" : "Submit review"}
                  </Button>
                </div>
                <GithubError error={review.error} />
              </form>
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-5">
          <Panel title="Checks">
            <CommitChecks repositoryId={repositoryId} sha={data.headSha} />
          </Panel>

          {open && (
            <Panel title="Merge">
              <Select
                value={method}
                onValueChange={(value) => setMethod(value as MergeMethod)}
              >
                <SelectTrigger aria-label="Merge method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(MERGE_LABEL) as MergeMethod[]).map((item) => (
                    <SelectItem key={item} value={item}>
                      {MERGE_LABEL[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {blocked ? (
                <p className="caption-style text-subtle">{blocked}</p>
              ) : (
                <HoldToConfirm
                  label={merge.isPending ? "Merging…" : "Hold to merge"}
                  confirmedLabel="Merged"
                  tone="accent"
                  disabled={merge.isPending}
                  onConfirm={() =>
                    merge.mutate(method, {
                      onSuccess: () =>
                        showToast({
                          title: `Merged #${data.number}`,
                          description: data.title,
                        }),
                    })
                  }
                />
              )}
              <GithubError error={merge.error} />
            </Panel>
          )}

          <Panel title="State">
            {data.merged ? (
              <p className="text-subtle">This pull request was merged.</p>
            ) : (
              <Button
                variant="secondary"
                size="md"
                className="w-fit"
                disabled={update.isPending}
                onClick={() =>
                  update.mutate({ state: open ? "closed" : "open" })
                }
              >
                {open ? "Close pull request" : "Reopen pull request"}
              </Button>
            )}
            <GithubError error={update.error} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
