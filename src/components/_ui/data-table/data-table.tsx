"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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
import DataTableResizer from "./data-table-resizer";
import {
  clampColumnWidth,
  columnBounds,
  columnWidth,
  gridTemplate,
  isColumnResizable,
  readStoredWidths,
  writeStoredWidths,
  type ColumnWidths,
} from "./column-sizing";
import { dataTableFeatures, type DataTableFeatures } from "./table-features";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

type DataTableProps<TData extends RowData> = {
  columns: Array<ColumnDef<DataTableFeatures, TData, unknown>>;
  data: TData[];
  getRowId: (row: TData) => string;
  renderRow: (row: Row<DataTableFeatures, TData>) => ReactNode;
  tableId?: string;
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
  tableId,
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

  const [widths, setWidths] = useState<ColumnWidths>({});

  useEffect(() => {
    if (!tableId) return;
    setWidths(readStoredWidths(tableId));
  }, [tableId]);

  const commit = useCallback(() => {
    if (!tableId) return;
    setWidths((current) => {
      writeStoredWidths(tableId, current);
      return current;
    });
  }, [tableId]);

  const leafColumns = table.getAllLeafColumns();
  const template = gridTemplate(
    leafColumns.map((column) => ({
      id: column.id,
      meta: column.columnDef.meta,
    })),
    widths,
  );

  const rows = table.getRowModel().rows;

  return (
    <div className="border-border flex min-h-0 flex-1 flex-col border-t">
      <ScrollArea orientation="both" className="min-h-0 flex-1">
        <Table
          role="table"
          className={cn("w-full", tableClassName)}
          style={template ? { gridTemplateColumns: template } : undefined}
        >
          <TableHeader role="rowgroup" className="contents">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                role="row"
                className={rowClassName}
              >
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const width = columnWidth(meta, widths, header.column.id);
                  const resizable = isColumnResizable(meta) && width != null;
                  const bounds = columnBounds(meta);
                  const label =
                    typeof header.column.columnDef.header === "string"
                      ? header.column.columnDef.header
                      : header.column.id;

                  return (
                    <TableHead
                      key={header.id}
                      role="columnheader"
                      className={cn(
                        "relative flex min-w-0 items-center overflow-visible",
                        meta?.className,
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                      {resizable && (
                        <DataTableResizer
                          label={label}
                          width={width}
                          min={bounds.min}
                          max={bounds.max}
                          onResize={(next) =>
                            setWidths((current) => ({
                              ...current,
                              [header.column.id]: clampColumnWidth(meta, next),
                            }))
                          }
                          onCommit={commit}
                          onReset={() => {
                            setWidths((current) => {
                              const next = { ...current };
                              delete next[header.column.id];
                              if (tableId) writeStoredWidths(tableId, next);
                              return next;
                            });
                          }}
                        />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody role="rowgroup" className="contents">
            {rows.map((row) => renderRow(row))}
            {rows.length === 0 && (
              <TableRow role="row" className={rowClassName}>
                <td
                  role="cell"
                  className="col-span-full flex items-center justify-center px-4"
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
