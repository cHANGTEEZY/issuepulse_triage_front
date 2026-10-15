"use client";

import CommandSearch from "@/components/_common/command-search";
import PageHeader from "@/components/_common/page-header";
import StatusBadge from "@/components/_common/status-badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import { useCompaniesStore } from "@/features/home/stores/companies-store";
import Notifications from "./notifications/notifications";

const TABS = [
  { value: "companies", label: "Companies" },
  { value: "deals", label: "Deals" },
  { value: "forecast", label: "Forecast" },
];

export default function CompaniesHeader() {
  const activeTab = useCompaniesStore((state) => state.activeTab);
  const setActiveTab = useCompaniesStore((state) => state.setActiveTab);

  return (
    <PageHeader
      title="Companies"
      badge={<StatusBadge>Active</StatusBadge>}
      search={<CommandSearch placeholder="Search companies…" />}
      actions={<Notifications />}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-border border-b px-4">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </PageHeader>
  );
}
