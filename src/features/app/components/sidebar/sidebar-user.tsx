"use client";

import { useNavigate } from "@tanstack/react-router";
import { DropdownMenu } from "@/components/arc/dropdown-menu/dropdown-menu";
import Button from "@/components/_ui/button";
import { useAuthSession, useSignOut } from "@/api/hooks/use-auth";
import UserAvatar from "@/features/auth/components/user-avatar";
import { useUiStore } from "@/features/app/stores/ui-store";
import ChevronDownIcon from "@/public/assets/images/_common/chevron-down.svg?react";
import { GearIcon, LogoutIcon } from "./sidebar-icons";

export default function SidebarUser() {
  const navigate = useNavigate();
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const { data } = useAuthSession();
  const signOut = useSignOut();
  const name = data?.user.name ?? "Account";
  const email = data?.user.email ?? "";

  function closeMobile() {
    setSidebarOpen(false);
  }

  function openSettings() {
    closeMobile();
    void navigate({ to: "/settings" });
  }

  function logout() {
    signOut.mutate(undefined, {
      onSuccess: () => {
        closeMobile();
        void navigate({ to: "/login" });
      },
    });
  }

  return (
    <div className="border-sidebar-border shrink-0 border-t px-2.5 py-2">
      <DropdownMenu
        side="top"
        align="start"
        menuClassName="min-w-[var(--radix-dropdown-menu-trigger-width)]"
        trigger={
          <Button
            variant="nav"
            aria-label={`Account menu for ${name}`}
            className="group data-[state=open]:bg-sidebar-primary h-auto items-center gap-2.5 rounded-lg px-2 py-1.5"
          >
            <UserAvatar
              name={name}
              image={data?.user.image}
              className="outline-line-strong size-8"
            />
            <span className="min-w-0 flex-1 text-left">
              <span className="text-foreground block truncate text-[13px] leading-none font-medium">
                {name}
              </span>
              <span className="caption-style text-subtle group-hover:text-soft group-data-[state=open]:text-soft ease-power3-out mt-1.5 block truncate transition-colors duration-150">
                {email}
              </span>
            </span>
            <ChevronDownIcon
              aria-hidden
              className="text-subtle group-hover:text-soft ease-power3-out size-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </Button>
        }
        items={[
          {
            label: "Settings",
            icon: <GearIcon />,
            onSelect: openSettings,
          },
          {
            label: "Log out",
            icon: <LogoutIcon />,
            onSelect: logout,
            destructive: true,
            separatorBefore: true,
          },
        ]}
      />
    </div>
  );
}
