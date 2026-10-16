import { useMemo } from "react";
import type { RepositoryRecord } from "@/api/repositories";
import DataTable from "@/components/_ui/data-table/data-table";
import { createDataTableColumnHelper } from "@/components/_ui/data-table/table-features";
import RepositoryRow from "./repository-row";
import {
  TABLE_COLUMNS,
  TABLE_GRID_CLASS,
  TABLE_ROW_CLASS,
} from "./table-columns";

const columnHelper = createDataTableColumnHelper<RepositoryRecord>();

type RepositoryTableProps = {
  rows: RepositoryRecord[];
  syncingId: string | null;
  onSync: (id: string) => void;
};

export default function RepositoryTable({
  rows,
  syncingId,
  onSync,
}: RepositoryTableProps) {
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
      tableId="repositories"
      columns={columns}
      data={rows}
      getRowId={(repository) => repository.id}
      tableClassName={TABLE_GRID_CLASS}
      rowClassName={TABLE_ROW_CLASS}
      countLabel="Repositories in view"
      empty="No repositories match this search."
      renderRow={(row) => (
        <RepositoryRow
          key={row.id}
          repository={row.original}
          syncing={syncingId === row.original.id}
          onSync={() => onSync(row.original.id)}
        />
      )}
    />
  );
}
