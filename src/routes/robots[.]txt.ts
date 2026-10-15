import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

const CANONICAL_HOST = new URL(SITE_URL).host;

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const host = request.headers.get("host");

        if (host !== CANONICAL_HOST) {
          return new Response("User-agent: *\nDisallow: /\n", {
            headers: { "content-type": "text/plain; charset=utf-8" },
          });
        }

        return new Response(
          `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`,
          {
            headers: {
              "content-type": "text/plain; charset=utf-8",
              "cache-control": "public, max-age=0, s-maxage=3600",
            },
          },
        );
      },
    },
  },
});
