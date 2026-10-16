import type { DataTableColumnMeta } from "./table-features";

export const COLUMN_DEFAULT_MIN_WIDTH = 80;
export const COLUMN_DEFAULT_MAX_WIDTH = 960;
export const COLUMN_KEYBOARD_STEP = 16;

export type ColumnWidths = Record<string, number>;

export type SizedColumn = {
  id: string;
  meta: DataTableColumnMeta | undefined;
};

export function columnBounds(meta: DataTableColumnMeta | undefined) {
  return {
    min: meta?.minWidth ?? COLUMN_DEFAULT_MIN_WIDTH,
    max: meta?.maxWidth ?? COLUMN_DEFAULT_MAX_WIDTH,
  };
}

export function clampColumnWidth(meta: DataTableColumnMeta | undefined, width: number) {
  const { min, max } = columnBounds(meta);
  return Math.round(Math.min(max, Math.max(min, width)));
}

export function isColumnResizable(meta: DataTableColumnMeta | undefined) {
  return meta?.width != null && meta.resizable !== false;
}

export function columnWidth(meta: DataTableColumnMeta | undefined, widths: ColumnWidths, id: string) {
  const stored = widths[id];
  if (stored != null && meta?.width != null) return clampColumnWidth(meta, stored);
  return meta?.width ?? null;
}

export function gridTemplate(columns: SizedColumn[], widths: ColumnWidths) {
  if (!columns.some((column) => column.meta?.width != null)) return undefined;
  return columns
    .map((column) => {
      const width = columnWidth(column.meta, widths, column.id);
      return width == null ? "max-content" : `${width}px`;
    })
    .join(" ");
}

function storageKey(tableId: string) {
  return `data-table-widths:${tableId}`;
}

export function readStoredWidths(tableId: string): ColumnWidths {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(tableId));
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const result: ColumnWidths = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "number" && Number.isFinite(value)) result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

export function writeStoredWidths(tableId: string, widths: ColumnWidths) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(tableId), JSON.stringify(widths));
  } catch {}
}
