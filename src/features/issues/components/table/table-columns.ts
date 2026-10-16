import type { DataTableColumnMeta } from "@/components/_ui/data-table/table-features";

type IssueColumn = {
  key: "issue" | "repository" | "triage" | "updated";
  label: string;
  meta: DataTableColumnMeta;
};

export const TABLE_COLUMNS: readonly IssueColumn[] = [
  {
    key: "issue",
    label: "Issue",
    meta: { className: "justify-start", width: 400, minWidth: 280, maxWidth: 640 },
  },
  {
    key: "repository",
    label: "Repository",
    meta: { className: "justify-start", width: 200, minWidth: 140, maxWidth: 280 },
  },
  {
    key: "triage",
    label: "Triage",
    meta: { className: "justify-start", width: 320, minWidth: 200, maxWidth: 480 },
  },
  {
    key: "updated",
    label: "Updated",
    meta: { className: "justify-start", width: 128, minWidth: 96, maxWidth: 160 },
  },
];

export type TableColumnKey = IssueColumn["key"];

export const TABLE_GRID_CLASS = "grid w-max min-w-full justify-between";

export const TABLE_ROW_CLASS = "col-span-full grid grid-cols-subgrid";

export const TABLE_CELL_CLASS = "flex min-w-0 items-center overflow-hidden";

export function columnClass(key: TableColumnKey) {
  return TABLE_COLUMNS.find((column) => column.key === key)?.meta.className ?? "";
}
