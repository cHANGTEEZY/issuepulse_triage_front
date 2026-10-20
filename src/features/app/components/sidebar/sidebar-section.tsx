import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SidebarSectionProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export default function SidebarSection({
  title,
  children,
  className,
}: SidebarSectionProps) {
  return (
    <div className={cn("flex flex-col gap-1 px-2.5 py-1.5", className)}>
      {title && (
        <span className="eyebrow-style text-faint px-2 pt-2 pb-1.5 font-medium">
          {title}
        </span>
      )}
      <ul className="flex flex-col gap-px">{children}</ul>
    </div>
  );
}
