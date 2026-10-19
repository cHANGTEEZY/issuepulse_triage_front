import type { ReactNode } from "react";
import CommandMenu from "@/features/home/components/command-menu/command-menu";
import AppToast from "./app-toast";
import Sidebar from "./sidebar/sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex h-dvh max-w-full overflow-clip">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-clip px-2 lg:px-6">
        {children}
      </div>
      <CommandMenu />
      <AppToast />
    </main>
  );
}
