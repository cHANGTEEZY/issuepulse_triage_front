import type { IssueRecord } from "@/api/issues";
import Tag from "@/components/_ui/tag";
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  isStaleIssue,
  priorityTone,
  statusTone,
} from "@/features/issues/lib/triage";

export default function IssueBadges({ issue }: { issue: IssueRecord }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Tag tone={statusTone(issue.triage.status)} size="sm">
        {STATUS_LABEL[issue.triage.status]}
      </Tag>
      <Tag tone={priorityTone(issue.triage.priority)} size="sm">
        {PRIORITY_LABEL[issue.triage.priority]}
      </Tag>
      {issue.isPullRequest && (
        <Tag tone="purple" size="sm">
          Pull request
        </Tag>
      )}
      {isStaleIssue(
        issue.githubUpdatedAt,
        issue.state,
        issue.triage.status,
      ) && (
        <Tag tone="amber" size="sm">
          Stale
        </Tag>
      )}
      {issue.labels.map((label) => (
        <Tag key={label.name} tone="neutral" size="sm">
          <span
            aria-hidden
            className="mr-1 size-1.5 rounded-full"
            style={{ backgroundColor: `#${label.color}` }}
          />
          {label.name}
        </Tag>
      ))}
    </div>
  );
}
