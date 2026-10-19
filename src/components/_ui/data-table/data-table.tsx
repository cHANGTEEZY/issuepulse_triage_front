"use client";

import { Loupe } from "@lucasmarkes/hairline/react";
import HairlineFigure from "@/components/_common/hairline-figure";
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
import { ArrowUp } from "lucide-react";
import Button from "@/components/_ui/button";
import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import DataTablePagination from "./data-table-pagination";
import DataTableResizer from "./data-table-resizer";
import DataTableToolbar, {
  type DataTableColumnToggle,
} from "./data-table-toolbar";
import { DataTableViewContext } from "./data-table-context";
import type {
  DataTableFilter,
  DataTableSort,
  DataTableSortAccessors,
} from "./data-table-filters";
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
import { useDataTableView } from "./use-data-table-view";
import { cn } from "@/lib/utils";
import styles from "./data-table.module.css";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

type TableColumnDef<TData extends RowData> = ColumnDef<
  DataTableFeatures,
  TData,
  unknown
>;

type DataTableProps<TData extends RowData> = {
  columns: Array<TableColumnDef<TData>>;
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
  /** Filters offered by the toolbar's Add filter menu. */
  filters?: DataTableFilter<TData>[];
  /** Sort value per column id. Columns listed here get a sortable header. */
  sorting?: DataTableSortAccessors<TData>;
  defaultSort?: DataTableSort;
  /** Text a row is searched by. Adds a search field to the toolbar. */
  searchText?: (row: TData) => string;
  searchPlaceholder?: string;
  /**
   * Adds a Columns menu. Rows must render their cells through
   * `<TableCell column="…">` so hidden columns drop out of the grid.
   */
  columnToggle?: boolean;
  /** Extra controls placed beside the Add filter button. */
  toolbarActions?: ReactNode;
};

function columnLabel<TData extends RowData>(column: TableColumnDef<TData>) {
  if (typeof column.header === "string") return column.header;
  return column.meta?.label ?? "";
}

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
  filters,
  sorting,
  defaultSort,
  searchText,
  searchPlaceholder = "Search",
  columnToggle = false,
  toolbarActions,
}: DataTableProps<TData>) {
  const view = useDataTableView({
    tableId,
    data,
    filters,
    sorting,
    defaultSort,
    searchText,
  });

  const initialState = useMemo(
    () => ({
      pagination: { pageIndex: 0, pageSize },
    }),
    [pageSize],
  );

  const shownColumns = useMemo(
    () =>
      columnToggle
        ? columns.filter((column) => !view.hiddenColumns.has(column.id ?? ""))
        : columns,
    [columns, columnToggle, view.hiddenColumns],
  );

  const table = useTable(
    {
      features: dataTableFeatures,
      columns: shownColumns,
      data: view.rows,
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

  const viewState = useMemo(
    () => ({
      hiddenColumns: view.hiddenColumns,
      sortedColumn: view.sort?.id ?? null,
    }),
    [view.hiddenColumns, view.sort?.id],
  );

  const columnToggles = useMemo<DataTableColumnToggle[]>(
    () =>
      columnToggle
        ? columns.map((column) => {
            const id = column.id ?? "";
            const label = columnLabel(column);
            return {
              id,
              label,
              hidden: view.hiddenColumns.has(id),
              locked: !label || column.meta?.hideable === false,
            };
          })
        : [],
    [columns, columnToggle, view.hiddenColumns],
  );

  const showToolbar = Boolean(
    filters?.length || searchText || (columnToggle && columnToggles.length),
  );

  const sortLabel = view.sort
    ? columnToggles.find((column) => column.id === view.sort?.id)?.label ||
      view.sort.id
    : null;

  const emptyContent =
    view.hasActiveFilters && data.length > 0 ? (
      <EmptyState
        illustration={<HairlineFigure figure={Loupe} />}
        title="No results match these filters"
        description="Loosen a filter or clear them all to see every row again."
        action={
          <Button variant="secondary" size="md" onClick={view.clearFilters}>
            Clear filters
          </Button>
        }
      />
    ) : (
      empty
    );

  return (
    <DataTableViewContext.Provider value={viewState}>
      <div className={styles.root}>
        {showToolbar && (
          <DataTableToolbar
            rows={data}
            filters={filters ?? []}
            filterValues={view.filterValues}
            onFilterChange={view.setFilter}
            onFilterRemove={view.removeFilter}
            onClear={view.clearFilters}
            search={
              searchText
                ? {
                    value: view.query,
                    onChange: view.setQuery,
                    placeholder: searchPlaceholder,
                  }
                : undefined
            }
            columns={columnToggles}
            onToggleColumn={view.toggleColumn}
            onResetColumns={view.resetColumns}
          >
            {toolbarActions}
          </DataTableToolbar>
        )}

        <div className={styles.card}>
          <ScrollArea orientation="both" className={styles.scroll}>
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
                    className={cn(rowClassName, styles.headerRow)}
                  >
                    {headerGroup.headers.map((header) => {
                      const columnId = header.column.id;
                      const meta = header.column.columnDef.meta;
                      const width = columnWidth(meta, widths, columnId);
                      const resizable =
                        isColumnResizable(meta) && width != null;
                      const bounds = columnBounds(meta);
                      const label =
                        typeof header.column.columnDef.header === "string"
                          ? header.column.columnDef.header
                          : (meta?.label ?? columnId);
                      const sortable = Boolean(sorting?.[columnId]);
                      const active = view.sort?.id === columnId;
                      const descending = active && Boolean(view.sort?.desc);

                      return (
                        <TableHead
                          key={header.id}
                          role="columnheader"
                          data-sorted={active ? "" : undefined}
                          aria-sort={
                            sortable
                              ? active
                                ? descending
                                  ? "descending"
                                  : "ascending"
                                : "none"
                              : undefined
                          }
                          className={cn(
                            "relative flex min-w-0 items-center overflow-visible",
                            meta?.className,
                          )}
                        >
                          {header.isPlaceholder ? null : sortable ? (
                            <button
                              type="button"
                              className={styles.sortButton}
                              data-active={active ? "" : undefined}
                              data-desc={descending ? "" : undefined}
                              aria-label={`Sort by ${label}${
                                active
                                  ? `, currently ${descending ? "descending" : "ascending"}`
                                  : ""
                              }`}
                              onClick={() => view.toggleSort(columnId)}
                            >
                              <table.FlexRender header={header} />
                              <ArrowUp
                                aria-hidden
                                size={14}
                                strokeWidth={1.8}
                                className={styles.sortGlyph}
                              />
                            </button>
                          ) : (
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
                                  [columnId]: clampColumnWidth(meta, next),
                                }))
                              }
                              onCommit={commit}
                              onReset={() => {
                                setWidths((current) => {
                                  const next = { ...current };
                                  delete next[columnId];
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
                      className={cn("col-span-full", styles.empty)}
                    >
                      {emptyContent}
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

        <p role="status" className="sr-only">
          {sortLabel
            ? `Sorted by ${sortLabel}, ${view.sort?.desc ? "descending" : "ascending"}`
            : ""}
        </p>
      </div>
    </DataTableViewContext.Provider>
  );
}
