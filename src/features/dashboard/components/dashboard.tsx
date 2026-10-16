"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useIssueList } from "@/api/hooks/use-issues";
import {
  repositoryKeys,
  useInstallUrl,
  useRepositoryCatalog,
  useSyncRepository,
} from "@/api/hooks/use-repositories";
import PageHeader from "@/components/_common/page-header";
import { ActivityHeatmap } from "@/components/arc/activity-heatmap/activity-heatmap";
import { BarChart } from "@/components/arc/bar-chart/bar-chart";
import { ButtonGroup } from "@/components/arc/button-group/button-group";
import { DonutChart } from "@/components/arc/donut-chart/donut-chart";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { LineChart } from "@/components/arc/line-chart/line-chart";
import { MetricCard } from "@/components/arc/metric-card/metric-card";
import SegmentedControl from "@/components/arc/segmented-control/segmented-control";
import {
  RANGES,
  activityDays,
  headline,
  issueFlow,
  periodLabel,
  priorityShare,
  rangeDays,
  repositoryShare,
  statusShare,
  type RangeValue,
} from "@/features/dashboard/lib/metrics";
import DashboardCard from "./dashboard-card";

const FLOW_SERIES = [
  { key: "opened", label: "Opened", area: true },
  { key: "updated", label: "Updated", color: "var(--tag-purple-text)", area: false },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const issues = useIssueList({});
  const repositories = useRepositoryCatalog();
  const sync = useSyncRepository();
  const install = useInstallUrl();
  const [range, setRange] = useState<RangeValue>("30");
  const [syncingAll, setSyncingAll] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const issueRows = issues.data ?? [];
  const repositoryRows = repositories.data ?? [];
  const days = rangeDays(range);

  const metrics = useMemo(
    () => headline(issueRows, repositoryRows, days),
    [issueRows, repositoryRows, days],
  );
  const flow = useMemo(() => issueFlow(issueRows, days), [issueRows, days]);
  const statuses = useMemo(() => statusShare(issueRows), [issueRows]);
  const priorities = useMemo(() => priorityShare(issueRows), [issueRows]);
  const byRepository = useMemo(() => repositoryShare(issueRows), [issueRows]);
  const heatmap = useMemo(() => activityDays(issueRows), [issueRows]);

  async function syncAll() {
    setSyncingAll(true);
    try {
      for (const repository of repositoryRows) {
        await sync.mutateAsync(repository.id);
      }
    } finally {
      setSyncingAll(false);
    }
  }

  async function connect() {
    const url = await install.mutateAsync();
    window.location.assign(url);
  }

  const busy = syncingAll || sync.isPending;
  const connected = repositoryRows.length > 0;

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PageHeader
        title="Dashboard"
        description="How the backlog is moving across every connected repository."
        actions={
          <SegmentedControl
            label="Date range"
            options={RANGES.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            value={range}
            onValueChange={(value) => setRange(value as RangeValue)}
          />
        }
      />

      <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 lg:gap-6 lg:py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ButtonGroup
            label="Dashboard actions"
            variant="solid"
            items={[
              {
                id: "sync",
                label: busy ? "Syncing…" : "Sync all repositories",
                reserve: ["Syncing…", "Sync all repositories"],
                disabled: busy || !connected,
                onSelect: () => void syncAll(),
              },
              {
                id: "refresh",
                label: repositories.isRefreshing ? "Refreshing…" : "Refresh catalog",
                reserve: ["Refreshing…", "Refresh catalog"],
                disabled: repositories.isRefreshing,
                onSelect: () =>
                  void queryClient.invalidateQueries({
                    queryKey: repositoryKeys.all(),
                  }),
              },
              {
                id: "connect",
                label: install.isPending ? "Opening GitHub…" : "Connect repository",
                reserve: ["Opening GitHub…", "Connect repository"],
                disabled: install.isPending,
                onSelect: () => void connect(),
              },
            ]}
          />
          <ButtonGroup
            label="Go to"
            variant="outline"
            items={[
              {
                id: "issues",
                label: "Issues",
                onSelect: () => void navigate({ to: "/" }),
              },
              {
                id: "untriaged",
                label: "Untriaged",
                onSelect: () => void navigate({ to: "/", search: { status: "inbox" } }),
              },
              {
                id: "repositories",
                label: "Repositories",
                onSelect: () => void navigate({ to: "/repositories" }),
              },
            ]}
          />
        </div>

        {sync.isError && (
          <p className="text-destructive">Sync failed. Try again in a moment.</p>
        )}

        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(13em,1fr))]">
          <MetricCard label="Open issues" {...metrics.open} />
          <MetricCard label="New issues" {...metrics.opened} />
          <MetricCard label="Untriaged" {...metrics.untriaged} />
          <MetricCard label="High priority" {...metrics.highPriority} />
          <MetricCard label="Stale" {...metrics.stale} />
          <MetricCard label="Pull requests" {...metrics.pulls} />
          <MetricCard label="Repositories" {...metrics.repositories} />
        </div>

        <DashboardCard className="[--heatmap-surface:var(--card)]">
          <ActivityHeatmap
            days={heatmap}
            label="Issue activity over the last year"
            period="the last year"
            unit={{ one: "update", other: "updates" }}
            selectedDate={selectedDay}
            onSelectDate={setSelectedDay}
          />
        </DashboardCard>

        {!issues.isPending && issueRows.length === 0 ? (
          <DashboardCard title="Nothing to chart yet">
            <EmptyState
              title={connected ? "No issues synced" : "No repositories connected"}
              description={
                connected
                  ? "Sync a repository to pull its issues in and the charts will fill up."
                  : "Install the GitHub App on a repository to start tracking its issues here."
              }
            />
          </DashboardCard>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-6">
              <DashboardCard
                title="Issue flow"
                description="Issues opened and updated per day."
              >
                <LineChart
                  data={flow}
                  series={FLOW_SERIES}
                  label="Issues opened and updated"
                  height={240}
                  loading={issues.isPending}
                  unit=""
                />
              </DashboardCard>
              <DashboardCard
                title="Daily activity"
                description="Issues touched per day against the average."
              >
                <BarChart
                  data={flow}
                  label="Issues updated"
                  period={periodLabel(days)}
                  unit=""
                  averageLabel="Daily average"
                  valueLabel="Updated"
                  height={200}
                />
              </DashboardCard>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 lg:gap-6">
              <DashboardCard
                title="Triage status"
                description="Where every synced issue sits in the pipeline."
              >
                <DonutChart
                  data={statuses}
                  label="Issues by triage status"
                  totalLabel="Issues"
                  size={184}
                  thickness={22}
                />
              </DashboardCard>
              <DashboardCard
                title="Priority"
                description="Open issues by assigned priority."
              >
                <DonutChart
                  data={priorities}
                  label="Open issues by priority"
                  totalLabel="Open"
                  size={184}
                  thickness={22}
                />
              </DashboardCard>
              <DashboardCard
                title="By repository"
                description="Open issues across connected repositories."
                className="md:col-span-2 xl:col-span-1"
              >
                <DonutChart
                  data={byRepository}
                  label="Open issues by repository"
                  totalLabel="Open"
                  size={184}
                  thickness={22}
                  maxSegments={5}
                />
              </DashboardCard>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
