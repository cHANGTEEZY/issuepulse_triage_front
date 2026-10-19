"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  applyFilters,
  applySort,
  type DataTableFilter,
  type DataTableFilterValues,
  type DataTableSort,
  type DataTableSortAccessors,
} from "./data-table-filters";

type UseDataTableViewOptions<TData> = {
  tableId?: string;
  data: TData[];
  filters?: DataTableFilter<TData>[];
  sorting?: DataTableSortAccessors<TData>;
  defaultSort?: DataTableSort;
  searchText?: (row: TData) => string;
};

function hiddenKey(tableId: string) {
  return `data-table-columns:${tableId}`;
}

function readHidden(tableId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(hiddenKey(tableId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function writeHidden(tableId: string, hidden: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(hiddenKey(tableId), JSON.stringify(hidden));
  } catch {}
}

/**
 * Holds the viewer-controlled state of a table (search, filters, sort, hidden
 * columns) and returns the rows that state produces. Pagination stays in the
 * table instance, which resets to the first page whenever these rows change.
 */
export function useDataTableView<TData>({
  tableId,
  data,
  filters,
  sorting,
  defaultSort,
  searchText,
}: UseDataTableViewOptions<TData>) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<DataTableFilterValues>({});
  const [sort, setSort] = useState<DataTableSort | null>(defaultSort ?? null);
  const [hidden, setHidden] = useState<string[]>([]);

  useEffect(() => {
    if (tableId) setHidden(readHidden(tableId));
  }, [tableId]);

  const setFilter = useCallback((id: string, value: string) => {
    setFilterValues((current) => ({ ...current, [id]: value }));
  }, []);

  const removeFilter = useCallback((id: string) => {
    setFilterValues((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilterValues({});
    setQuery("");
  }, []);

  const toggleSort = useCallback((id: string) => {
    setSort((current) => {
      if (current?.id !== id) return { id, desc: false };
      if (!current.desc) return { id, desc: true };
      return null;
    });
  }, []);

  const updateHidden = useCallback(
    (next: string[]) => {
      setHidden(next);
      if (tableId) writeHidden(tableId, next);
    },
    [tableId],
  );

  const toggleColumn = useCallback(
    (id: string) => {
      updateHidden(
        hidden.includes(id)
          ? hidden.filter((item) => item !== id)
          : [...hidden, id],
      );
    },
    [hidden, updateHidden],
  );

  const resetColumns = useCallback(() => updateHidden([]), [updateHidden]);

  const rows = useMemo(() => {
    let result = data;
    const needle = query.trim().toLowerCase();
    if (needle && searchText) {
      result = result.filter((row) =>
        searchText(row).toLowerCase().includes(needle),
      );
    }
    result = applyFilters(result, filters ?? [], filterValues);
    return applySort(result, sorting, sort);
  }, [data, query, searchText, filters, filterValues, sorting, sort]);

  const hiddenColumns = useMemo(() => new Set(hidden), [hidden]);
  const hasActiveFilters =
    query.trim().length > 0 || Object.keys(filterValues).length > 0;

  return {
    rows,
    query,
    setQuery,
    filterValues,
    setFilter,
    removeFilter,
    clearFilters,
    hasActiveFilters,
    sort,
    toggleSort,
    hiddenColumns,
    toggleColumn,
    resetColumns,
  };
}
