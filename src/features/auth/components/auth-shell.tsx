import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Nest } from "@/lib/hairline/figures";
import HairlineFigure from "@/components/_common/hairline-figure";
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
      <div className="flex flex-1 gap-6 px-6 pb-6 lg:pr-6 lg:pl-0">
        <main
          id="auth-main"
          className="flex flex-1 flex-col justify-center py-10"
        >
          <div className="mx-auto w-full max-w-[22em]">{children}</div>
        </main>
        <aside className="border-border bg-card hidden w-[46%] max-w-[44em] flex-col justify-between gap-8 rounded-2xl border p-10 lg:flex">
          <div className="flex flex-col gap-2">
            <p className="caption-style text-subtle">IssueNest</p>
            <h2 className="max-w-[14em] text-balance">
              Every GitHub issue, sorted in one inbox.
            </h2>
          </div>
          <HairlineFigure
            figure={Nest}
            surface="card"
            play
            label="A nest of issues, one lifted out for triage"
            className="mx-auto max-w-[36em]"
          />
          <p className="caption-style text-subtle max-w-[28em] text-pretty">
            Connect a repository, and new issues land here ready to label,
            prioritise, and assign.
          </p>
        </aside>
      </div>
    </div>
  );
}
