import type { IssueRecord, TriagePriority, TriageStatus } from "@/api/issues";
import type { RepositoryRecord } from "@/api/repositories";
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  isStaleIssue,
} from "@/features/issues/lib/triage";

export const RANGES = [
  { value: "7", label: "7 days", days: 7 },
  { value: "30", label: "30 days", days: 30 },
  { value: "90", label: "90 days", days: 90 },
] as const;

export type RangeValue = (typeof RANGES)[number]["value"];

const DAY_MS = 24 * 60 * 60 * 1000;

const STATUS_COLORS: Record<TriageStatus, string> = {
  inbox: "var(--tag-neutral-text)",
  investigating: "var(--tag-blue-text)",
  planned: "var(--tag-purple-text)",
  blocked: "var(--tag-red-text)",
  done: "var(--tag-green-text)",
};

const PRIORITY_COLORS: Record<TriagePriority, string> = {
  critical: "var(--tag-red-text)",
  high: "var(--tag-orange-text)",
  medium: "var(--tag-yellow-text)",
  low: "var(--tag-blue-text)",
};

const dayKey = (date: Date) => date.toISOString().slice(0, 10);

const longDay = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const shortDay = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

const periodDay = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function rangeDays(range: RangeValue) {
  return RANGES.find((option) => option.value === range)?.days ?? 30;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

function buckets(days: number, now = new Date()) {
  const end = startOfDay(now);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end.getTime() - (days - 1 - index) * DAY_MS);
    return { key: dayKey(date), date };
  });
}

function axisStep(days: number) {
  if (days <= 7) return 1;
  if (days <= 30) return 5;
  return 15;
}

export function periodLabel(days: number, now = new Date()) {
  const end = startOfDay(now);
  const start = new Date(end.getTime() - (days - 1) * DAY_MS);
  return `${shortDay.format(start)} – ${periodDay.format(end)}`;
}

export const HEATMAP_DAYS = 365;

export function activityDays(issues: IssueRecord[], days = HEATMAP_DAYS) {
  const slots = buckets(days);
  const index = new Map(slots.map((slot, position) => [slot.key, position]));
  const counts = new Array<number>(days).fill(0);

  for (const issue of issues) {
    const created = index.get(dayKey(new Date(issue.githubCreatedAt)));
    if (created !== undefined) counts[created] = (counts[created] ?? 0) + 1;
    const updatedKey = dayKey(new Date(issue.githubUpdatedAt));
    const createdKey = dayKey(new Date(issue.githubCreatedAt));
    if (updatedKey === createdKey) continue;
    const updated = index.get(updatedKey);
    if (updated !== undefined) counts[updated] = (counts[updated] ?? 0) + 1;
  }

  return slots.map((slot, position) => ({
    date: slot.key,
    count: counts[position] ?? 0,
  }));
}

export function issueFlow(issues: IssueRecord[], days: number) {
  const slots = buckets(days);
  const index = new Map(slots.map((slot, position) => [slot.key, position]));
  const opened = new Array<number>(days).fill(0);
  const updated = new Array<number>(days).fill(0);
  const step = axisStep(days);

  for (const issue of issues) {
    const created = index.get(dayKey(new Date(issue.githubCreatedAt)));
    if (created !== undefined) opened[created] = (opened[created] ?? 0) + 1;
    const touched = index.get(dayKey(new Date(issue.githubUpdatedAt)));
    if (touched !== undefined) updated[touched] = (updated[touched] ?? 0) + 1;
  }

  return slots.map((slot, position) => ({
    key: slot.key,
    label: longDay.format(slot.date),
    axisLabel:
      position % step === 0 || position === days - 1
        ? shortDay.format(slot.date)
        : undefined,
    values: { opened: opened[position] ?? 0, updated: updated[position] ?? 0 },
    value: updated[position] ?? 0,
  }));
}

