import { useState } from "react";
import type { IssueRecord } from "@/api/issues";
import { useCommentOnIssue, useIssueThread } from "@/api/hooks/use-github";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import { Textarea } from "@/components/_ui/textarea";
import GithubError from "@/features/github/components/github-error";
import MarkdownBody from "@/features/issues/components/markdown-body";
import { formatWhen } from "@/features/issues/lib/triage";

export default function IssueComments({ issue }: { issue: IssueRecord }) {
  const thread = useIssueThread(issue.id);
  const comment = useCommentOnIssue(issue.id);
  const [draft, setDraft] = useState("");

  const comments = thread.data?.comments ?? [];

  return (
    <section aria-labelledby="comments-heading" className="flex flex-col gap-4">
      <h2 id="comments-heading" className="h3-style">
        Comments{thread.data ? ` · ${comments.length}` : ""}
      </h2>

      {thread.isPending && <p className="text-subtle">Loading comments…</p>}
      {thread.isError && (
        <GithubError error={thread.error} fallback="Could not load comments." />
      )}
      {thread.data && comments.length === 0 && (
        <p className="text-subtle">
          No comments yet. Start the conversation below.
        </p>
      )}

      {comments.length > 0 && (
        <ol className="flex flex-col gap-3">
          {comments.map((item) => (
            <li
              key={item.id}
              className="border-line-strong flex flex-col rounded-xl border"
            >
              <div className="border-line-strong bg-card/50 flex items-center justify-between gap-3 rounded-t-xl border-b px-3 py-2">
                <span className="flex min-w-0 items-center gap-2">
                  {item.author.avatarUrl && (
                    <Avatar src={item.author.avatarUrl} alt="" />
                  )}
                  <span className="truncate font-medium">
                    {item.author.login}
                  </span>
                </span>
                <a
                  href={item.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="caption-style text-subtle shrink-0 hover:underline"
                >
                  {formatWhen(item.createdAt)}
                </a>
              </div>
              <div className="px-3 py-3">
                <MarkdownBody source={item.body} />
              </div>
            </li>
          ))}
        </ol>
      )}

      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          comment.mutate(draft, { onSuccess: () => setDraft("") });
        }}
      >
        <label htmlFor="new-comment" className="caption-style text-subtle">
          Add a comment
        </label>
        <Textarea
          id="new-comment"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.currentTarget.form?.requestSubmit();
            }
          }}
          rows={4}
          placeholder="Markdown works here. It posts to GitHub under your name."
        />
        <div className="flex items-center justify-between gap-3">
          <span className="caption-style text-subtle">⌘ Enter to post</span>
          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={!draft.trim() || comment.isPending}
          >
            {comment.isPending ? "Posting…" : "Comment"}
          </Button>
        </div>
        <GithubError error={comment.error} />
      </form>
    </section>
  );
}
