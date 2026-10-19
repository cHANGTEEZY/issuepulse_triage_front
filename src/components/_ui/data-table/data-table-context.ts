"use client";

import { createContext, useContext } from "react";

export type DataTableViewState = {
  /** Column ids the viewer has hidden through the Columns menu. */
  hiddenColumns: ReadonlySet<string>;
  /** Column id the rows are currently sorted by, if any. */
  sortedColumn: string | null;
};

const EMPTY_VIEW: DataTableViewState = {
  hiddenColumns: new Set<string>(),
  sortedColumn: null,
};

export const DataTableViewContext =
  createContext<DataTableViewState>(EMPTY_VIEW);

export function useDataTableViewState() {
  return useContext(DataTableViewContext);
}
