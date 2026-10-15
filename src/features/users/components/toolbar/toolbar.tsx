"use client";

import Button from "@/components/_ui/button";
import { DataTableSearch } from "@/components/_ui/data-table";
import FilterMenu from "@/components/_common/filter-menu";
import MobileFilters from "./mobile-filters";
import {
  ROLE_OPTIONS,
  SORT_MENU_OPTIONS,
  STATUS_OPTIONS,
} from "./filter-options";
import type { UserSortKey } from "@/features/users/data/users";
import { TODAY, filterUsers, usersCsvRows } from "@/features/users/lib/users";
import { downloadCsv } from "@/features/home/lib/csv";
import { useUsersStore } from "@/features/users/stores/users-store";
import ShareIcon from "@/public/assets/images/companies/toolbar/share.svg?react";

export default function UsersToolbar() {
  const sortBy = useUsersStore((state) => state.sortBy);
  const role = useUsersStore((state) => state.role);
  const status = useUsersStore((state) => state.status);
  const search = useUsersStore((state) => state.search);
  const setSortBy = useUsersStore((state) => state.setSortBy);
  const setRole = useUsersStore((state) => state.setRole);
  const setStatus = useUsersStore((state) => state.setStatus);
  const setSearch = useUsersStore((state) => state.setSearch);

  function exportCsv() {
    const { users } = useUsersStore.getState();
    const visible = filterUsers(users, { sortBy, role, status, search });
    downloadCsv(`users-${TODAY}.csv`, usersCsvRows(visible));
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-4">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <DataTableSearch
          value={search}
          onValueChange={setSearch}
          placeholder="Search users…"
          debounce
          debounceMs={300}
          aria-label="Search users"
          className="w-full sm:w-[220px]"
        />
        <MobileFilters className="sm:hidden" />

        <div className="hidden min-w-0 flex-wrap gap-2 sm:flex">
          <FilterMenu
            label="Sort by"
            value={sortBy}
            options={SORT_MENU_OPTIONS}
            onChange={(value) => setSortBy(value as UserSortKey)}
          />
          <FilterMenu
            label="Role"
            value={role}
            options={ROLE_OPTIONS}
            onChange={setRole}
          />
          <FilterMenu
            label="Status"
            value={status}
            options={STATUS_OPTIONS}
            onChange={setStatus}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          <ShareIcon aria-hidden className="size-3" />
          Export
        </Button>
      </div>
    </div>
  );
}
