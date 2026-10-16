import { Link } from "@tanstack/react-router";
import type { IssueRecord } from "@/api/issues";
import OverflowRow from "@/components/_common/overflow-row";
import { TableCell, TableRow } from "@/components/_ui/table";
import { issueBadgeItems } from "@/features/issues/components/issue-badges";
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

export default function IssueRow({ issue }: { issue: IssueRecord }) {
  const title = `#${issue.number} ${issue.title}`;

  return (
    <TableRow role="row" className={cn(TABLE_ROW_CLASS, "hover:bg-card/60")}>
      <TableCell role="cell" className={cellClass("issue")}>
        <span className="flex min-w-0 flex-col gap-1">
          <Link
            to="/issues/$issueId"
            params={{ issueId: issue.id }}
            title={title}
            className="truncate font-medium underline-offset-2 hover:underline"
          >
            {title}
          </Link>
          <span className="caption-style text-subtle truncate">
            {issue.authorLogin} · {issue.state}
          </span>
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("repository")}>
        <span className="truncate" title={`${issue.repository.owner}/${issue.repository.name}`}>
          {issue.repository.owner}/{issue.repository.name}
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("triage")}>
        <OverflowRow items={issueBadgeItems(issue)} />
      </TableCell>
      <TableCell role="cell" className={cellClass("updated")}>
        <span className="truncate">{formatWhen(issue.githubUpdatedAt)}</span>
      </TableCell>
    </TableRow>
  );
}
