"use client";

import CommandSearch from "@/components/_common/command-search";
import PageHeader from "@/components/_common/page-header";
import StatusBadge from "@/components/_common/status-badge";

export default function UsersHeader() {
  return (
    <PageHeader
      title="Users"
      badge={<StatusBadge>Active</StatusBadge>}
      search={<CommandSearch />}
    />
  );
}
