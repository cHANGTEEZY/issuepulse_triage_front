"use client";

import { useMemo } from "react";
import type { User } from "@/api/users";
import { Checkbox } from "@/components/_ui/checkbox";
import DataTable from "@/components/_ui/data-table/data-table";
import { createDataTableColumnHelper } from "@/components/_ui/data-table/table-features";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import UserRow from "./user-row";
import SearchIcon from "@/public/assets/images/_common/search.svg?react";
import {
  TABLE_COLUMNS,
  TABLE_GRID_CLASS,
  TABLE_ROW_CLASS,
} from "./table-columns";
import { filterUsers } from "@/features/users/lib/users";
import { useUsersStore } from "@/features/users/stores/users-store";

const columnHelper = createDataTableColumnHelper<User>();

export default function UsersTable() {
  const users = useUsersStore((state) => state.users);
  const sortBy = useUsersStore((state) => state.sortBy);
  const role = useUsersStore((state) => state.role);
  const status = useUsersStore((state) => state.status);
  const search = useUsersStore((state) => state.search);
  const selectedIds = useUsersStore((state) => state.selectedIds);
  const toggleSelected = useUsersStore((state) => state.toggleSelected);
  const setSelected = useUsersStore((state) => state.setSelected);

  const visible = useMemo(
    () => filterUsers(users, { sortBy, role, status, search }),
    [users, sortBy, role, status, search],
  );

  const selectedVisible = visible.filter((user) =>
    selectedIds.includes(user.id),
  );
  const allSelected =
    visible.length > 0 && selectedVisible.length === visible.length;
  const someSelected = selectedVisible.length > 0 && !allSelected;

  function toggleAll() {
    setSelected(allSelected ? [] : visible.map((user) => user.id));
  }

  const columns = useMemo(
    () =>
      TABLE_COLUMNS.map((column) =>
        columnHelper.display({
          id: column.key,
          header:
            column.key === "name"
              ? () => (
                  <span className="flex items-center gap-5">
                    <Checkbox
                      checked={
                        allSelected
                          ? true
                          : someSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={toggleAll}
                      aria-label="Select all users"
                    />
                    {column.label}
                  </span>
                )
              : column.label,
          meta: { className: column.className },
        }),
      ),
    [allSelected, someSelected, visible],
  );

  return (
    <DataTable
      columns={columns}
      data={visible}
      getRowId={(user) => user.id}
      tableClassName={TABLE_GRID_CLASS}
      rowClassName={TABLE_ROW_CLASS}
      countLabel="Users in view"
      empty={
        <EmptyState
          icon={<SearchIcon className="size-6" />}
          title="No users match these filters"
          description="Try a different search, role, or status to see more people."
        />
      }
      renderRow={(row) => (
        <UserRow
          key={row.id}
          user={row.original}
          selected={selectedIds.includes(row.original.id)}
          onToggle={() => toggleSelected(row.original.id)}
        />
      )}
    />
  );
}
