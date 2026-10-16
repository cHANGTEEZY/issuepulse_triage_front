import { useMemo } from "react";
import type { IssueRecord } from "@/api/issues";
import DataTable from "@/components/_ui/data-table/data-table";
import { createDataTableColumnHelper } from "@/components/_ui/data-table/table-features";
import IssueRow from "./issue-row";
import {
  TABLE_COLUMNS,
  TABLE_GRID_CLASS,
  TABLE_ROW_CLASS,
} from "./table-columns";

const columnHelper = createDataTableColumnHelper<IssueRecord>();

export default function IssueTable({ rows }: { rows: IssueRecord[] }) {
  const columns = useMemo(
    () =>
      TABLE_COLUMNS.map((column) =>
        columnHelper.display({
          id: column.key,
          header: column.label,
          meta: column.meta,
        }),
      ),
    [],
  );

  return (
    <DataTable
      tableId="issues"
      columns={columns}
      data={rows}
      getRowId={(issue) => issue.id}
      tableClassName={TABLE_GRID_CLASS}
      rowClassName={TABLE_ROW_CLASS}
      countLabel="Issues in view"
      empty="No issues match these filters. Connect a repository and sync it to pull issues in."
      renderRow={(row) => <IssueRow key={row.id} issue={row.original} />}
    />
  );
}
