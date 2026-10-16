import type { DataTableColumnMeta } from "@/components/_ui/data-table/table-features";

type RepositoryColumn = {
  key:
    | "repository"
    | "visibility"
    | "language"
    | "openIssues"
    | "pushed"
    | "synced"
    | "action";
  label: string;
  meta: DataTableColumnMeta;
};

export const TABLE_COLUMNS: readonly RepositoryColumn[] = [
  {
    key: "repository",
    label: "Repository",
    meta: { className: "justify-start", width: 320, minWidth: 220, maxWidth: 560 },
  },
  {
    key: "visibility",
    label: "Visibility",
    meta: { className: "justify-start", width: 112, minWidth: 96, maxWidth: 140 },
  },
  {
    key: "language",
    label: "Language",
    meta: { className: "justify-start", width: 128, minWidth: 96, maxWidth: 180 },
  },
  {
    key: "openIssues",
    label: "Open issues",
    meta: {
      className: "justify-end tabular-nums",
      width: 112,
      minWidth: 96,
      maxWidth: 140,
    },
  },
  {
    key: "pushed",
    label: "Last push",
    meta: { className: "justify-start", width: 148, minWidth: 120, maxWidth: 200 },
  },
  {
    key: "synced",
    label: "Last sync",
    meta: { className: "justify-start", width: 148, minWidth: 120, maxWidth: 200 },
  },
  {
    key: "action",
    label: "",
    meta: { className: "justify-end", width: 120, resizable: false },
  },
];

export type TableColumnKey = RepositoryColumn["key"];

export const TABLE_GRID_CLASS = "grid w-max min-w-full justify-between";

export const TABLE_ROW_CLASS = "col-span-full grid grid-cols-subgrid";

export const TABLE_CELL_CLASS = "flex min-w-0 items-center overflow-hidden";

export function columnClass(key: TableColumnKey) {
  return TABLE_COLUMNS.find((column) => column.key === key)?.meta.className ?? "";
}
