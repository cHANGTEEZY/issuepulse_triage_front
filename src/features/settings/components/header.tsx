"use client";

import CommandSearch from "@/components/_common/command-search";
import PageHeader from "@/components/_common/page-header";

export default function SettingsHeader() {
  return <PageHeader title="Settings" search={<CommandSearch />} />;
}
