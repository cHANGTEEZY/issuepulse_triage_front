"use client";

import { useMemo, useState } from "react";
import Button from "@/components/_ui/button";
import CountBadge from "@/components/_ui/count-badge";
import Field from "@/components/_ui/field";
import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/_ui/sheet";
import {
  ROLE_OPTIONS,
  SORT_MENU_OPTIONS,
  STATUS_OPTIONS,
} from "./filter-options";
import type { UserSortKey } from "@/features/users/data/users";
import { activeFilterCount, filterUsers } from "@/features/users/lib/users";
import { useUsersStore } from "@/features/users/stores/users-store";
import { cn } from "@/lib/utils";
import FilterIcon from "@/public/assets/images/_common/filter.svg?react";
import XIcon from "@/public/assets/images/companies/detail/x.svg?react";

type MobileFiltersProps = {
  className?: string;
};

export default function MobileFilters({ className }: MobileFiltersProps) {
  const [open, setOpen] = useState(false);
  const users = useUsersStore((state) => state.users);
  const sortBy = useUsersStore((state) => state.sortBy);
  const role = useUsersStore((state) => state.role);
  const status = useUsersStore((state) => state.status);
  const search = useUsersStore((state) => state.search);
  const setSortBy = useUsersStore((state) => state.setSortBy);
  const setRole = useUsersStore((state) => state.setRole);
  const setStatus = useUsersStore((state) => state.setStatus);
  const resetFilters = useUsersStore((state) => state.resetFilters);

  const filters = { sortBy, role, status, search };
  const activeCount = activeFilterCount(filters);
  const resultCount = useMemo(
    () => filterUsers(users, { sortBy, role, status, search }).length,
    [users, sortBy, role, status, search],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label={
          activeCount > 0 ? `Filters, ${activeCount} active` : "Filters"
        }
        className={cn("data-[active=true]:bg-muted", className)}
        data-active={activeCount > 0}
      >
        <FilterIcon aria-hidden className="size-3" />
        Filters
        {activeCount > 0 && <CountBadge>{activeCount}</CountBadge>}
      </Button>

      <SheetContent side="bottom">
        <SheetHeader className="px-4">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription className="sr-only">
            Sort and filter the users table
          </SheetDescription>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="-mr-1"
              aria-label="Close filters"
            >
              <XIcon aria-hidden className="text-foreground size-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <ScrollArea viewportClassName="max-h-[calc(85dvh-118px)]">
          <div className="flex flex-col gap-4 p-4">
            <Field label="Sort by" htmlFor="users-mobile-sort">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as UserSortKey)}
              >
                <SelectTrigger id="users-mobile-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_MENU_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Role" htmlFor="users-mobile-role">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="users-mobile-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Status" htmlFor="users-mobile-status">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="users-mobile-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </ScrollArea>

        <SheetFooter className="px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            disabled={activeCount === 0 && sortBy === "name"}
            className="-ml-1.5"
          >
            Reset
          </Button>
          <SheetClose asChild>
            <Button variant="primary" size="sm">
              Show {resultCount} {resultCount === 1 ? "user" : "users"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
