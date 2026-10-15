"use client";

import type { MouseEvent } from "react";
import type { User } from "@/api/users";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import { Checkbox } from "@/components/_ui/checkbox";
import Tag from "@/components/_ui/tag";
import { TableCell, TableRow } from "@/components/_ui/table";
import {
  ROLE_TONES,
  STATUS_TONES,
  type UserRole,
  type UserStatus,
} from "@/features/users/data/users";
import { formatDate, userFullName } from "@/features/users/lib/users";
import { cn } from "@/lib/utils";
import {
  TABLE_CELL_CLASS,
  TABLE_ROW_CLASS,
  columnClass,
  type TableColumnKey,
} from "./table-columns";
import CalendarIcon from "@/public/assets/images/_common/calendar.svg?react";
import DotsIcon from "@/public/assets/images/companies/table/dots-horizontal.svg?react";

type UserRowProps = {
  user: User;
  selected: boolean;
  onToggle: () => void;
};

function cellClass(key: TableColumnKey) {
  return cn(TABLE_CELL_CLASS, columnClass(key));
}

function stop(event: MouseEvent) {
  event.stopPropagation();
}

function roleTone(role: string) {
  return ROLE_TONES[role as UserRole] ?? "neutral";
}

function statusTone(status: string) {
  return STATUS_TONES[status as UserStatus] ?? "neutral";
}

export default function UserRow({ user, selected, onToggle }: UserRowProps) {
  const name = userFullName(user);

  return (
    <TableRow
      role="row"
      data-active={selected}
      className={cn(
        TABLE_ROW_CLASS,
        "hover:bg-card/60 data-[active=true]:border-card data-[active=true]:bg-card",
      )}
    >
      <TableCell role="cell" className={cellClass("name")}>
        <span className="flex items-center gap-5">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            onClick={stop}
            aria-label={`Select ${name}`}
          />
          <span className="flex items-center gap-1.5">
            <Avatar src={user.avatar} alt="" />
            {name}
          </span>
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("email")}>
        {user.email}
      </TableCell>
      <TableCell role="cell" className={cellClass("role")}>
        <Tag tone={roleTone(user.role)}>{user.role}</Tag>
      </TableCell>
      <TableCell role="cell" className={cellClass("status")}>
        <Tag tone={statusTone(user.status)}>{user.status}</Tag>
      </TableCell>
      <TableCell role="cell" className={cellClass("username")}>
        {user.username}
      </TableCell>
      <TableCell role="cell" className={cellClass("phone")}>
        {user.phone}
      </TableCell>
      <TableCell role="cell" className={cellClass("joined")}>
        <span className="flex items-center gap-1">
          <CalendarIcon
            aria-hidden
            className="text-foreground size-3.5 shrink-0"
          />
          <span className="tabular-nums">{formatDate(user.joinDate)}</span>
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("action")} onClick={stop}>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-foreground"
          aria-label={`Open actions for ${name}`}
        >
          <DotsIcon aria-hidden className="size-3" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
