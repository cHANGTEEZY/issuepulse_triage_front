import type { IssueRecord } from "@/api/issues";
import type { OverflowItem } from "@/components/_common/overflow-row";
import Tag from "@/components/_ui/tag";
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  isStaleIssue,
  priorityTone,
  statusTone,
} from "@/features/issues/lib/triage";

export function issueBadgeItems(issue: IssueRecord): OverflowItem[] {
  const items: OverflowItem[] = [
    {
      key: "status",
      label: STATUS_LABEL[issue.triage.status],
      node: (
        <Tag tone={statusTone(issue.triage.status)} size="sm">
          {STATUS_LABEL[issue.triage.status]}
        </Tag>
      ),
    },
    {
      key: "priority",
      label: PRIORITY_LABEL[issue.triage.priority],
      node: (
        <Tag tone={priorityTone(issue.triage.priority)} size="sm">
          {PRIORITY_LABEL[issue.triage.priority]}
        </Tag>
      ),
    },
  ];

  if (issue.isPullRequest) {
    items.push({
      key: "pull-request",
      label: "Pull request",
      node: (
        <Tag tone="purple" size="sm">
          Pull request
        </Tag>
      ),
    });
  }

  if (isStaleIssue(issue.githubUpdatedAt, issue.state, issue.triage.status)) {
    items.push({
      key: "stale",
      label: "Stale",
      node: (
        <Tag tone="amber" size="sm">
          Stale
        </Tag>
      ),
    });
  }

  for (const label of issue.labels) {
    items.push({
      key: `label-${label.name}`,
      label: label.name,
      node: (
        <Tag tone="neutral" size="sm">
          <span
            aria-hidden
            className="mr-1 size-1.5 rounded-full"
            style={{ backgroundColor: `#${label.color}` }}
          />
          {label.name}
        </Tag>
      ),
    });
  }

  return items;
}

export default function IssueBadges({ issue }: { issue: IssueRecord }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {issueBadgeItems(issue).map((item) => (
        <span key={item.key} className="flex items-center">
          {item.node}
        </span>
      ))}
    </div>
  );
}
