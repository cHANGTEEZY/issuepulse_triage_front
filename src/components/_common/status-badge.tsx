import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import ActiveDot from "@/public/assets/images/companies/header/active-dot.svg?react";

type StatusBadgeProps = {
  children: ReactNode;
  className?: string;
};

export default function StatusBadge({ children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "caption-style bg-muted inline-flex shrink-0 items-center gap-0.5 rounded-full border border-line-strong py-[3px] pr-[5px] pl-[3px] whitespace-nowrap",
        className,
      )}
    >
      <ActiveDot aria-hidden className="size-3" />
      {children}
    </span>
  );
}
