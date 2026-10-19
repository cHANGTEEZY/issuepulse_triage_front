import { Loupe } from "@lucasmarkes/hairline/react";
import HairlineFigure from "@/components/_common/hairline-figure";
import { useMemo, type ReactNode } from "react";
import type { RepositoryRecord } from "@/api/repositories";
import DataTable from "@/components/_ui/data-table/data-table";
import { createDataTableColumnHelper } from "@/components/_ui/data-table/table-features";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import RepositoryRow from "./repository-row";
import {
  TABLE_COLUMNS,
  TABLE_GRID_CLASS,
  TABLE_ROW_CLASS,
} from "./table-columns";
import { REPOSITORY_FILTERS, REPOSITORY_SORTING } from "./table-config";

const columnHelper = createDataTableColumnHelper<RepositoryRecord>();

type RepositoryTableProps = {
  rows: RepositoryRecord[];
  syncingId: string | null;
  onSync: (id: string) => void;
  empty?: ReactNode;
};

export default function RepositoryTable({
  rows,
  syncingId,
  onSync,
  empty,
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
      filters={REPOSITORY_FILTERS}
      sorting={REPOSITORY_SORTING}
      columnToggle
      empty={
        empty ?? (
          <EmptyState
            illustration={<HairlineFigure figure={Loupe} />}
            title="No repositories match this search"
            description="Try a shorter name, or check the spelling of the owner and repository."
          />
        )
      }
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
