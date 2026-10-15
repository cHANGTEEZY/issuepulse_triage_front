import type { ReactNode } from "react";
import CommandMenu from "@/features/home/components/command-menu/command-menu";
import AppToast from "./app-toast";
import Sidebar from "./sidebar/sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex h-dvh max-w-full overflow-hidden">
      <Sidebar />
      {children}
      <CommandMenu />
      <AppToast />
    </main>
  );
}
