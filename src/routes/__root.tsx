import type { ReactNode } from "react";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import ScrollToTop from "@/components/_common/scroll-to-top";
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
});

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
