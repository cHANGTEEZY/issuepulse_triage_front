"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/_ui/sheet";
import SidebarContent from "./sidebar-content";
import SidebarResizer from "./sidebar-resizer";
import { useUiStore } from "@/features/app/stores/ui-store";

export default function Sidebar() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  return (
    <>
      <aside className="relative hidden min-h-0 w-(--sidebar-width) shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        <SidebarContent />
        <SidebarResizer />
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[254px] max-w-[85vw] min-h-0 overflow-hidden border-sidebar-border bg-sidebar p-0"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            IssueNest repositories and triage counts
          </SheetDescription>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
