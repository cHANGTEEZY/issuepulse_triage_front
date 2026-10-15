import type { TriagePriority, TriageStatus } from "@/api/issues";
import type { tagVariants } from "@/components/_ui/tag";
import type { VariantProps } from "class-variance-authority";

type TagTone = NonNullable<VariantProps<typeof tagVariants>["tone"]>;

export const STATUS_LABEL: Record<TriageStatus, string> = {
  inbox: "Inbox",
  investigating: "Investigating",
  planned: "Planned",
  blocked: "Blocked",
  done: "Done",
};

export const PRIORITY_LABEL: Record<TriagePriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const STATUS_TONE: Record<TriageStatus, TagTone> = {
  inbox: "neutral",
  investigating: "purple",
  planned: "teal",
  blocked: "amber",
  done: "green",
};

const PRIORITY_TONE: Record<TriagePriority, TagTone> = {
  critical: "red",
  high: "orange",
  medium: "yellow",
  low: "blue",
};

export function statusTone(status: TriageStatus) {
  return STATUS_TONE[status];
}

export function priorityTone(priority: TriagePriority) {
  return PRIORITY_TONE[priority];
}

const STALE_MS = 14 * 24 * 60 * 60 * 1000;

export function isStaleIssue(updatedAt: string, state: string, status: TriageStatus) {
  return (
    state === "open" &&
    status !== "done" &&
    Date.now() - new Date(updatedAt).getTime() > STALE_MS
  );
}

export function formatWhen(iso: string | null) {
  if (!iso) return "Never";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
