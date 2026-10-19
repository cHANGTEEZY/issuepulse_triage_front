/**
 * Filter and sort definitions for `DataTable`.
 *
 * A filter is a named list of choices plus a predicate. `optionsFilter`,
 * `dateFilter` and `rangeFilter` cover the common shapes; build a
 * `DataTableFilter` by hand for anything else. Each filter holds at most one
 * chosen value, shown as a removable chip in the toolbar.
 */

export type DataTableFilterOption = {
  value: string;
  label: string;
  /** Row count shown beside the choice. Filled in by the table when omitted. */
  hint?: number;
};

export type DataTableFilter<TData> = {
  /** Unique within a table. Usually the column id the filter belongs to. */
  id: string;
  label: string;
  /** Choices to offer. Receives every row so choices can follow the data. */
  options: (rows: TData[]) => DataTableFilterOption[];
  matches: (row: TData, value: string) => boolean;
};

export type SortValue = string | number | boolean | Date | null | undefined;

export type DataTableSortAccessors<TData> = Record<
  string,
  (row: TData) => SortValue
>;

export type DataTableSort = { id: string; desc: boolean };

export type DataTableFilterValues = Record<string, string>;

const NONE_VALUE = "__none__";

type OptionsFilterConfig<TData> = {
  id: string;
  label: string;
  /** Every value a row holds for this filter. Return an array for multi-value fields such as labels. */
  getValues: (row: TData) => string | string[] | null | undefined;
  /** Fixes the choices and their order. Defaults to the values found in the data, most common first. */
  options?: Array<{ value: string; label?: string }>;
  /** Display text for a value found in the data. */
  formatLabel?: (value: string) => string;
  /** Adds a choice for rows with no value, e.g. "Unassigned". Omit to leave those rows out of the menu. */
  emptyLabel?: string;
  limit?: number;
};

function toList(value: string | string[] | null | undefined) {
  if (Array.isArray(value)) return value.filter((item) => item.length > 0);
  return value ? [value] : [];
}

export function optionsFilter<TData>({
  id,
  label,
  getValues,
  options,
  formatLabel,
  emptyLabel,
  limit = 50,
}: OptionsFilterConfig<TData>): DataTableFilter<TData> {
  return {
    id,
    label,
    options(rows) {
      const counts = new Map<string, number>();
      let empty = 0;
      for (const row of rows) {
        const values = toList(getValues(row));
        if (values.length === 0) empty += 1;
        for (const value of new Set(values)) {
          counts.set(value, (counts.get(value) ?? 0) + 1);
        }
      }

      const text = (value: string) => formatLabel?.(value) ?? value;
      let result: DataTableFilterOption[];
      if (options) {
        result = options.map((option) => ({
          value: option.value,
          label: option.label ?? text(option.value),
          hint: counts.get(option.value) ?? 0,
        }));
      } else {
        result = [...counts.entries()]
          .sort((a, b) => b[1] - a[1] || text(a[0]).localeCompare(text(b[0])))
          .slice(0, limit)
          .map(([value, hint]) => ({ value, label: text(value), hint }));
      }

      if (emptyLabel && empty > 0) {
        result.push({ value: NONE_VALUE, label: emptyLabel, hint: empty });
      }
      return result;
    },
    matches(row, value) {
      const values = toList(getValues(row));
      return value === NONE_VALUE
        ? values.length === 0
        : values.includes(value);
    },
  };
}

export type DatePreset = {
  value: string;
  label: string;
  /** Matches dates no older than this many days. */
  withinDays?: number;
  /** Matches dates older than this many days. */
  olderThanDays?: number;
};

export const DEFAULT_DATE_PRESETS: DatePreset[] = [
  { value: "1d", label: "Last 24 hours", withinDays: 1 },
  { value: "7d", label: "Last 7 days", withinDays: 7 },
  { value: "30d", label: "Last 30 days", withinDays: 30 },
  { value: "90d", label: "Last 90 days", withinDays: 90 },
  { value: "stale", label: "Older than 90 days", olderThanDays: 90 },
];

const DAY_MS = 86_400_000;

