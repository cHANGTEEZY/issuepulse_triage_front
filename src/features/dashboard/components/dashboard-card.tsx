import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function DashboardCard({
  title,
  description,
  actions,
  children,
  className,
}: DashboardCardProps) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <section
      className={cn(
        "border-border bg-card flex min-w-0 flex-col gap-5 rounded-xl border p-5 lg:p-6",
        className,
      )}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            {title && <h2 className="truncate">{title}</h2>}
            {description && (
              <p className="caption-style text-subtle">{description}</p>
            )}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
