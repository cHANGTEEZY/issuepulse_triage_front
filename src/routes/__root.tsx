import { Query } from "@lucasmarkes/hairline/react";
import HairlineFigure from "@/components/_common/hairline-figure";
import type { ReactNode } from "react";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import ScrollToTop from "@/components/_common/scroll-to-top";
import Button from "@/components/_ui/button";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import Providers from "@/components/providers";
import { SIDEBAR_WIDTH_SCRIPT } from "@/lib/sidebar";
import { THEME_SCRIPT } from "@/lib/theme";
import { SITE_DESCRIPTION, SITE_NAME, canonicalLink, headMeta } from "@/lib/seo";
import "@/styles.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...headMeta({
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
        path: "/",
      }),
    ],
    links: [
      ...canonicalLink("/"),
      { rel: "icon", href: "/favicon.ico" },
      { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-icon.png" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundPage,
});

function NotFoundPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <EmptyState
        illustration={<HairlineFigure figure={Query} />}
        title="Page not found"
        description="The page you are looking for has moved, or the link is broken. Head back to your issues to keep triaging."
        action={
          <Button variant="primary" size="md" href="/">
            Go to issues
          </Button>
        }
      />
    </main>
  );
}

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `history.scrollRestoration="manual";${SIDEBAR_WIDTH_SCRIPT}${THEME_SCRIPT}`,
          }}
        />
        <HeadContent />
      </head>
      <body className="relative z-0 font-sans antialiased">
        <ScrollToTop />
        <Providers>{children}</Providers>
        <Scripts />
      </body>
    </html>
  );
}
