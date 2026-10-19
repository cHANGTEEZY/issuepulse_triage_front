import { Loupe } from "@lucasmarkes/hairline/react";
import HairlineFigure from "@/components/_common/hairline-figure";
import { useMemo, type ReactNode } from "react";
import type { IssueRecord } from "@/api/issues";
import DataTable from "@/components/_ui/data-table/data-table";
import { createDataTableColumnHelper } from "@/components/_ui/data-table/table-features";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import IssueRow from "./issue-row";
import {
  TABLE_COLUMNS,
  TABLE_GRID_CLASS,
  TABLE_ROW_CLASS,
} from "./table-columns";
import { ISSUE_FILTERS, ISSUE_SORTING } from "./table-config";

const columnHelper = createDataTableColumnHelper<IssueRecord>();

type IssueTableProps = {
  rows: IssueRecord[];
  empty?: ReactNode;
};

export default function IssueTable({ rows, empty }: IssueTableProps) {
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
      filters={ISSUE_FILTERS}
      sorting={ISSUE_SORTING}
      columnToggle
      empty={
        empty ?? (
          <EmptyState
            illustration={<HairlineFigure figure={Loupe} />}
            title="No issues match these filters"
            description="Try a different search, or connect a repository and sync it to pull issues in."
          />
        )
      }
      renderRow={(row) => <IssueRow key={row.id} issue={row.original} />}
    />
  );
}
