import type { ComponentProps, ComponentType, SVGProps } from "react";
import Button from "@/components/_ui/button";
import CountBadge from "@/components/_ui/count-badge";
import { useUiStore } from "@/features/app/stores/ui-store";
import { cn } from "@/lib/utils";

type SidebarNavItemProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  count?: number;
  active?: boolean;
  tone?: "default" | "quiet";
  iconClassName?: string;
  href?: ComponentProps<typeof Button>["href"];
  search?: Record<string, unknown>;
  params?: Record<string, string>;
};

export default function SidebarNavItem({
  icon: Icon,
  label,
  count,
  active = false,
  tone = "default",
  iconClassName,
  href,
  search,
  params,
}: SidebarNavItemProps) {
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  return (
    <li>
      <Button
        variant="nav"
        size="md"
        href={href}
        search={search}
        params={params}
        data-active={active}
        aria-current={active ? "page" : undefined}
        onClick={() => {
          if (href) setSidebarOpen(false);
        }}
        className={cn(
          "h-8 gap-2 px-2 py-0",
          tone === "quiet" && "text-subtle",
        )}
      >
        <Icon
          aria-hidden
          className={cn(
            "text-subtle ease-power3-out group-hover:text-icon group-data-[active=true]:text-icon size-3.5 shrink-0 transition-colors duration-150",
            iconClassName,
          )}
        />
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        {count !== undefined && <CountBadge>{count}</CountBadge>}
      </Button>
    </li>
  );
}
