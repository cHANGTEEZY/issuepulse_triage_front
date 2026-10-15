"use client";

import { useMemo, type ReactNode } from "react";
import {
  useTable,
  type ColumnDef,
  type Row,
  type RowData,
} from "@tanstack/react-table";
import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import DataTablePagination from "./data-table-pagination";
import { dataTableFeatures, type DataTableFeatures } from "./table-features";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

type DataTableProps<TData extends RowData> = {
  columns: Array<ColumnDef<DataTableFeatures, TData, unknown>>;
  data: TData[];
  getRowId: (row: TData) => string;
  renderRow: (row: Row<DataTableFeatures, TData>) => ReactNode;
  tableClassName?: string;
  rowClassName?: string;
  empty: ReactNode;
  countLabel: string;
  pageSize?: number;
  pageSizeOptions?: number[];
};

export default function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  renderRow,
  tableClassName,
  rowClassName,
  empty,
  countLabel,
  pageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: DataTableProps<TData>) {
  const initialState = useMemo(
    () => ({
      pagination: { pageIndex: 0, pageSize },
    }),
    [pageSize],
  );

  const table = useTable(
    {
      features: dataTableFeatures,
      columns,
      data,
      getRowId,
      initialState,
      autoResetPageIndex: true,
    },
    (state) => ({ pagination: state.pagination }),
  );

  const rows = table.getRowModel().rows;

  return (
    <div className="border-border flex min-h-0 flex-1 flex-col border-t">
      <ScrollArea orientation="both" className="min-h-0 flex-1">
        <Table role="table" className={cn("w-full", tableClassName)}>
          <TableHeader role="rowgroup" className="contents">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                role="row"
                className={rowClassName}
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    role="columnheader"
                    className={cn(
                      "flex items-center",
                      header.column.columnDef.meta?.className,
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody role="rowgroup" className="contents">
            {rows.map((row) => renderRow(row))}
            {rows.length === 0 && (
              <TableRow role="row" className={rowClassName}>
                <td
                  role="cell"
                  className="caption-style text-muted-foreground col-span-full flex h-[120px] items-center justify-center"
                >
                  {empty}
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      <DataTablePagination
        table={table}
        countLabel={countLabel}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
}
