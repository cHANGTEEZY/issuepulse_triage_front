"use client";

import type { CSSProperties } from "react";
import type { ReactTable } from "@tanstack/react-table";
import type { RowData } from "@tanstack/react-table";
import { AnimatedCounter } from "@/components/arc/animated-counter/animated-counter";
import Button from "@/components/_ui/button";
import FilterMenu from "@/components/_common/filter-menu";
import type { DataTableFeatures } from "./table-features";
import ChevronDownIcon from "@/public/assets/images/_common/chevron-down.svg?react";

const COUNT_STYLE = {
  "--text-3xl": "12px",
  "--tracking-display": "0",
  "--font-display": "inherit",
} as CSSProperties;

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

type DataTablePaginationProps<TData extends RowData> = {
  table: ReactTable<DataTableFeatures, TData>;
  countLabel: string;
  pageSizeOptions?: number[];
};

export default function DataTablePagination<TData extends RowData>({
  table,
  countLabel,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.state.pagination;
  const total = table.getRowCount();
  const pageCount = table.getPageCount();
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, total);

  return (
    <div className="border-border bg-background flex shrink-0 flex-col gap-2 border-t px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="caption-style flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-foreground inline-flex items-center" style={COUNT_STYLE}>
          <AnimatedCounter value={total} />
        </span>
        <span className="text-muted-foreground">{countLabel}</span>
        <span role="status" className="text-muted-foreground hidden sm:inline">
          Showing {from}–{to} of {total}
        </span>
      </div>

      <nav
        aria-label="Table pagination"
        className="flex flex-wrap items-center justify-between gap-2 sm:justify-end"
      >
        <FilterMenu
          label="Rows"
          align="end"
          value={String(pageSize)}
          options={pageSizeOptions.map((size) => ({
            value: String(size),
            label: String(size),
          }))}
          onChange={(value) => table.setPageSize(Number(value))}
        />

        <span className="caption-style text-muted-foreground sm:hidden">
          Page {pageCount === 0 ? 0 : pageIndex + 1} of {pageCount}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon"
            aria-label="First page"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.firstPage()}
          >
            <span className="flex -space-x-1">
              <ChevronDownIcon aria-hidden className="size-3 rotate-90" />
              <ChevronDownIcon aria-hidden className="size-3 rotate-90" />
            </span>
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Previous page"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronDownIcon aria-hidden className="size-3 rotate-90" />
          </Button>

          <div className="hidden items-center gap-1 sm:flex">
            {getPageNumbers(pageIndex, pageCount).map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="caption-style text-muted-foreground px-1"
                >
                  …
                </span>
              ) : (
                <Button
                  key={page}
                  variant={pageIndex === page ? "muted" : "ghost"}
                  size="icon"
                  aria-label={`Page ${page + 1}`}
                  aria-current={pageIndex === page ? "page" : undefined}
                  onClick={() => table.setPageIndex(page)}
                >
                  {page + 1}
                </Button>
              ),
            )}
          </div>

          <Button
            variant="secondary"
            size="icon"
            aria-label="Next page"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronDownIcon aria-hidden className="size-3 -rotate-90" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Last page"
            disabled={!table.getCanNextPage()}
            onClick={() => table.lastPage()}
          >
            <span className="flex -space-x-1">
              <ChevronDownIcon aria-hidden className="size-3 -rotate-90" />
              <ChevronDownIcon aria-hidden className="size-3 -rotate-90" />
            </span>
          </Button>
        </div>
      </nav>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 0) return [];
  if (total <= 7) return Array.from({ length: total }, (_, index) => index);

  const pages: (number | "...")[] = [0];
  if (current > 3) pages.push("...");

  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);

  for (let index = start; index <= end; index += 1) pages.push(index);

  if (current < total - 3) pages.push("...");
  pages.push(total - 1);

  return pages;
}
