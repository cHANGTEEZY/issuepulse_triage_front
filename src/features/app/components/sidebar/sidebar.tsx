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
      <aside className="border-sidebar-border bg-sidebar relative hidden min-h-0 w-(--sidebar-width) shrink-0 border-r lg:flex lg:flex-col">
        <SidebarContent />
        <SidebarResizer />
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="border-sidebar-border bg-sidebar min-h-0 w-[254px] max-w-[85vw] overflow-hidden p-0"
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
