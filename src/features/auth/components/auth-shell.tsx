import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import Logo from "@/public/assets/images/_common/logo.svg?react";

type AuthShellProps = {
  children: ReactNode;
};

export default function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <a
        href="#auth-main"
        className="bg-background text-foreground focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:px-3 focus:py-2 focus:ring-2"
      >
        Skip to form
      </a>
      <header className="flex shrink-0 items-center px-6 py-5">
        <Link
          to="/login"
          className="focus-visible:ring-ring/60 flex items-center gap-2 rounded-full outline-none focus-visible:ring-2"
        >
          <Logo aria-hidden className="size-8 shrink-0 overflow-visible" />
          <span className="lead-style font-medium tracking-[-0.01em]">
            IssueNest
          </span>
        </Link>
      </header>
      <main
        id="auth-main"
        className="flex flex-1 flex-col justify-center px-6 py-10"
      >
        <div className="mx-auto w-full max-w-[22em]">{children}</div>
      </main>
    </div>
  );
}
