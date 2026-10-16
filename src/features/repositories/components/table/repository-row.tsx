import type { MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import type { RepositoryRecord } from "@/api/repositories";
import Button from "@/components/_ui/button";
import Tag from "@/components/_ui/tag";
import { TableCell, TableRow } from "@/components/_ui/table";
import { formatWhen } from "@/features/issues/lib/triage";
import { cn } from "@/lib/utils";
import {
  TABLE_CELL_CLASS,
  TABLE_ROW_CLASS,
  columnClass,
  type TableColumnKey,
} from "./table-columns";

function cellClass(key: TableColumnKey) {
  return cn(TABLE_CELL_CLASS, "h-[52px]", columnClass(key));
}

function stop(event: MouseEvent) {
  event.stopPropagation();
}

type RepositoryRowProps = {
  repository: RepositoryRecord;
  syncing: boolean;
  onSync: () => void;
};

export default function RepositoryRow({
  repository,
  syncing,
  onSync,
}: RepositoryRowProps) {
  const fullName = `${repository.owner}/${repository.name}`;

  return (
    <TableRow role="row" className={cn(TABLE_ROW_CLASS, "hover:bg-card/60")}>
      <TableCell role="cell" className={cellClass("repository")}>
        <span className="flex min-w-0 flex-col gap-1">
          <Link
            to="/repositories/$repositoryId"
            params={{ repositoryId: repository.id }}
            title={fullName}
            className="truncate font-medium underline-offset-2 hover:underline"
          >
            {fullName}
          </Link>
          <span
            className="caption-style text-subtle truncate"
            title={repository.description ?? undefined}
          >
            {repository.description ?? "No description"}
          </span>
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("visibility")}>
        <Tag tone={repository.isPrivate ? "amber" : "green"} size="sm">
          {repository.isPrivate ? "Private" : "Public"}
        </Tag>
      </TableCell>
      <TableCell role="cell" className={cellClass("language")}>
        <span className={cn("truncate", !repository.language && "text-subtle")}>
          {repository.language ?? "—"}
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("openIssues")}>
        {repository.openIssues}
      </TableCell>
      <TableCell role="cell" className={cellClass("pushed")}>
        <span className="truncate">{formatWhen(repository.pushedAt)}</span>
      </TableCell>
      <TableCell role="cell" className={cellClass("synced")}>
        <span className="truncate">{formatWhen(repository.lastSyncedAt)}</span>
      </TableCell>
      <TableCell role="cell" className={cellClass("action")} onClick={stop}>
        <Button variant="secondary" size="md" disabled={syncing} onClick={onSync}>
          {syncing ? "Syncing…" : "Sync now"}
        </Button>
      </TableCell>
    </TableRow>
  );
}
