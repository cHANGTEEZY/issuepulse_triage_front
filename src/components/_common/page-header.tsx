"use client";

import type { ReactNode } from "react";
import Button from "@/components/_ui/button";
import { useUiStore } from "@/features/app/stores/ui-store";
import { cn } from "@/lib/utils";
import MenuIcon from "@/public/assets/images/_common/menu.svg?react";

type PageHeaderProps = {
  title: string;
  badge?: ReactNode;
  description?: string;
  search?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export default function PageHeader({
  title,
  badge,
  description,
  search,
  actions,
  children,
  className,
}: PageHeaderProps) {
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  return (
    <header
      className={cn(
        "shrink-0",
        !children && "border-border border-b",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Button
            variant="secondary"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon aria-hidden className="size-3.5" />
          </Button>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate">{title}</h1>
              {badge}
            </div>
            {description && (
              <p className="caption-style text-subtle mt-1.5 truncate">
                {description}
              </p>
            )}
          </div>
        </div>

        {(search || actions) && (
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            {search}
            {actions}
          </div>
        )}
      </div>
      {children}
    </header>
  );
}
