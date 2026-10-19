import {
  createColumnHelper,
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
  type RowData,
} from "@tanstack/react-table";

export type DataTableColumnMeta = {
  className?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  /** Name used by the Columns menu and sort labels when `header` is not a plain string. */
  label?: string;
  /** Set to `false` to keep a column out of the Columns menu. */
  hideable?: boolean;
};

export const dataTableFeatures = tableFeatures({
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  columnMeta: {} as DataTableColumnMeta,
});

export type DataTableFeatures = typeof dataTableFeatures;

export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>();
}
