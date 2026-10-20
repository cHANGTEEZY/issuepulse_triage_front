import { useState } from "react";
import {
  useCommitFile,
  useCreateBranch,
  useRepositoryBranches,
  useRepositoryFile,
} from "@/api/hooks/use-github";
import Button, { buttonVariants } from "@/components/_ui/button";
import { Input } from "@/components/_ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import Field from "@/components/_ui/field";
import SegmentedControl from "@/components/arc/segmented-control/segmented-control";
import GithubError from "@/features/github/components/github-error";
import MarkdownBody from "@/features/issues/components/markdown-body";
import SourceView from "./source-view";
import { useUiStore } from "@/features/app/stores/ui-store";

type FileViewProps = {
  repositoryId: string;
  defaultBranch: string;
  path: string;
  folder: string;
  branch: string | undefined;
  isNew: boolean;
  onRefChange: (ref: string) => void;
  onClose: () => void;
  onOpened: (path: string, ref: string) => void;
  onComposePull: (head: string, base: string) => void;
  onNewFile: () => void;
};

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export default function FileView({
  repositoryId,
  defaultBranch,
  path,
  folder,
  branch: selected,
  isNew,
  onRefChange,
  onClose,
  onOpened,
  onComposePull,
  onNewFile,
}: FileViewProps) {
  const branch = selected ?? defaultBranch;
  const branches = useRepositoryBranches(repositoryId);
  const file = useRepositoryFile(repositoryId, isNew ? "" : path, branch);
  const createBranch = useCreateBranch(repositoryId);
  const commit = useCommitFile(repositoryId);
  const showToast = useUiStore((state) => state.showToast);

  const [editing, setEditing] = useState(isNew);
  const [draft, setDraft] = useState<string | null>(null);
  const [newPath, setNewPath] = useState(folder ? `${folder}/` : "");
  const [messageDraft, setMessage] = useState<string | null>(null);
  const [target, setTarget] = useState<"current" | "branch">("current");
  const [branchDraft, setBranchName] = useState<string | null>(null);
  const [committed, setCommitted] = useState<{
    branch: string;
    base: string;
  } | null>(null);

  const name = isNew
    ? newPath.split("/").pop() || "new file"
    : (file.data?.name ?? path.split("/").pop() ?? path);
  const original = isNew ? "" : (file.data?.content ?? "");
  const content = draft ?? original;
  const message = messageDraft ?? (isNew ? `Create ${name}` : `Update ${name}`);
  const branchName = branchDraft ?? `issuenest/${slug(name) || "patch"}`;

  const selectedBranch = branches.data?.find((item) => item.name === branch);
  const busy = createBranch.isPending || commit.isPending;
  const dirty = isNew
    ? content.length > 0 || newPath.trim() !== `${folder}/`
    : content !== original;
  const filePath = isNew ? newPath.trim().replace(/^\/+/, "") : path;
  const isMarkdown = /\.mdx?$/i.test(filePath);
  const canCommit =
    dirty &&
    message.trim().length > 0 &&
    filePath.length > 0 &&
    !filePath.endsWith("/") &&
    !busy;
  const editable =
    isNew || (file.data != null && !file.data.binary && !file.data.tooLarge);

  async function submit() {
    const destination = target === "branch" ? branchName.trim() : branch;
    if (target === "branch") {
      await createBranch.mutateAsync({ name: destination, from: branch });
    }
    const result = await commit.mutateAsync({
      path: filePath,
      content,
      message: message.trim(),
      branch: destination,
      sha: isNew ? undefined : file.data?.sha,
    });
    showToast({
      title: "Committed to GitHub",
      description: `${result.commitSha.slice(0, 7)} on ${destination}`,
    });
    setEditing(false);
    setDraft(null);
    setCommitted(
      target === "branch" ? { branch: destination, base: branch } : null,
    );
    if (isNew || target === "branch") onOpened(filePath, destination);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            ← {folder || "root"}
          </Button>
          {isNew ? (
            <Input
              value={newPath}
              onChange={(event) => setNewPath(event.target.value)}
              aria-label="New file path"
              placeholder="docs/notes.md"
              className="h-8 w-[22em] max-w-full font-mono text-[13px]"
            />
          ) : (
            <span className="truncate font-mono text-[13px] font-medium">
              {path}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={branch}
            onValueChange={onRefChange}
            disabled={busy || editing}
          >
            <SelectTrigger aria-label="Branch" className="h-8 w-[14em]">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              {(
                branches.data ?? [
                  { name: branch, sha: "", protected: false, isDefault: true },
                ]
              ).map((item) => (
                <SelectItem key={item.name} value={item.name}>
                  {item.name}
                  {item.isDefault ? " · default" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isNew && file.data?.htmlUrl && (
            <a
              href={file.data.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              GitHub
            </a>
          )}
          {!editing && editable && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setCommitted(null);
                setEditing(true);
              }}
            >
              Edit
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onNewFile}>
            New file
          </Button>
        </div>
      </div>

      {!isNew && file.isPending && <p className="text-subtle">Loading file…</p>}
      {!isNew && file.isError && (
        <GithubError error={file.error} fallback="Could not load this file." />
      )}
      {!isNew && file.data?.binary && (
        <p className="text-subtle">
          This is a binary file. Open it on GitHub to view it.
        </p>
      )}
      {!isNew && file.data?.tooLarge && (
        <p className="text-subtle">
          This file is over 1 MB, so it can only be viewed on GitHub.
        </p>
      )}

      {editable && (isNew || file.data) && (
        <div className="border-line-strong overflow-hidden rounded-xl border">
          {editing ? (
            <SourceView
              code={content}
              filename={filePath || name}
              onChange={setDraft}
            />
          ) : isMarkdown ? (
            <div className="px-6 py-5">
              <MarkdownBody source={content} empty="This file is empty." />
            </div>
          ) : (
            <SourceView code={content} filename={name} readOnly />
          )}
        </div>
      )}

      {editing && (
        <form
          className="border-line-strong flex flex-col gap-4 rounded-xl border p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (canCommit) void submit().catch(() => undefined);
          }}
        >
          <span className="font-medium">Commit changes</span>
          <Field label="Commit message" htmlFor="commit-message" required>
            <Input
              id="commit-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={isNew ? `Create ${name}` : `Update ${name}`}
            />
          </Field>
          <SegmentedControl
            label="Where to commit"
            value={target}
            onValueChange={(value) => setTarget(value as "current" | "branch")}
            options={[
              { value: "current", label: `Commit to ${branch}` },
              { value: "branch", label: "New branch" },
            ]}
          />
          {target === "current" && selectedBranch?.protected && (
            <p className="caption-style text-subtle">
              {branch} is protected. GitHub may reject a direct commit, so a new
              branch is safer.
            </p>
          )}
          {target === "branch" && (
            <Field
              label="Branch name"
              htmlFor="commit-branch"
              hint={`Starts from ${branch}.`}
            >
              <Input
                id="commit-branch"
                value={branchName}
                onChange={(event) => setBranchName(event.target.value)}
                className="font-mono text-[13px]"
              />
            </Field>
          )}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="md"
              disabled={busy}
              onClick={() => {
                if (isNew) onClose();
                setEditing(false);
                setDraft(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={!canCommit}
            >
              {createBranch.isPending
                ? "Creating branch…"
                : commit.isPending
                  ? "Committing…"
                  : "Commit"}
            </Button>
          </div>
          <GithubError error={createBranch.error ?? commit.error} />
        </form>
      )}

      {committed && (
        <div className="border-line-strong bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
          <span className="text-soft">
            Your change is on{" "}
            <span className="font-mono text-[13px]">{committed.branch}</span>.
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onComposePull(committed.branch, committed.base)}
          >
            Open pull request
          </Button>
        </div>
      )}
    </div>
  );
}
