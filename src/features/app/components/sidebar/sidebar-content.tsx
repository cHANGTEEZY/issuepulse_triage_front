"use client";

import { useRouterState } from "@tanstack/react-router";
import { ScrollArea } from "@/components/_ui/scroll-area";
import SidebarNavItem from "./sidebar-nav-item";
import SidebarSection from "./sidebar-section";
import SidebarUser from "./sidebar-user";
import { useIssueSummary } from "@/api/hooks/use-issues";
import { useRepositories } from "@/api/hooks/use-repositories";
import Logo from "@/public/assets/images/_common/logo.svg?react";
import ListIcon from "@/public/assets/images/companies/sidebar/list.svg?react";
import BookClosedIcon from "@/public/assets/images/companies/sidebar/book-closed.svg?react";
import AlertTriangleIcon from "@/public/assets/images/companies/sidebar/alert-triangle.svg?react";
import TargetIcon from "@/public/assets/images/companies/sidebar/target-05.svg?react";
import ClipboardIcon from "@/public/assets/images/companies/sidebar/clipboard.svg?react";
import UserPlusIcon from "@/public/assets/images/companies/sidebar/user-plus.svg?react";

export default function SidebarContent() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const summary = useIssueSummary();
  const repositories = useRepositories();
  const counts = summary.data;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2.5 px-3.5 pt-4 pb-3">
        <Logo aria-hidden className="size-7 shrink-0 overflow-visible" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="lead-style block truncate font-medium tracking-[-0.01em] text-foreground">
            IssueNest
          </span>
          <span className="caption-style text-subtle block truncate">
            Issue triage
          </span>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav aria-label="Primary" className="flex flex-col gap-1 pb-2">
          <SidebarSection>
            <SidebarNavItem
              icon={ListIcon}
              label="Issues"
              href="/"
              active={pathname === "/"}
            />
            <SidebarNavItem
              icon={BookClosedIcon}
              label="Repositories"
              href="/repositories"
              count={repositories.data?.length}
              active={pathname === "/repositories"}
            />
          </SidebarSection>

          <SidebarSection title="Triage">
            <SidebarNavItem
              icon={ClipboardIcon}
              label="Untriaged"
              href="/"
              search={{ status: "inbox" }}
              count={counts?.untriaged}
            />
            <SidebarNavItem
              icon={TargetIcon}
              label="High priority"
              href="/"
              search={{ status: "all", priority: "elevated" }}
              count={counts?.highPriority}
            />
            <SidebarNavItem
              icon={AlertTriangleIcon}
              label="Stale"
              href="/"
              search={{ status: "all", stale: true }}
              count={counts?.stale}
            />
          </SidebarSection>

          <SidebarSection title="Repositories">
            {(repositories.data ?? []).map((repository) => (
              <SidebarNavItem
                key={repository.id}
                icon={BookClosedIcon}
                label={`${repository.owner}/${repository.name}`}
                href="/"
                search={{ repositoryId: repository.id, status: "inbox" }}
              />
            ))}
            {(repositories.data ?? []).length === 0 && (
              <SidebarNavItem
                icon={BookClosedIcon}
                label="Connect a repository"
                href="/repositories"
                tone="quiet"
              />
            )}
          </SidebarSection>

          <SidebarSection>
            <SidebarNavItem
              icon={UserPlusIcon}
              label="Settings"
              href="/settings"
              tone="quiet"
              active={pathname === "/settings"}
            />
          </SidebarSection>
        </nav>
      </ScrollArea>

      <SidebarUser />
    </div>
  );
}
