"use client";

import { useMemo, type ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  DropdownMenu,
  type DropdownItem,
} from "@/components/arc/dropdown-menu/dropdown-menu";
import {
  FilterToolbar,
  type FilterChip,
  type FilterField,
} from "@/components/arc/filter-toolbar/filter-toolbar";
import { SearchField } from "@/components/arc/search-field/search-field";
import type {
  DataTableFilter,
  DataTableFilterOption,
  DataTableFilterValues,
} from "./data-table-filters";
import styles from "./data-table.module.css";

export type DataTableColumnToggle = {
  id: string;
  label: string;
  hidden: boolean;
  /** Locked columns stay visible and are left out of the menu. */
  locked: boolean;
};

type DataTableToolbarProps<TData> = {
  /** Every row before filtering, so choices and their counts reflect the whole set. */
  rows: TData[];
  filters: DataTableFilter<TData>[];
  filterValues: DataTableFilterValues;
  onFilterChange: (id: string, value: string) => void;
  onFilterRemove: (id: string) => void;
  onClear: () => void;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  };
  columns?: DataTableColumnToggle[];
  onToggleColumn?: (id: string) => void;
  onResetColumns?: () => void;
  children?: ReactNode;
};

export default function DataTableToolbar<TData>({
  rows,
  filters,
  filterValues,
  onFilterChange,
  onFilterRemove,
  onClear,
  search,
  columns,
  onToggleColumn,
  onResetColumns,
  children,
}: DataTableToolbarProps<TData>) {
  const choices = useMemo(
    () =>
      filters
        .map((filter) => ({ filter, options: filter.options(rows) }))
        .filter((entry) => entry.options.length > 0),
    [filters, rows],
  );

  const fields = useMemo<FilterField[]>(
    () =>
      choices.map(({ filter, options }) => ({
        id: filter.id,
        label: filter.label,
        options: options.map((option) => ({
          value: option.value,
          label: option.label,
          hint: option.hint,
        })),
      })),
    [choices],
  );

  const chips = useMemo<FilterChip[]>(() => {
    const result: FilterChip[] = [];
    for (const filter of filters) {
      const value = filterValues[filter.id];
      if (value === undefined) continue;
      const options =
        choices.find((entry) => entry.filter.id === filter.id)?.options ?? [];
      const match: DataTableFilterOption | undefined = options.find(
        (option) => option.value === value,
      );
      result.push({
        id: filter.id,
        label: filter.label,
        value: match?.label ?? value,
      });
    }
    return result;
  }, [choices, filters, filterValues]);

  const toggleable = columns?.filter((column) => !column.locked) ?? [];
  const visibleToggleable = toggleable.filter(
    (column) => !column.hidden,
  ).length;
  const anyHidden = toggleable.some((column) => column.hidden);

  const columnItems: DropdownItem[] = toggleable.map((column) => ({
    label: column.label,
    selected: !column.hidden,
    keepOpen: true,
    // At least one column must stay on screen.
    disabled: !column.hidden && visibleToggleable === 1,
    onSelect: () => onToggleColumn?.(column.id),
  }));

  if (anyHidden) {
    columnItems.push({
      label: "Show all columns",
      separatorBefore: true,
      onSelect: () => onResetColumns?.(),
    });
  }

  return (
    <div className={styles.toolbar}>
      <FilterToolbar
          leading={
            search ? (
              <div className={styles.search}>
                <SearchField
                  label="Search table"
                  value={search.value}
                  onValueChange={search.onChange}
                  placeholder={search.placeholder}
                />
              </div>
            ) : undefined
          }
          filters={chips}
          onRemove={onFilterRemove}
          onClearAll={onClear}
          addFilter={
            fields.length > 0
              ? {
                  fields,
                  align: "start",
                  onAdd: (chip, field) => {
                    const option = field.options
                      .map((entry) =>
                        typeof entry === "string"
                          ? { value: entry, label: entry }
                          : entry,
                      )
                      .find(
                        (entry) => (entry.label ?? entry.value) === chip.value,
                      );
                    if (option) onFilterChange(field.id, option.value);
                  },
                }
              : undefined
          }
        >
          {toggleable.length > 0 && (
            <DropdownMenu
              label="Columns"
              icon={<SlidersHorizontal size={14} strokeWidth={1.8} />}
              align="end"
              items={columnItems}
            />
          )}
          {children}
        </FilterToolbar>
    </div>
  );
}