type DateFilterConfig<TData> = {
  id: string;
  label: string;
  getValue: (row: TData) => string | Date | null | undefined;
  presets?: DatePreset[];
  /** Adds a choice for rows with no date, e.g. "Never". */
  emptyLabel?: string;
};

function toTime(value: string | Date | null | undefined) {
  if (!value) return null;
  const time = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

function matchesPreset(time: number | null, preset: DatePreset, now: number) {
  if (time === null) return false;
  const age = now - time;
  if (preset.withinDays !== undefined && age > preset.withinDays * DAY_MS) {
    return false;
  }
  if (
    preset.olderThanDays !== undefined &&
    age <= preset.olderThanDays * DAY_MS
  ) {
    return false;
  }
  return true;
}

export function dateFilter<TData>({
  id,
  label,
  getValue,
  presets = DEFAULT_DATE_PRESETS,
  emptyLabel,
}: DateFilterConfig<TData>): DataTableFilter<TData> {
  return {
    id,
    label,
    options(rows) {
      const now = Date.now();
      const times = rows.map((row) => toTime(getValue(row)));
      const result: DataTableFilterOption[] = presets.map((preset) => ({
        value: preset.value,
        label: preset.label,
        hint: times.filter((time) => matchesPreset(time, preset, now)).length,
      }));
      if (emptyLabel) {
        result.push({
          value: NONE_VALUE,
          label: emptyLabel,
          hint: times.filter((time) => time === null).length,
        });
      }
      return result;
    },
    matches(row, value) {
      const time = toTime(getValue(row));
      if (value === NONE_VALUE) return time === null;
      const preset = presets.find((candidate) => candidate.value === value);
      return preset ? matchesPreset(time, preset, Date.now()) : true;
    },
  };
}

export type NumberRange = {
  value: string;
  label: string;
  min?: number;
  max?: number;
};

type RangeFilterConfig<TData> = {
  id: string;
  label: string;
  getValue: (row: TData) => number | null | undefined;
  ranges: NumberRange[];
};

function inRange(value: number | null | undefined, range: NumberRange) {
  if (value === null || value === undefined) return false;
  if (range.min !== undefined && value < range.min) return false;
  if (range.max !== undefined && value > range.max) return false;
  return true;
}

export function rangeFilter<TData>({
  id,
  label,
  getValue,
  ranges,
}: RangeFilterConfig<TData>): DataTableFilter<TData> {
  return {
    id,
    label,
    options: (rows) =>
      ranges.map((range) => ({
        value: range.value,
        label: range.label,
        hint: rows.filter((row) => inRange(getValue(row), range)).length,
      })),
    matches(row, value) {
      const range = ranges.find((candidate) => candidate.value === value);
      return range ? inRange(getValue(row), range) : true;
    },
  };
}

export function applyFilters<TData>(
  rows: TData[],
  filters: DataTableFilter<TData>[],
  values: DataTableFilterValues,
) {
  const active = filters.filter((filter) => values[filter.id] !== undefined);
  if (active.length === 0) return rows;
  return rows.filter((row) =>
    active.every((filter) => filter.matches(row, values[filter.id])),
  );
}

const collator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

function comparable(value: SortValue) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "boolean") return value ? 1 : 0;
  return value;
}

function isEmpty(value: SortValue) {
  return value === null || value === undefined || value === "";
}

export function applySort<TData>(
  rows: TData[],
  accessors: DataTableSortAccessors<TData> | undefined,
  sort: DataTableSort | null,
) {
  const accessor = sort ? accessors?.[sort.id] : undefined;
  if (!sort || !accessor) return rows;

  return rows
    .map((row, index) => ({ row, index, value: accessor(row) }))
    .sort((a, b) => {
      // Empty values sink to the bottom in both directions.
      if (isEmpty(a.value) || isEmpty(b.value)) {
        if (isEmpty(a.value) === isEmpty(b.value)) return a.index - b.index;
        return isEmpty(a.value) ? 1 : -1;
      }
      const left = comparable(a.value);
      const right = comparable(b.value);
      const result =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : collator.compare(String(left), String(right));
      return (sort.desc ? -result : result) || a.index - b.index;
    })
    .map((entry) => entry.row);
}
