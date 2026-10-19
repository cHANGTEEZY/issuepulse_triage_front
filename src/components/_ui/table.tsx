import type { ComponentProps } from "react";
import { useDataTableViewState } from "@/components/_ui/data-table/data-table-context";
import { cn } from "@/lib/utils";

function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <table
      data-slot="table"
      className={cn(
        "w-full border-collapse text-[14px] leading-none",
        className,
      )}
      {...props}
    />
  );
}

function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={className} {...props} />;
}

function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={className} {...props} />;
}

function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border transition-colors duration-150 ease-power3-out",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "caption-style h-[38px] px-3 text-left align-middle font-normal whitespace-nowrap text-subtle",
        className,
      )}
      {...props}
    />
  );
}

type TableCellProps = ComponentProps<"td"> & {
  /**
   * Id of the DataTable column this cell belongs to. A cell tied to a column
   * disappears when the viewer hides that column and is tinted while the rows
   * are sorted by it.
   */
  column?: string;
};

function TableCell({ className, column, ...props }: TableCellProps) {
  const { hiddenColumns, sortedColumn } = useDataTableViewState();
  if (column && hiddenColumns.has(column)) return null;

  return (
    <td
      data-slot="table-cell"
      data-sorted={column && column === sortedColumn ? "" : undefined}
      className={cn("h-[42px] px-3 align-middle whitespace-nowrap", className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
