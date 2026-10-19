import type { RepositoryRecord } from "@/api/repositories";
import {
  dateFilter,
  optionsFilter,
  rangeFilter,
  type DataTableFilter,
  type DataTableSortAccessors,
} from "@/components/_ui/data-table";

/** Filters offered by the Add filter menu above the repository table. */
export const REPOSITORY_FILTERS: DataTableFilter<RepositoryRecord>[] = [
  optionsFilter({
    id: "visibility",
    label: "Visibility",
    getValues: (repository) => (repository.isPrivate ? "private" : "public"),
    options: [
      { value: "public", label: "Public" },
      { value: "private", label: "Private" },
    ],
  }),
  optionsFilter({
    id: "language",
    label: "Language",
    getValues: (repository) => repository.language,
    emptyLabel: "Unknown",
  }),
  rangeFilter({
    id: "openIssues",
    label: "Open issues",
    getValue: (repository) => repository.openIssues,
    ranges: [
      { value: "none", label: "None", max: 0 },
      { value: "few", label: "1 to 5", min: 1, max: 5 },
      { value: "some", label: "6 to 20", min: 6, max: 20 },
      { value: "many", label: "More than 20", min: 21 },
    ],
  }),
  dateFilter({
    id: "pushed",
    label: "Last push",
    getValue: (repository) => repository.pushedAt,
    emptyLabel: "Never pushed",
  }),
  dateFilter({
    id: "synced",
    label: "Last sync",
    getValue: (repository) => repository.lastSyncedAt,
    emptyLabel: "Never synced",
  }),
];

/** Sort value per column id. */
export const REPOSITORY_SORTING: DataTableSortAccessors<RepositoryRecord> = {
  repository: (repository) => `${repository.owner}/${repository.name}`,
  visibility: (repository) => (repository.isPrivate ? "Private" : "Public"),
  language: (repository) => repository.language,
  openIssues: (repository) => repository.openIssues,
  pushed: (repository) =>
    repository.pushedAt ? new Date(repository.pushedAt) : null,
  synced: (repository) =>
    repository.lastSyncedAt ? new Date(repository.lastSyncedAt) : null,
};
