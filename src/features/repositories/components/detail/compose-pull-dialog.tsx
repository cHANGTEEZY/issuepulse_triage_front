import { useState } from "react";
import { useCreatePull, useRepositoryBranches } from "@/api/hooks/use-github";
import Button from "@/components/_ui/button";
import { Checkbox } from "@/components/_ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/_ui/dialog";
import Field from "@/components/_ui/field";
import { Input } from "@/components/_ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import { Textarea } from "@/components/_ui/textarea";
import { useUiStore } from "@/features/app/stores/ui-store";
import GithubError from "@/features/github/components/github-error";

type ComposePullDialogProps = {
  repositoryId: string;
  defaultBranch: string;
  open: boolean;
  head?: string;
  base?: string;
  onOpenChange: (open: boolean) => void;
  onCreated: (number: number) => void;
};

function BranchSelect({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger id={id} className="font-mono text-[13px]">
        <SelectValue placeholder="Choose a branch" />
      </SelectTrigger>
      <SelectContent>
        {options.map((name) => (
          <SelectItem key={name} value={name}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function ComposePullDialog({
  open,
  onOpenChange,
  ...props
}: ComposePullDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[36em]">
        <ComposeForm {...props} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

function ComposeForm({
  repositoryId,
  defaultBranch,
  head: initialHead,
  base: initialBase,
  onOpenChange,
  onCreated,
}: Omit<ComposePullDialogProps, "open">) {
  const branches = useRepositoryBranches(repositoryId);
  const create = useCreatePull(repositoryId);
  const showToast = useUiStore((state) => state.showToast);
  const [head, setHead] = useState(initialHead ?? "");
  const [base, setBase] = useState(initialBase ?? defaultBranch);
  const [title, setTitle] = useState(
    initialHead ? initialHead.replace(/^.*\//, "").replace(/-/g, " ") : "",
  );
  const [body, setBody] = useState("");
  const [draft, setDraft] = useState(false);

  const names = (branches.data ?? []).map((branch) => branch.name);
  const same = head.length > 0 && head === base;
  const ready =
    title.trim().length > 0 && head && base && !same && !create.isPending;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!ready) return;
        create.mutate(
          { title: title.trim(), body: body || undefined, head, base, draft },
          {
            onSuccess: (pull) => {
              showToast({
                title: `Opened #${pull.number}`,
                description: pull.title,
              });
              onCreated(pull.number);
            },
          },
        );
      }}
    >
      <DialogHeader>
        <DialogTitle>New pull request</DialogTitle>
        <DialogDescription>Opens on GitHub under your name.</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Merge from" htmlFor="pull-head" required>
            <BranchSelect
              id="pull-head"
              value={head}
              options={names}
              onChange={setHead}
            />
          </Field>
          <Field label="Into" htmlFor="pull-base" required>
            <BranchSelect
              id="pull-base"
              value={base}
              options={names}
              onChange={setBase}
            />
          </Field>
        </div>
        {same && (
          <p className="caption-style text-danger">
            Choose two different branches.
          </p>
        )}
        <Field label="Title" htmlFor="pull-title" required>
          <Input
            id="pull-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
        <Field label="Description" htmlFor="pull-body">
          <Textarea
            id="pull-body"
            rows={6}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="What changed and why. Markdown works here."
          />
        </Field>
        <label
          htmlFor="pull-draft"
          className="flex w-fit cursor-pointer items-center gap-2"
        >
          <Checkbox
            id="pull-draft"
            checked={draft}
            onCheckedChange={(value) => setDraft(value === true)}
          />
          <span>Open as a draft</span>
        </label>
        <GithubError error={create.error ?? branches.error} />
      </div>
      <DialogFooter>
        <Button variant="ghost" size="md" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="primary" size="md" type="submit" disabled={!ready}>
          {create.isPending ? "Opening…" : "Open pull request"}
        </Button>
      </DialogFooter>
    </form>
  );
}
