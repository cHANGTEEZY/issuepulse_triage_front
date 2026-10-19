import {
  TRIAGE_PRIORITIES,
  TRIAGE_STATUSES,
  type IssueRecord,
} from "@/api/issues";
import {
  dateFilter,
  optionsFilter,
  type DataTableFilter,
  type DataTableSortAccessors,
} from "@/components/_ui/data-table";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/features/issues/lib/triage";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const repositoryName = (issue: IssueRecord) =>
  `${issue.repository.owner}/${issue.repository.name}`;

/** Filters offered by the Add filter menu above the issue table. */
export const ISSUE_FILTERS: DataTableFilter<IssueRecord>[] = [
  optionsFilter({
    id: "status",
    label: "Status",
    getValues: (issue) => issue.triage.status,
    options: TRIAGE_STATUSES.map((status) => ({
      value: status,
      label: STATUS_LABEL[status],
    })),
  }),
  optionsFilter({
    id: "priority",
    label: "Priority",
    getValues: (issue) => issue.triage.priority,
    options: TRIAGE_PRIORITIES.map((priority) => ({
      value: priority,
      label: PRIORITY_LABEL[priority],
    })),
  }),
  optionsFilter({
    id: "repository",
    label: "Repository",
    getValues: repositoryName,
  }),
  optionsFilter({
    id: "owner",
    label: "Owner",
    getValues: (issue) => issue.triage.owner?.name,
    emptyLabel: "Unassigned",
  }),
  optionsFilter({
    id: "label",
    label: "Label",
    getValues: (issue) => issue.labels.map((label) => label.name),
    emptyLabel: "No labels",
  }),
  optionsFilter({
    id: "state",
    label: "State",
    getValues: (issue) => issue.state,
    formatLabel: capitalize,
  }),
  optionsFilter({
    id: "type",
    label: "Type",
    getValues: (issue) => (issue.isPullRequest ? "pull" : "issue"),
    options: [
      { value: "issue", label: "Issue" },
      { value: "pull", label: "Pull request" },
    ],
  }),
  dateFilter({
    id: "updated",
    label: "Updated",
    getValue: (issue) => issue.githubUpdatedAt,
  }),
  dateFilter({
    id: "opened",
    label: "Opened",
    getValue: (issue) => issue.githubCreatedAt,
  }),
];

/** Sort value per column id. Triage sorts by priority, then by status. */
export const ISSUE_SORTING: DataTableSortAccessors<IssueRecord> = {
  issue: (issue) => issue.number,
  repository: repositoryName,
  triage: (issue) =>
    TRIAGE_PRIORITIES.indexOf(issue.triage.priority) * TRIAGE_STATUSES.length +
    TRIAGE_STATUSES.indexOf(issue.triage.status),
  updated: (issue) => new Date(issue.githubUpdatedAt),
};