export function statusShare(issues: IssueRecord[]) {
  const counts = new Map<TriageStatus, number>();
  for (const issue of issues) {
    counts.set(issue.triage.status, (counts.get(issue.triage.status) ?? 0) + 1);
  }
  return (Object.keys(STATUS_LABEL) as TriageStatus[])
    .map((status) => ({
      key: status,
      label: STATUS_LABEL[status],
      value: counts.get(status) ?? 0,
      color: STATUS_COLORS[status],
    }))
    .filter((entry) => entry.value > 0);
}

export function priorityShare(issues: IssueRecord[]) {
  const counts = new Map<TriagePriority, number>();
  for (const issue of issues) {
    if (issue.state !== "open") continue;
    counts.set(
      issue.triage.priority,
      (counts.get(issue.triage.priority) ?? 0) + 1,
    );
  }
  return (Object.keys(PRIORITY_LABEL) as TriagePriority[])
    .map((priority) => ({
      key: priority,
      label: PRIORITY_LABEL[priority],
      value: counts.get(priority) ?? 0,
      color: PRIORITY_COLORS[priority],
    }))
    .filter((entry) => entry.value > 0);
}

export function repositoryShare(issues: IssueRecord[]) {
  const counts = new Map<string, { label: string; value: number }>();
  for (const issue of issues) {
    if (issue.state !== "open") continue;
    const current = counts.get(issue.repository.id);
    if (current) current.value += 1;
    else {
      counts.set(issue.repository.id, {
        label: `${issue.repository.owner}/${issue.repository.name}`,
        value: 1,
      });
    }
  }
  return Array.from(counts, ([key, entry]) => ({ key, ...entry })).sort(
    (a, b) => b.value - a.value,
  );
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? undefined : `+${current}`;
  const delta = Math.round(((current - previous) / previous) * 100);
  if (delta === 0) return "0%";
  return `${delta > 0 ? "+" : "−"}${Math.abs(delta)}%`;
}

export function headline(
  issues: IssueRecord[],
  repositories: RepositoryRecord[],
  days: number,
) {
  const now = Date.now();
  const rangeStart = now - days * DAY_MS;
  const previousStart = rangeStart - days * DAY_MS;

  const open = issues.filter((issue) => issue.state === "open");
  const openedNow = issues.filter(
    (issue) => new Date(issue.githubCreatedAt).getTime() >= rangeStart,
  ).length;
  const openedBefore = issues.filter((issue) => {
    const time = new Date(issue.githubCreatedAt).getTime();
    return time >= previousStart && time < rangeStart;
  }).length;

  const untriaged = open.filter(
    (issue) => issue.triage.status === "inbox",
  ).length;
  const highPriority = open.filter(
    (issue) =>
      issue.triage.status !== "done" &&
      (issue.triage.priority === "critical" ||
        issue.triage.priority === "high"),
  ).length;
  const stale = issues.filter((issue) =>
    isStaleIssue(issue.githubUpdatedAt, issue.state, issue.triage.status),
  ).length;
  const pulls = open.filter((issue) => issue.isPullRequest).length;
  const privateRepos = repositories.filter(
    (repository) => repository.isPrivate,
  ).length;

  return {
    open: {
      value: open.length,
      context: `${issues.length - open.length} closed overall`,
    },
    opened: {
      value: openedNow,
      context: `opened in the last ${days} days`,
      change: percentChange(openedNow, openedBefore),
    },
    untriaged: {
      value: untriaged,
      context: open.length
        ? `${Math.round((untriaged / open.length) * 100)}% of open issues`
        : "nothing in the inbox",
    },
    highPriority: {
      value: highPriority,
      context: "critical or high, not done",
    },
    stale: {
      value: stale,
      context: "no activity for 14 days",
    },
    pulls: {
      value: pulls,
      context: "open pull requests",
    },
    repositories: {
      value: repositories.length,
      context: `${privateRepos} private · ${repositories.length - privateRepos} public`,
    },
  };
}
